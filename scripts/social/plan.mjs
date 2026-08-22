#!/usr/bin/env node
/* Turn the subject bank into a dated, linked, reviewable queue.
 *
 *   node scripts/social/plan.mjs --dry              show the next four weeks
 *   node --env-file=C:/qe-leads-dashboard/.env scripts/social/plan.mjs --weeks 12
 *
 * Composition happens here and nowhere else. The caption is assembled from the
 * bank's parts by string concatenation — no model is called at plan time, on
 * purpose. Everything this writes is traceable to a line somebody wrote and
 * checked, which is the only way a factory's account stays free of invented
 * certifications.
 *
 * It writes rows and nothing else. It does not post, and there is no code path
 * in this repo that does.
 */

import { BANK, BASE_TAGS, CTAS, PILLARS, SEARCH, altText } from "./bank.mjs";
import { postLink, whatsappLink } from "./links.mjs";
import { renderAll } from "./platforms.mjs";

const argv = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n) => argv.includes(`--${n}`);

const opts = {
  // Default is the whole bank, so adding pieces does not silently leave the
  // last week unqueued.
  weeks: Number(flag("weeks", String(Math.ceil(BANK.length / 4)))),
  from: flag("from", null),
  dry: has("dry"),
};

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!opts.dry && (!SUPABASE_URL || !SERVICE_KEY)) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (or pass --dry).");
  process.exit(1);
}

/* ------------------------------------------------------------------ dates */

/** The Monday of the week containing `d`, so a slate always starts the week. */
function monday(d) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const shift = (x.getUTCDay() + 6) % 7; // Sunday(0) -> 6, Monday(1) -> 0
  x.setUTCDate(x.getUTCDate() - shift);
  return x;
}
const iso = (d) => d.toISOString().slice(0, 10);

const start = monday(opts.from ? new Date(`${opts.from}T00:00:00Z`) : new Date());

/* -------------------------------------------------------------- composing */

/* `{{link}}` stays a token in the stored caption rather than a resolved URL.
 * The same piece goes to five places and each needs its own utm_source, so the
 * substitution happens where the copy button is. Resolving it here would mean
 * five near-identical captions in the table and one of them being posted to the
 * wrong channel eventually. */
const TOKEN = "{{link}}";

function compose(entry) {
  const cta = (CTAS[entry.cta] || CTAS.quote)(TOKEN);
  const tags = [...BASE_TAGS, ...(entry.tags || [])].map((t) => `#${t}`).join(" ");
  return [entry.hook, entry.body.join("\n\n"), cta, tags].join("\n\n");
}

/** The channel-neutral link. The dashboard swaps utm_source per channel. */
function baseLink(entry) {
  return entry.cta === "whatsapp"
    ? whatsappLink(entry.slug, entry.title.toLowerCase())
    : postLink(entry.slug, "social");
}

function row(entry, i) {
  const week = new Date(start);
  week.setUTCDate(week.getUTCDate() + Math.floor(i / 4) * 7);
  return {
    slug: entry.slug,
    week_of: iso(week),
    slot: (i % 4) + 1,
    pillar: PILLARS[entry.pillar] || entry.pillar,
    kind: entry.kind,
    format: entry.format,
    title: entry.title,
    hook: entry.hook,
    caption: compose(entry),
    cta: entry.cta,
    hashtags: [...BASE_TAGS, ...(entry.tags || [])],
    shots: entry.shots || [],
    source: entry.source,
    generation: entry.gen ? { prompt: entry.gen, status: "not-started" } : {},
    link: baseLink(entry),
    /* Each platform gets its own link, tagged with its own utm_source, so the
       channel named in the quote is the channel the text was actually posted
       to. WhatsApp keeps the chat link, which carries the slug in its fragment
       rather than a query string. */
    platforms: renderAll(entry, (channel) =>
      entry.cta === "whatsapp" || channel === "whatsapp"
        ? whatsappLink(entry.slug, entry.title.toLowerCase())
        : postLink(entry.slug, channel)),
    // `status` is deliberately absent. On insert the column defaults to
    // 'queued'; on a --refresh it is left alone, so re-running the planner can
    // never drag a piece somebody already approved back into the queue.
  };
}

