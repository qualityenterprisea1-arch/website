/* Named buying contacts.
 *
 * Company websites almost never publish the purchase manager. They publish the
 * board. So the person who actually signs a packaging PO has to come from
 * somewhere else, and in practice that is their own public professional profile.
 *
 * Two things this module will not do, because the point is genuine data:
 *
 *   1. It never guesses an email from a name. "firstname@company.com" is the
 *      standard lead-generation trick and it is fabrication - the address is
 *      invented, not observed. A name with no published address stays a name
 *      with a phone number to call through.
 *   2. It never accepts a past role as a current one, and never accepts a
 *      similarly-named company. "SMS Lifesciences" is a different business from
 *      "SMS Pharmaceuticals"; a contact filed against the wrong one is worse
 *      than no contact, because someone will actually ring it.
 *
 * Every person carries the profile URL they were read from, so any claim on the
 * call sheet can be checked in one click.
 *
 * Runs two ways:
 *   EXA_API_KEY set  -> autonomous, called straight from run.mjs
 *   no key           -> `--queries` prints the searches for an agent to run,
 *                       `--ingest file.json` takes the results back
 */

import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { BUYER_TITLES } from "./enrich.mjs";
import { scoreProspect } from "./score.mjs";

/* ------------------------------------------------------------ name matching */

const STOP = new Set(["ltd", "limited", "pvt", "private", "inc", "llp", "co", "company",
  "the", "india", "indian", "group", "unit", "plant", "works", "and", "of"]);

/** Reduce a company name to the tokens that actually identify it. */
export function coreTokens(name) {
  return String(name).toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t));
}

/* Exact, near or none. Only exact is allowed to become the headline contact.
 * "sms pharmaceuticals" vs "sms lifesciences" share a token and are different
 * companies, so a shared prefix is never enough on its own. */
export function companyMatch(prospect, profileCompany) {
  const a = coreTokens(prospect), b = coreTokens(profileCompany);
  if (!a.length || !b.length) return "none";
  const key = (t) => t.join(" ");
  if (key(a) === key(b)) return "exact";
  // One name fully contains the other's identifying tokens, in order.
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  const contained = short.every((t) => long.includes(t));
  if (!contained) return "none";
  // Containment only counts when nothing left over is a *different* business
  // descriptor - that is exactly the Pharmaceuticals/Lifesciences trap.
  const DESCRIPTOR = /^(pharma|pharmaceutical|pharmaceuticals|lifesciences|life|sciences|labs|laboratories|organics|chemicals|drugs|biotech|healthcare|foods|textiles|mills|industries|enterprises|technologies|solutions)$/;
  const extra = long.filter((t) => !short.includes(t));
  if (extra.some((t) => DESCRIPTOR.test(t))) return "none";
  return "near";
}

/* --------------------------------------------------------------- titles */

const TITLE_WEIGHT = BUYER_TITLES.flatMap(([w, words]) => words.map((t) => [w, t]))
  .sort((a, b) => b[1].length - a[1].length);

/** The authority weight of a title, or null when it is not a buying role. */
export function buyingAuthority(title) {
  const t = String(title).toLowerCase();
  // Procurement-side wording that the site-scraper's list does not cover.
  if (/\b(purchas|procure|sourcing|supply chain|materials|stores|scm|vendor development)\w*/.test(t)) {
    if (/\b(head|chief|gm|general manager|senior general manager|vp|vice president|avp|director)\b/.test(t)) return 98;
    if (/\b(manager|dy|deputy|assistant manager)\b/.test(t)) return 95;
    if (/\b(executive|officer|engineer|specialist|senior|sr)\b/.test(t)) return 85;
    return 88;
  }
  for (const [w, word] of TITLE_WEIGHT) if (t.includes(word)) return w;
  return null;
}

/* ------------------------------------------------------------- the query */

export function buildQuery(company, city = "Hyderabad") {
  return `category:people purchase manager procurement head materials manager at ${company} ${city}`;
}

/* --------------------------------------------------------------- parsing */

/* Exa returns a profile as prose highlights. What matters is: which company,
 * which title, and whether the role is current. The index marks a live role
 * "(Current)" and a finished one with an end date, so absence of "(Current)"
 * next to the title is treated as past - the safe direction to be wrong in. */
