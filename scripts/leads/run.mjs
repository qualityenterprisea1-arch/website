#!/usr/bin/env node
/* The lead pipeline.
 *
 *   discover  -> official factory directory, by industry and district
 *   enrich    -> the company's own site, for phones, emails and named people
 *   score     -> corrugated-buyer model (see score.mjs for why, not just what)
 *   store     -> Supabase outbound_prospects, service role only
 *
 * It never sends anything. Outreach stays behind a human, because a bad send
 * from the verified Resend domain costs the sending reputation for every real
 * quote notification.
 *
 * Usage
 *   node scripts/leads/run.mjs                        full sweep, all industries
 *   node scripts/leads/run.mjs --industries pharma,food --districts hyderabad
 *   node scripts/leads/run.mjs --limit 25 --dry        harvest and score, no write
 *   node scripts/leads/run.mjs --reenrich              re-crawl rows older than 30d
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY unless --dry.
 */

import { harvest, INDUSTRIES, DISTRICTS } from "./sources/factoriesindia.mjs";
import { harvestExa } from "./sources/exa.mjs";
import { enrichSite, normalisePhone, isFreeMail } from "./enrich.mjs";
import { scoreProspect } from "./score.mjs";
import { findBuyers } from "./people.mjs";

/* ------------------------------------------------------------------- args */

const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const has = (name) => argv.includes(`--${name}`);

const opts = {
  industries: (flag("industries") || INDUSTRIES.join(",")).split(",").map((s) => s.trim()).filter(Boolean),
  districts: (flag("districts") || DISTRICTS.join(",")).split(",").map((s) => s.trim()).filter(Boolean),
  limit: Number(flag("limit", "0")) || 0,
  maxPages: Number(flag("pages", "6")),
  concurrency: Math.max(1, Number(flag("concurrency", "4"))),
  dry: has("dry"),
  reenrich: has("reenrich"),
  quiet: has("quiet"),
  noExa: has("no-exa"),
  exaPerQuery: Number(flag("exa-results", "10")),
};

const log = opts.quiet ? () => {} : (...a) => console.log(...a);
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!opts.dry && (!SUPABASE_URL || !SERVICE_KEY)) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (or pass --dry).");
  process.exit(1);
}

/* -------------------------------------------------------------- supabase */

async function sb(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json", ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${path}: ${(await res.text()).slice(0, 300)}`);
  return res.status === 204 ? null : res.json().catch(() => null);
}

/* ---------------------------------------------------------------- helpers */

const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, "").toLowerCase(); } catch { return null; } };

/* One company can appear once per plant. Collapse on the website domain when
   there is one, otherwise on the company name, and keep the plant count -
   multiple plants is a real scale signal, not noise to be thrown away. */
function dedupe(rows) {
  const byKey = new Map();
  for (const row of rows) {
    const key = hostOf(row.website_url) || row.company_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!key) continue;
    const prev = byKey.get(key);
    if (!prev) { byKey.set(key, { ...row, plants: 1, addresses: [row.address].filter(Boolean) }); continue; }
    prev.plants += 1;
    if (row.address && !prev.addresses.includes(row.address)) prev.addresses.push(row.address);
    // Keep the record that carries the most detail.
    if (!prev.email && row.email) prev.email = row.email;
    if (!prev.raw_phones?.length && row.raw_phones?.length) prev.raw_phones = row.raw_phones;
    // A plant address inside the home corridor beats a registered-office address.
    if (row.address && /mallapur|mallpur|nacharam|uppal|cherlapal/i.test(row.address)) prev.address = row.address;
    // The directory titles some rows by plant ("Plant 1"); prefer a real name.
    if (/^(plant|unit)\s*[-\d]/i.test(prev.company_name) && !/^(plant|unit)\s*[-\d]/i.test(row.company_name)) {
      prev.company_name = row.company_name;
    }
  }
  return [...byKey.values()];
}

