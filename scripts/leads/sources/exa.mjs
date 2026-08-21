/* Discovery source: Exa company search.
 *
 * The factory directory is a fixed register — it lists what it lists, and for
 * Telangana that is about thirty companies. This source is unbounded: it asks
 * for the kind of business that buys cartons, in the places worth delivering
 * to, and returns whoever is on the open web.
 *
 * It finds a company and a website. It does not find an address or a phone —
 * enrichSite() reads those off the company's own site afterwards, so nothing
 * here is invented.
 *
 * Needs EXA_API_KEY. Without it the module yields nothing and the sweep carries
 * on with the directory alone.
 */

const ENDPOINT = "https://api.exa.ai/search";

/* Query by what a business MAKES, never by "packaging". A query mentioning
   packaging returns box makers — competitors — and they then have to be
   disqualified one by one, burning a request each. */
export const SEGMENTS = [
  ["food", "food processing, snacks, spices, sweets or namkeen manufacturer with its own factory"],
  ["food", "dairy, beverage, bakery or confectionery manufacturing company"],
  ["food", "agri produce, rice, pulses or edible oil processing mill"],
  ["pharma", "pharmaceutical formulations manufacturer making tablets, capsules or syrups"],
  ["pharma", "nutraceutical, ayurvedic or health supplement manufacturing company"],
  ["cosmetic", "cosmetics, soap, detergent or personal care products manufacturer"],
  ["electronics", "electronics, electrical appliance or LED lighting manufacturer"],
  ["auto", "auto components, castings or engineering products manufacturer"],
  ["apparel", "garment, hosiery or textile manufacturing company"],
  ["leather", "footwear or leather goods manufacturer"],
  ["plastic", "moulded plastic products or houseware manufacturer"],
  ["chemical", "paints, adhesives, lubricants or speciality chemicals manufacturer"],
  ["hardware", "hardware, sanitaryware, tiles or building products manufacturer"],
  ["ecommerce", "consumer brand that manufactures and ships its own products direct to customers"],
];

/* Nearest first. The corridor terms matter most: a plant on the same road is
   worth more than a bigger one across the state, so it gets asked about
   explicitly rather than being left to turn up in a city-wide search. */
export const AREAS = [
  "IDA Mallapur Nacharam Uppal Cherlapally Hyderabad",
  "Medchal Malkajgiri district Telangana",
  "Jeedimetla Balanagar Kukatpally Hyderabad",
  "Hyderabad Telangana",
  "Patancheru Pashamylaram Sangareddy Telangana",
];

/* Pages that are about a company but are not the company. Storing an aggregator
   page as the prospect's website means every later enrichment reads the
   aggregator's phone number instead of the company's. */
const NOT_A_COMPANY_SITE = /^(www\.)?(indiamart|tradeindia|exportersindia|justdial|dnb|zaubacorp|tofler|thecompanycheck|yappe|ibphub|appointdistributors|connect2india|sulekha|grotal|tradeford|go4worldbusiness|manta|kompass|eximpedia|volza|instafinancia|companydetails|falconebiz|quickcompany|blinkvisa|linkedin|facebook|instagram|twitter|x|youtube|wikipedia|glassdoor|indeed|naukri|crunchbase|bloomberg|reuters|moneycontrol|economictimes|business-standard|nseindia|bseindia|slideshare|scribd|amazon|flipkart|google|blogspot|wordpress|medium)\./i;

const looksLikeFile = (u) => /\.(pdf|docx?|xlsx?|pptx?|zip)(\?|$)/i.test(u);

export async function searchCompanies(query, apiKey, numResults = 10) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ query, numResults, type: "auto" }),
  });
  if (!res.ok) throw new Error(`Exa ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).results || [];
}

/** A company name from a page title, or null if the title is not one. */
export function nameFromTitle(title, url) {
  let t = String(title || "").trim();
  if (!t) { try { return new URL(url).hostname.replace(/^www\./, "").split(".")[0]; } catch { return null; } }
  // "Home | Shri Amit Industries", "About - Radiant", ":: Balaji Foods : :"
  t = t.replace(/[:|]+\s*$/, "").replace(/^[:\s|]+/, "");
  const parts = t.split(/\s*[|:–—]\s*|\s*-\s*(?=[A-Z])/).map((x) => x.trim()).filter(Boolean);
  const junk = /^(home|about|about us|welcome|contact|products|index|profile|company|manufacturer[s]?)$/i;
  const pick = parts.find((x) => !junk.test(x) && x.length > 2);
  // A page titled only "About" or "Home" names nothing. Fall back to the domain
  // rather than storing a prospect called "About".
  if (!pick) { try { return new URL(url).hostname.replace(/^www\.|\.(com|in|net|org|co\.in).*$/g, ""); } catch { return null; } }
  // Decorative colons and pipes wrap plenty of Indian company titles (":: Balaji
  // Foods : :"), and they survive the split because they are separated by spaces.
  const name = pick.replace(/^["“‘']+|["”’']+$/g, "").replace(/^welcome to\s+/i, "").replace(/^[\s:|.\-–—]+|[\s:|.\-–—]+$/g, "").replace(/\s{2,}/g, " ").trim();
  if (!name || name.length < 3 || name.length > 70) return null;
  return name;
}

/**
 * Walk the segment x area matrix and return candidate companies.
 * Yields { company_name, website_url, industry, source, source_url }.
 */
export async function harvestExa({ apiKey = process.env.EXA_API_KEY, segments = SEGMENTS, areas = AREAS,
  perQuery = 10, log = () => {} } = {}) {
  if (!apiKey) { log("  [exa] no EXA_API_KEY, skipping"); return []; }
  const seen = new Map();

  for (const [industry, what] of segments) {
    for (const area of areas) {
      const query = `category:company ${what} in ${area}`;
      let results = [];
      try { results = await searchCompanies(query, apiKey, perQuery); }
      catch (e) { log(`  [exa] ${industry}/${area.slice(0, 22)}: ${e.message}`); continue; }

      let added = 0;
      for (const r of results) {
        let host;
        try { host = new URL(r.url).hostname.toLowerCase(); } catch { continue; }
        if (NOT_A_COMPANY_SITE.test(host) || looksLikeFile(r.url)) continue;
        const key = host.replace(/^www\./, "");
        if (seen.has(key)) continue;
        const company_name = nameFromTitle(r.title, r.url);
        if (!company_name) continue;
        /* On a real company site the name is in the domain; on a directory
           listing it is in the path (thecompanycheck.com/company/madhu-foods).
           Requiring one substantial name token in the hostname drops the
           aggregators that no blocklist will ever fully enumerate. */
        const hostWords = key.replace(/\.[a-z.]+$/, "").replace(/[^a-z0-9]/g, "");
        const tokens = company_name.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
        if (tokens.length && !tokens.some((w) => hostWords.includes(w))) continue;
        seen.set(key, {
          company_name,
          website_url: `https://${key}/`,
          city: null, address: null, district: null, raw_phones: [], email: null,
          industry,
          source: "exa",
          source_url: r.url,
        });
        added++;
      }
      log(`  [exa] ${industry} / ${area.slice(0, 26)} -> ${results.length} results, ${added} new`);
    }
  }
  return [...seen.values()];
}