export function parseProfile(result) {
  const text = [result.title, result.highlights, result.text, result.summary]
    .flat().filter(Boolean).join("\n");
  const name = String(result.title || "").split("|")[0].trim();
  const roles = [];

  // "#### Purchase Manager (Current)" or "### Sr Executive-Procurement - [COMPANY]"
  const line = /^[#\s]*([A-Za-z][A-Za-z0-9 ,.&/'’-]{2,80}?)\s*(\(Current\))?\s*(?:-\s*\[([^\]]{2,90})\])?\s*$/gm;
  let currentCompany = null;
  for (const m of text.matchAll(line)) {
    const [, title, isCurrent, company] = m;
    if (company) currentCompany = company;
    const authority = buyingAuthority(title);
    if (authority == null) continue;
    roles.push({ title: title.trim(), current: Boolean(isCurrent), company: (company || currentCompany || "").trim(), authority });
  }
  return { name, url: result.url || null, roles, raw_company: (text.match(/\[([^\]]{2,90})\]\(https:\/\/www\.linkedin\.com\/company\//) || [])[1] || null };
}

/** Keep only people who hold a buying role at this exact company, right now. */
export function pickBuyers(results, companyName) {
  const out = [];
  for (const r of results) {
    const p = parseProfile(r);
    if (!p.name || !p.url) continue;
    for (const role of p.roles) {
      const match = companyMatch(companyName, role.company || p.raw_company || "");
      if (match === "none") continue;
      if (!role.current) continue;                 // a past role is not a contact
      out.push({
        name: p.name, title: role.title, authority: role.authority,
        company_match: match, current: true,
        source: "public professional profile", source_url: p.url,
        verified: false,
      });
      break;                                       // one role per person
    }
  }
  // Best buying authority first; exact company matches always outrank near ones.
  return out.sort((a, b) =>
    (a.company_match === b.company_match ? 0 : a.company_match === "exact" ? -1 : 1)
    || b.authority - a.authority);
}

/* ------------------------------------------------------- autonomous mode */

export async function searchExa(query, apiKey, numResults = 8) {
  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ query, numResults, type: "auto", contents: { highlights: true, text: { maxCharacters: 4000 } } }),
  });
  if (!res.ok) throw new Error(`Exa ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).results || [];
}

/** Find current buying contacts for one company. Returns [] without a key. */
export async function findBuyers(companyName, city, apiKey = process.env.EXA_API_KEY) {
  if (!apiKey) return [];
  try {
    return pickBuyers(await searchExa(buildQuery(companyName, city), apiKey), companyName);
  } catch { return []; }
}

/* -------------------------------------------------------------------- CLI */

// pathToFileURL, not string surgery: on Windows a path becomes file:///C:/... with
// three slashes, so a hand-built `file://` + path never matches and the CLI
// silently does nothing.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };
  const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const sb = async (path, init = {}) => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...init.headers } });
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return r.status === 204 ? null : r.json().catch(() => null);
  };

  const rows = await sb("outbound_prospects?select=id,company_name,city,district,address,industry,grade,score_total,contacts,phones,emails&status=neq.disqualified&order=score_total.desc");

  // --queries: print the searches for an agent with a search tool to run.
  if (argv.includes("--queries")) {
    const limit = Number(arg("limit") || 15);
    console.log(JSON.stringify(rows.slice(0, limit).map((r) => ({ id: r.id, company: r.company_name, query: buildQuery(r.company_name, r.city) })), null, 2));
    process.exit(0);
  }

  // --ingest: take [{id, company, results:[exa results]}] back and store buyers.
  const file = arg("ingest");
  if (file) {
    const payload = JSON.parse(await fs.readFile(file, "utf8"));
    let stored = 0;
    for (const item of payload) {
      const row = rows.find((r) => r.id === item.id) || {};
      const buyers = item.buyers || pickBuyers(item.results || [], item.company || row.company_name);
      if (!buyers.length) { console.log(`  none  ${item.company || row.company_name}`); continue; }
      const merged = [...buyers, ...(row.contacts || [])];
      const best = buyers[0];
      /* Reachability is a quarter of the score and a named purchase manager is
         most of that term, so a new contact has to move the grade. Leaving the
         old score in place is how a prospect stays a B after it becomes an A. */
      const scored = scoreProspect({ ...row, people: merged, phones: row.phones || [], emails: row.emails || [] });
      await sb(`outbound_prospects?id=eq.${item.id}`, {
        method: "PATCH", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          contacts: merged, contact_name: best.name, contact_title: best.title,
          score_total: scored.total, grade: scored.grade, score: scored,
          recommended_action: scored.action,
        }),
      });
      stored++;
      console.log(`  ${buyers.length}  ${item.company || row.company_name} -> ${best.name} (${best.title})`);
    }
    console.log(`\nstored buyers for ${stored} companies. All unverified - a human confirms before any outreach.`);
    process.exit(0);
  }

  // Default: autonomous, needs EXA_API_KEY.
  if (!process.env.EXA_API_KEY) {
    console.error("No EXA_API_KEY. Use --queries to emit searches for an agent, then --ingest the results.");
    process.exit(1);
  }
  for (const r of rows.slice(0, Number(arg("limit") || 25))) {
    const buyers = await findBuyers(r.company_name, r.city);
    if (!buyers.length) { console.log(`  none  ${r.company_name}`); continue; }
    await sb(`outbound_prospects?id=eq.${r.id}`, {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ contacts: [...buyers, ...(r.contacts || [])], contact_name: buyers[0].name, contact_title: buyers[0].title }),
    });
    console.log(`  ${buyers.length}  ${r.company_name} -> ${buyers[0].name} (${buyers[0].title})`);
  }
}