/** Run an async mapper over a list with a fixed worker pool. */
async function pool(items, workers, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(workers, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      try { out[i] = await fn(items[i], i); } catch (e) { out[i] = { error: String(e?.message || e) }; }
    }
  }));
  return out;
}

/* ------------------------------------------------------------- the stages */

async function discover() {
  const rows = [];
  for (const industry of opts.industries) {
    for (const district of opts.districts) {
      log(`[discover] ${industry} / ${district}`);
      rows.push(...await harvest({ industry, district, maxPages: opts.maxPages, log }));
    }
    // The state-level index carries plants the district pages miss.
    rows.push(...await harvest({ industry, district: null, maxPages: opts.maxPages, log }));
  }
  /* The directory is a fixed register and lists what it lists. Exa is unbounded
     and finds companies by what they make, so the two together cover far more
     of the market than either alone. Exa rows arrive with no address - the site
     crawl supplies one, and a prospect with no address is disqualified rather
     than guessed at. */
  if (!opts.noExa) {
    log("[discover] exa company search");
    rows.push(...await harvestExa({ perQuery: opts.exaPerQuery, log }));
  }
  log(`[discover] ${rows.length} raw rows -> ${dedupe(rows).length} companies`);
  return dedupe(rows);
}

async function buildProspect(row) {
  // Hyderabad landlines are printed locally; only assume 040 when the address
  // proves the city, never as a blanket default.
  const std = /hyderabad|secunderabad|medchal|malkajgiri|ranga\s*reddy/i.test(`${row.address || ""} ${row.district || ""} ${row.city || ""}`) ? "040" : null;

  const directoryPhones = (row.raw_phones || [])
    .map((p) => ({ phone: normalisePhone(p, std), via: "directory", source_url: row.source_url }))
    .filter((p) => p.phone);

  let site = { ok: false, phones: [], emails: [], people: [], pages: [] };
  if (row.website_url) site = await enrichSite(row.website_url).catch(() => site);

  const phones = [...new Map([...directoryPhones, ...site.phones.map((p) => ({ ...p }))].map((p) => [p.phone, p])).values()];
  const emails = [...new Map([
    ...(row.email ? [{ email: row.email.toLowerCase(), score: 30, source_url: row.source_url }] : []),
    ...site.emails,
  ].map((e) => [e.email, e])).values()]
    .filter((e) => !isFreeMail(e.email) || e.score >= 70)
    .sort((a, b) => b.score - a.score);

  /* A company site publishes its board, not its purchase manager. Public
     professional profiles are where the person who signs the PO actually is,
     so they outrank anything scraped off an About page. Inert without
     EXA_API_KEY - see scripts/leads/people.mjs. */
  const buyers = await findBuyers(row.company_name, row.city || "Hyderabad");
  const people = [...buyers, ...site.people];
  const best = people[0] || null;

  /* The directory titles many rows by plant - "Plant 1", "Api Hyderabad 3" -
     which is not a name anyone can use on a call. Prefer what the company calls
     itself on its own homepage when the directory name is clearly a plant label. */
  const stripUnit = (n) => n.replace(/[,\s]*[-–—]?\s*unit\s*[-–—]?\s*[IVXivx\d]+\.?\s*$/i, "").replace(/[,\s]+$/, "");
  // Only fall back to the homepage title when the directory gave nothing but a
  // plant label. "Shilpa Medicare Ltd., Unit VII" is a real name with a suffix -
  // strip the suffix, do not throw the name away for whatever the <title> says.
  /* A real company name carries a legal-entity marker or is long enough to be
     one. "Tea Factory", "Biologics", "Jeedimetla" are plant labels the directory
     used because the entry had no company name of its own. */
  const hasEntityMarker = /\b(ltd|limited|pvt|private|inc|llp|industries|enterprises|corporation|company|co|labs|laboratories|pharma|foods|mills|&)\b/i.test(row.company_name);
  const isPlantLabel = /^(plant|unit|api|works|factory)\b/i.test(row.company_name)
    || (!hasEntityMarker && row.company_name.trim().split(/\s+/).length <= 3);
  const company_name = isPlantLabel && site.siteName ? site.siteName : stripUnit(row.company_name);

  const prospect = {
    company_name,
    // The unique key. A directory entry with no website still needs one, and a
    // urn makes it obvious in the dashboard that there is no site to visit.
    website_url: row.website_url || `urn:qe:no-website:${encodeURIComponent(row.company_name.toLowerCase())}`,
    city: row.city || "Hyderabad",
    district: row.district || null,
    // Exa gives a company and a website, never an address. The site does.
    address: row.address || row.addresses?.[0] || site.address?.address || null,
    industry: row.industry || null,
    description: null,
    contact_name: best?.name || null,
    contact_title: best?.title || null,
    contact_email: emails[0]?.email || null,
    contact_phone: phones[0]?.phone || null,
    phones,
    emails,
    contacts: people,
    plants: row.plants || 1,
    source: row.source,
    source_url: row.source_url,
  };

  const scored = scoreProspect({ ...prospect, people });
  return {
    ...prospect,
    score_total: scored.total,
    grade: scored.grade,
    proximity_band: scored.proximity_band || null,
    recommended_action: scored.action,
    disqualified_reason: scored.disqualified,
    status: scored.disqualified ? "disqualified" : "new",
    is_verified: false,
    score: scored,
    analysis: { plants: prospect.plants, addresses: row.addresses || [] },
    evidence: { pages_crawled: site.pages, people_found: people, buyers_from_profiles: buyers.length, site_reachable: site.ok, reason: site.reason || null },
    last_enriched_at: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------- main */

const started = Date.now();

/* --rescore re-runs enrichment and scoring over rows already in the table and
   nothing else. Use it after changing the scoring model, so old rows stop being
   judged by a model that no longer exists - which is exactly how the previous
   pipeline left three prospects sitting at grade D forever. */
if (opts.reenrich || has("rescore")) {
  const existing = await sb("outbound_prospects?select=id,company_name,website_url,city,district,address,industry,source,source_url,phones,emails,contacts,contact_phone,contact_email&order=created_at");
  log(`[rescore] ${existing.length} existing rows`);
  const rebuilt = await pool(existing, opts.concurrency, async (r) => {
    const p = await buildProspect({
      company_name: r.company_name,
      website_url: r.website_url?.startsWith("urn:") ? null : r.website_url,
      city: r.city, district: r.district, address: r.address, industry: r.industry,
      // Feed the stored numbers back in as directory input. A rescore that
      // re-crawls a site which happens to be down must never delete contacts a
      // previous run legitimately found - merge, never replace.
      raw_phones: (r.phones || []).map((x) => x.phone).filter(Boolean),
      email: r.contact_email || null,
      source: r.source || "rescore", source_url: r.source_url, plants: 1,
    });
    // Union the stored evidence back over the fresh crawl.
    const phones = [...new Map([...(r.phones || []), ...p.phones].map((x) => [x.phone, x])).values()];
    const emails = [...new Map([...(r.emails || []), ...p.emails].map((x) => [x.email, x])).values()]
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    const contacts = p.contacts.length ? p.contacts : (r.contacts || []);
    const best = contacts[0] || null;
    const merged = {
      ...p, id: r.id, website_url: r.website_url, phones, emails, contacts,
      contact_phone: phones[0]?.phone || null,
      contact_email: emails[0]?.email || null,
      contact_name: best?.name || null,
      contact_title: best?.title || null,
    };
    // Re-score against the merged evidence, not the thin fresh crawl.
    const rescored = scoreProspect({ ...merged, people: contacts });
    return {
      ...merged,
      score_total: rescored.total, grade: rescored.grade,
      proximity_band: rescored.proximity_band || null,
      recommended_action: rescored.action, disqualified_reason: rescored.disqualified,
      score: rescored,
    };
  });
  const rows = rebuilt.filter((p) => p && !p.error);
  for (const p of rows) log(`  ${String(p.score_total).padStart(3)} ${p.grade}  ${p.company_name} — ${p.contact_phone || "no phone"}`);
  if (!opts.dry) {
    await sb("outbound_prospects?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(rows.map((p) => ({
        id: p.id, website_url: p.website_url, company_name: p.company_name,
        contact_name: p.contact_name, contact_title: p.contact_title, contact_email: p.contact_email,
        contact_phone: p.contact_phone, phones: p.phones, emails: p.emails, contacts: p.contacts,
        score_total: p.score_total, grade: p.grade, proximity_band: p.proximity_band,
        recommended_action: p.recommended_action, disqualified_reason: p.disqualified_reason,
        score: p.score, evidence: p.evidence, last_enriched_at: p.last_enriched_at,
      }))),
    });
    log(`[rescore] updated ${rows.length} rows`);
  }
  log(`Done in ${Math.round((Date.now() - started) / 1000)}s.`);
  process.exit(0);
}

