/* Discovery source: factoriesindia.net
 *
 * A server-rendered directory of registered Indian factories, indexed by
 * industry and district. Each entry publishes company name, phone, plant
 * address, district and often a website - which is exactly the shape a
 * corrugated-packaging prospect needs, and it needs no API key.
 *
 * Every record carries the page it was read from. Nothing is inferred.
 */

import { fetchPage } from "../enrich.mjs";

const BASE = "https://www.factoriesindia.net";

/* Industries whose output ships in corrugated packaging. Deliberately excludes
   cement, iron, steel and glass-as-bulk: they move in bags, coils and crates,
   not cartons, and salting the pipeline with them wastes every later step. */
export const INDUSTRIES = ["pharma", "food", "chemical", "cotton", "apparel", "leather",
  "plastic", "rubber", "paper", "coffee", "tea", "wood"];

/* Telangana districts within a sane lorry run of IDA Mallapur, nearest first. */
export const DISTRICTS = ["medchal–malkajgiri", "hyderabad", "ranga-reddy", "sangareddy",
  "medak", "nalgonda", "yadadri-bhuvanagiri", "mahabubnagar"];

const clean = (s) => s
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&")
  .replace(/\s+/g, " ").trim();

/* Each entry is an <h2 class="entry-title"> followed by a label/value table.
   Parsing by entry block rather than by row keeps fields attached to the right
   company when the directory omits one. */
export function parseListing(html, sourceUrl) {
  const out = [];
  const blocks = html.split(/class="entry-title"/).slice(1);
  for (const block of blocks) {
    const nameMatch = block.match(/^[^>]*>([^<]{3,200})</);
    if (!nameMatch) continue;
    const full = clean(nameMatch[1]);
    if (!full) continue;
    // The directory titles entries "Company Name, City".
    const comma = full.lastIndexOf(",");
    const company = comma > 3 ? full.slice(0, comma).trim() : full;
    const city = comma > 3 ? full.slice(comma + 1).trim() : null;

    const table = block.slice(0, block.indexOf("</table>") + 1 || 8000);
    const fields = {};
    for (const row of table.split(/<tr\b/).slice(1)) {
      const label = row.match(/<strong[^>]*>\s*([^<]{2,30})\s*<\/strong>/);
      if (!label) continue;
      const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => clean(m[1]));
      const value = cells.slice(2).join(" ").replace(/^:\s*/, "").trim();
      if (value) fields[label[1].trim().toLowerCase()] = value;
    }
    // The Website row puts its label in one <tr> and the bare URL in the next, so
    // the label/value pass above never sees it. Take any off-site URL in the block.
    const website = (block.match(/(https?:\/\/(?!(?:www\.)?factoriesindia\.net)[^\s"'<)]+)/i) || [])[1]?.replace(/[.,]$/, "") || null;
    // Skip the directory's own footer address, which otherwise gets filed as the
    // company's contact email for every entry that publishes none.
    const email = [...block.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)]
      .map((m) => m[0].toLowerCase()).find((e) => !e.endsWith("@factoriesindia.net")) || null;

    const phones = (fields.phone || "").split(/\s+(?=\d)|,|\||\/(?=\s*\d{5})/)
      .map((p) => p.trim()).filter((p) => /\d{6,}/.test(p));

    if (!company) continue;
    out.push({
      company_name: company,
      city,
      address: fields.address || null,
      district: fields.district || null,
      state: fields.state || null,
      raw_phones: phones,
      email,
      website_url: website,
      source: "factoriesindia.net",
      source_url: sourceUrl,
    });
  }
  return out;
}

/** Walk one industry x district index, following pagination. */
export async function harvest({ industry, district = null, state = "telangana", maxPages = 5, log = () => {} }) {
  const slug = district
    ? `/${industry}-factories-in-${encodeURIComponent(district)}/district`
    : `/${industry}-factories-in-${state}/state`;
  const seen = new Map();

  // page=0 and page=1 both serve the first page, so a single barren page proves
  // nothing. Stop only after two in a row.
  let barren = 0;
  for (let page = 0; page < maxPages && barren < 2; page++) {
    const url = `${BASE}${slug}${page ? `?page=${page}` : ""}`;
    const res = await fetchPage(url, 25_000);
    if (!res) { log(`  ${url} unreachable`); break; }
    const rows = parseListing(res.html, url);
    let added = 0;
    for (const row of rows) {
      const key = `${row.company_name}|${row.address || ""}`.toLowerCase();
      if (!seen.has(key)) { seen.set(key, { ...row, industry }); added++; }
    }
    log(`  ${url} -> ${rows.length} rows (${added} new)`);
    barren = added === 0 ? barren + 1 : 0;
    if (!rows.length) break;
  }
  return [...seen.values()];
}