const rows = BANK.slice(0, opts.weeks * 4).map(row);

/* ------------------------------------------------------------------ sanity */

/* A slug appearing twice means two pieces would fight over the same attribution
 * row, and the quote counts would silently be wrong rather than obviously so. */
const seen = new Set();
for (const r of rows) {
  if (seen.has(r.slug)) { console.error(`Duplicate slug in bank: ${r.slug}`); process.exit(1); }
  seen.add(r.slug);
  if (!/^[a-z0-9-]{3,60}$/.test(r.slug)) { console.error(`Bad slug: ${r.slug}`); process.exit(1); }
  if (r.caption.length > 2200) { console.error(`Caption too long for Instagram: ${r.slug}`); process.exit(1); }
  if (r.source === "footage" && r.shots.length === 0) {
    console.error(`${r.slug} claims footage but names no shots — it would have nothing to cut.`);
    process.exit(1);
  }
  if (r.source === "generated" && !r.generation.prompt) {
    console.error(`${r.slug} is generated but carries no prompt.`);
    process.exit(1);
  }
  /* Without a query there is no YouTube title and no answer for an AI overview
     to quote — the piece would go out with the search layer missing and nobody
     would notice for months. */
  if (!SEARCH[r.slug]?.q) { console.error(`${r.slug} has no search query in SEARCH.`); process.exit(1); }
}

/* Fold and limit problems are advisory, not fatal: a hook two characters over
   Instagram's fold is a judgement call for whoever is posting, not a reason to
   refuse to write the row. */
const folds = rows.flatMap((r) =>
  Object.entries(r.platforms).flatMap(([p, v]) => (v.warnings ?? []).map((w) => `  ${r.slug} / ${p}: ${w}`)));
if (folds.length) console.error(`${folds.length} caption warning(s):\n${folds.join("\n")}\n`);

/* --------------------------------------------------------------- reporting */

if (opts.dry) {
  let week = "";
  for (const r of rows) {
    if (r.week_of !== week) { week = r.week_of; console.log(`\n── week of ${week} ──────────────────────────────`); }
    const badge = r.kind === "video" ? "VIDEO" : "POST ";
    const src = r.source === "footage" ? `shots ${r.shots.join(",")}` : r.source;
    console.log(`  ${badge} ${r.format.padEnd(8)} ${r.title}`);
    console.log(`        ${r.pillar} · ${src}`);
  }
  const needed = [...new Set(rows.flatMap((r) => r.shots))].sort((a, b) => a - b);
  console.log(`\n${rows.length} pieces · ${rows.filter((r) => r.kind === "video").length} videos · shots needed: ${needed.join(", ")}`);
  console.log("Nothing written (--dry).");
  process.exit(0);
}

/* ------------------------------------------------------------------ write */

/* Default is insert-only. A row already in the table has probably been edited by
 * whoever was going to post it, and silently replacing their wording with the
 * bank's is the kind of helpfulness that gets a tool switched off.
 *
 * `--refresh` is the deliberate opposite: push reworded captions over the top.
 * Even then `status` and `posted_at` survive, because they are not in the
 * payload at all. */
const resolution = has("refresh") ? "merge-duplicates" : "ignore-duplicates";
const res = await fetch(`${SUPABASE_URL}/rest/v1/social_posts?on_conflict=slug`, {
  method: "POST",
  headers: {
    apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: `resolution=${resolution},return=minimal`,
  },
  body: JSON.stringify(rows),
});

if (!res.ok) {
  console.error(`Supabase ${res.status}: ${(await res.text()).slice(0, 400)}`);
  process.exit(1);
}

console.log(`Queued ${rows.length} pieces, ${iso(start)} onward. Review them at /leads → Content.`);