let companies = await discover();
if (opts.limit) companies = companies.slice(0, opts.limit);

/* Columns the sweep owns. Everything a human edits - status, notes,
   is_verified, do_not_contact, outreach_draft - is deliberately absent, so a
   re-run can never overwrite someone's work. */
const WRITABLE = ["company_name", "website_url", "city", "district", "address", "industry", "description",
  "contact_name", "contact_title", "contact_email", "contact_phone", "phones", "emails", "contacts",
  "source", "source_url", "score_total", "grade", "proximity_band", "recommended_action",
  "disqualified_reason", "score", "analysis", "evidence", "last_enriched_at"];

async function store(batch) {
  if (opts.dry || !batch.length) return;
  const payload = batch.map((p) => Object.fromEntries(WRITABLE.map((k) => [k, p[k] ?? null])));
  await sb("outbound_prospects?on_conflict=website_url", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(payload),
  });
}

/* Enrich and store in batches rather than accumulating everything and writing
   once at the end. A full sweep now crawls a couple of hundred sites over the
   better part of an hour; a single write at the end means one interruption
   throws all of it away. Each completed batch is banked. */
log(`[enrich] crawling ${companies.length} company sites, ${opts.concurrency} at a time`);
const BATCH = 25;
const prospects = [];
let done = 0;
for (let i = 0; i < companies.length; i += BATCH) {
  const built = (await pool(companies.slice(i, i + BATCH), opts.concurrency, async (row) => {
    const p = await buildProspect(row);
    if (++done % 10 === 0) log(`[enrich] ${done}/${companies.length}`);
    return p;
  })).filter((p) => p && !p.error && p.company_name);
  prospects.push(...built);
  await store(built);
  log(`[store] banked ${prospects.length}/${companies.length}`);
}

const keep = prospects.filter((p) => !p.disqualified_reason);
const dropped = prospects.length - keep.length;
const withPhone = keep.filter((p) => p.phones.length).length;
const withName = keep.filter((p) => p.contact_name).length;

log(`\n[score] ${prospects.length} scored | ${dropped} disqualified | ${withPhone} with a phone | ${withName} with a named contact`);
for (const g of ["A", "B", "C", "D"]) log(`  grade ${g}: ${keep.filter((p) => p.grade === g).length}`);

const top = [...keep].sort((a, b) => b.score_total - a.score_total).slice(0, 10);
log("\nTop prospects:");
for (const p of top) {
  log(`  ${String(p.score_total).padStart(3)} ${p.grade}  ${p.company_name}`);
  log(`        ${p.proximity_band} | ${p.contact_phone || "no phone"} | ${p.contact_email || "no email"}${p.contact_name ? ` | ${p.contact_name} (${p.contact_title})` : ""}`);
}

if (opts.dry) {
  log(`\n[dry] nothing written. ${Math.round((Date.now() - started) / 1000)}s`);
  process.exit(0);
}

log(`\nDone in ${Math.round((Date.now() - started) / 1000)}s. Nothing was sent to anyone.`);
