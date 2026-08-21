/* Website enrichment: turn a domain into reachable contacts.
 *
 * Everything here is extracted from pages the company publishes about itself.
 * Nothing is inferred, generated or guessed - if a field is absent from the
 * source HTML it stays null, because a fabricated phone number is worse than a
 * missing one. Every record carries the URL it came from.
 */

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// Pages a manufacturer keeps its contact details on, best first.
const CONTACT_PATHS = ["/contact", "/contact-us", "/contactus", "/reach-us", "/get-in-touch",
  "/about", "/about-us", "/company", "/team", "/leadership", "/management", "/careers"];

/* Titles that actually sign off on a packaging order at an Indian manufacturing
   unit. Purchase/stores/materials own the PO; plant and operations own the spec;
   founders own it outright at small units. Ranked, because multi-threading a
   deal starts with the highest-authority reachable name. */
export const BUYER_TITLES = [
  [95, ["purchase manager", "purchasing manager", "procurement manager", "manager - purchase", "manager purchase", "head - purchase", "head of procurement", "purchase head", "sourcing manager"]],
  [90, ["materials manager", "stores manager", "store manager", "supply chain manager", "logistics manager", "warehouse manager", "packaging manager", "packing incharge"]],
  [85, ["purchase executive", "procurement executive", "purchase officer", "buyer", "sourcing executive"]],
  [80, ["plant head", "works manager", "factory manager", "production manager", "plant manager", "unit head", "operations manager", "operations head"]],
  [75, ["managing director", "director", "founder", "co-founder", "proprietor", "partner", "chairman", "ceo", "president", "general manager", "gm"]],
  [60, ["vice president", "vp", "head of operations", "coo", "avp"]],
  [40, ["manager", "executive", "incharge", "in-charge", "officer", "lead"]],
];

const DEPT_INBOX = [
  [90, ["purchase", "procurement", "sourcing", "buying", "stores", "materials"]],
  [70, ["plant", "works", "factory", "production", "operations", "packing", "packaging"]],
  [50, ["admin", "office", "accounts", "md", "director"]],
  [30, ["info", "contact", "sales", "enquiry", "enquiries", "mail", "hello", "support", "marketing", "hr", "careers"]],
];

const FREE_MAIL = new Set(["gmail.com", "yahoo.com", "yahoo.co.in", "hotmail.com", "outlook.com",
  "rediffmail.com", "live.com", "aol.com", "icloud.com", "protonmail.com", "ymail.com"]);

export const isFreeMail = (email) => FREE_MAIL.has(String(email).split("@")[1]?.toLowerCase() || "");

/* ---------------------------------------------------------------- fetching */

export async function fetchPage(url, timeoutMs = 15_000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal, redirect: "follow", headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" } });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("html") && !type.includes("text")) return null;
    const html = await res.text();
    // A 20 MB page is a database dump, not a contact page. Cap the work.
    return { url: res.url, html: html.slice(0, 3_000_000) };
  } catch { return null; }
  finally { clearTimeout(timer); }
}

/* ------------------------------------------------------------- extraction */

const decode = (s) => s
  .replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;|&#38;/gi, "&").replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;|&rsquo;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  // Hex entities too - &#x27; is how most CMSs write an apostrophe, and leaving
  // it raw puts "Dr. Reddy&#x27;s" on a call sheet.
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));

const textOf = (html) => decode(html
  .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ")
  .replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/* Indian phone numbers, normalised to +91XXXXXXXXXX (mobile) or +91<std><number>.
   Rejects the things that look like phone numbers and are not: PIN codes, GSTINs,
   CIN numbers, years, plot numbers and the long digit runs inside tracking ids. */
export function extractPhones(html) {
  const text = textOf(html);
  const found = new Map();

  // tel: links are the highest-confidence source - the site author marked them.
  for (const m of html.matchAll(/href=["']tel:([^"']+)["']/gi)) push(m[1], "tel-link");

  // Then free text, requiring a phone-ish prefix or a +91/0 country/trunk marker.
  const pattern = /(?:(?:\+?91|0)[\s-]?)?(?:\(?0?\d{2,4}\)?[\s-]?)?\d{3}[\s-]?\d{3,4}[\s-]?\d{0,4}/g;
  for (const m of text.matchAll(pattern)) push(m[0], "text");

  function push(raw, via) { const n = normalisePhone(raw); if (!n) return;
    const prev = found.get(n);
    if (!prev || (via === "tel-link" && prev.via !== "tel-link")) found.set(n, { phone: n, via });
  }
  return [...found.values()];
}

/* Normalise an Indian number to +91XXXXXXXXXX, or null if it is not one.
 * Returns null rather than guessing: a wrong number is worse than no number.
 *
 * @param defaultStd  Area code to assume for a bare local number. Directories
 *   print Hyderabad landlines as "27200343" with the 040 implied. Only supply
 *   this when the record's own address proves the city.
 */
export function normalisePhone(raw, defaultStd = null) {
  let d = String(raw).replace(/[^\d]/g, "");
  d = d.replace(/^0+/, "");                    // trunk prefix
  if (d.startsWith("91") && d.length > 11) d = d.slice(2);
  d = d.replace(/^0+/, "");
  if (!d) return null;
  if (/^(\d)\1{6,}$/.test(d)) return null;                       // 0000000, 9999999
  if (/^(1234567|12345678|9876543210)$/.test(d)) return null;    // placeholder rows
  // Bare local landline (6-8 digits): only usable with a known area code.
  if (d.length >= 6 && d.length <= 8) {
    if (!defaultStd) return null;
    d = String(defaultStd).replace(/^0+/, "") + d;
  }
  // Indian numbers are 10 digits after the STD/trunk, or 11 with a 2-digit STD.
  if (d.length < 10 || d.length > 11) return null;
  // A 10-digit mobile must start 6-9; anything else that long is a landline that
  // already carries its STD code, which is fine.
  return `+91${d}`;
}

export function extractEmails(html, siteDomain) {
  const text = decode(html);
  const out = new Map();
  for (const m of text.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
    const email = m[0].toLowerCase().replace(/\.$/, "");
    if (/\.(png|jpe?g|gif|webp|svg|css|js|woff2?)$/i.test(email)) return;
    if (/(sentry|wixpress|example|domain|yourmail|test)\./.test(email)) continue;
    const local = email.split("@")[0];
    let score = 20;
    for (const [s, words] of DEPT_INBOX) if (words.some((w) => local.includes(w))) { score = Math.max(score, s); break; }
    // A personal address on the company domain beats any role inbox.
    if (siteDomain && email.endsWith(`@${siteDomain}`) && !DEPT_INBOX.flatMap(([, w]) => w).some((w) => local.includes(w))) score = 80;
    if (!out.has(email) || out.get(email).score < score) out.set(email, { email, score, onDomain: siteDomain ? email.endsWith(`@${siteDomain}`) : null });
  }
  return [...out.values()].sort((a, b) => b.score - a.score);
}

/* Named person + title. Only accepts a name that sits directly beside a title we
   recognise, in either order, which is how team and contact pages are written.
   Anything looser produces garbage like "Read More, Director". */
export function extractPeople(html) {
  const text = textOf(html);
  const titles = BUYER_TITLES.flatMap(([weight, words]) => words.map((w) => [weight, w]))
    .sort((a, b) => b[1].length - a[1].length);
  const NAME = String.raw`((?:(?:Mr|Mrs|Ms|Dr|Shri|Smt)\.?\s+)?[A-Z][A-Za-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][A-Za-z]+){0,3})`;
  const ALL_TITLE_WORDS = new Set(BUYER_TITLES.flatMap(([, w]) => w).flatMap((t) => t.split(/[\s-]+/)));
  /* Words that turn a common noun pair into a fake person. "Ware House" beside
     "Executive" reads exactly like a name to the pattern; it is a department. */
  const NOISE = /\b(read|more|click|home|contact|about|privacy|terms|copyright|rights|view|learn|our|the|and|designation|profile|team|board|know|welcome|message|company|limited|private|ltd|pvt|ware|house|warehouse|quality|control|human|resource|resources|research|development|customer|service|services|corporate|office|registered|regional|branch|division|department|unit|plant|works|group|india|pharma|labs|laboratories|sales|export|import|marketing|finance|legal|technical|senior|junior|assistant|deputy|joint|chief|global|national|international|mission|protect|foundation|trust|society|committee|welfare|initiative|non|investor|investors|relations|advisory|technologies|technology|fze|llp|holdings|solutions|systems|ventures|capital|associates|consultants|biologics|sciences|life|health|healthcare|care|enterprises|industries|corporation)\b/i;
  const out = new Map();

  const accept = (name, label, weight) => {
    name = name.replace(/^(Mr|Mrs|Ms|Dr|Shri|Smt)\.?\s+/i, "").trim();
    const words = name.split(/\s+/);
    // Two real words minimum, and no word of the name may itself be a job title -
    // that is how "Managing Director" ends up filed as a person.
    if (words.length < 2 || name.length > 45) return;
    if (words.some((w) => ALL_TITLE_WORDS.has(w.toLowerCase()))) return;
    if (NOISE.test(name)) return;
    // The title regexes run case-insensitively so they catch "MANAGING DIRECTOR",
    // which also lets the name half match lowercase. Re-check capitalisation here,
    // or a sentence tail like "Gopichand i" is filed as a person. A one-letter word
    // is only allowed as an initial, i.e. written with a period.
    if (!words.every((w) => /^[A-Z]/.test(w) && (w.length > 1 || w.endsWith(".")))) return;
    if (!/[A-Za-z]{2}/.test(words.at(-1))) return;
    const key = name.toLowerCase();
    if (!out.has(key) || out.get(key).authority < weight) out.set(key, { name, title: label, authority: weight });
  };

  const SEP = String.raw`\s*[,\-–—|:()]{1,3}\s*`;
  for (const [weight, title] of titles) {
    const t = title.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`).replace(/\s+/g, String.raw`\s+`);
    // Name first: "Ramesh Babu Potluri, Managing Director"
    for (const m of text.matchAll(new RegExp(NAME + SEP + `(${t})\\b`, "gi"))) accept(m[1], m[2], weight);
    // Title first: "Managing Director: Ramesh Babu Potluri"
    for (const m of text.matchAll(new RegExp(`\\b(${t})` + SEP + NAME, "gi"))) accept(m[2], m[1], weight);
  }
  return [...out.values()].sort((a, b) => b.authority - a.authority).slice(0, 12);
}

/* The company's own name for itself. The factory directory titles many entries
   by plant ("Plant 1", "Api Hyderabad 3"), which is useless on a call sheet, so
   the homepage gets a say. og:site_name is authored; a <title> is usually
   "Company | tagline" and the first segment is the name. */
export function siteName(html) {
  const og = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']{2,80})["']/i);
  if (og) return decode(og[1]).trim();
  const title = html.match(/<title[^>]*>([^<]{2,120})<\/title>/i);
  if (!title) return null;
  let first = decode(title[1]).split(/\s*[|\-–—:]\s*/)[0].trim();
  // "Welcome to SMS Life" is a greeting, not a company name.
  first = first.replace(/^(welcome\s+to|home\s*[-–—]?\s*|official\s+(website|site)\s+of)\s+/i, "").trim();
  if (first.length < 3 || first.length > 70) return null;
  if (/^(home|welcome|index|untitled|main\s*page)$/i.test(first)) return null;
  return first;
}

/* ------------------------------------------------------------ orchestration */

const origin = (u) => { try { return new URL(u).origin; } catch { return null; } };
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return null; } };

/** Crawl a company's own site for reachable contacts. Never leaves the domain. */
export async function enrichSite(websiteUrl, { maxPages = 6 } = {}) {
  const base = origin(websiteUrl);
  if (!base) return { ok: false, reason: "bad url", phones: [], emails: [], people: [], pages: [] };
  const domain = host(websiteUrl);

  const home = await fetchPage(base);
  if (!home) return { ok: false, reason: "unreachable", phones: [], emails: [], people: [], pages: [] };

  // Prefer contact-ish links the site actually has over guessing paths.
  const linked = new Set();
  for (const m of home.html.matchAll(/href=["']([^"'#?]+)["']/gi)) {
    const href = m[1];
    if (!CONTACT_PATHS.some((p) => href.toLowerCase().includes(p.slice(1)))) continue;
    try {
      const abs = new URL(href, home.url);
      if (abs.hostname.replace(/^www\./, "") === domain) linked.add(abs.origin + abs.pathname.replace(/\/$/, ""));
    } catch { /* skip unparseable href */ }
  }
  for (const p of CONTACT_PATHS) linked.add(base + p);

  const pages = [{ url: home.url, html: home.html }];
  for (const url of [...linked].slice(0, maxPages)) {
    if (url === home.url) continue;
    const page = await fetchPage(url, 12_000);
    if (page) pages.push(page);
    if (pages.length >= maxPages) break;
  }

  const phones = new Map(), emails = new Map(), people = new Map();
  for (const page of pages) {
    for (const p of extractPhones(page.html)) if (!phones.has(p.phone) || p.via === "tel-link") phones.set(p.phone, { ...p, source_url: page.url });
    for (const e of extractEmails(page.html, domain)) if (!emails.has(e.email) || emails.get(e.email).score < e.score) emails.set(e.email, { ...e, source_url: page.url });
    for (const person of extractPeople(page.html)) {
      const key = person.name.toLowerCase();
      if (!people.has(key) || people.get(key).authority < person.authority) people.set(key, { ...person, source_url: page.url });
    }
  }

  return {
    ok: true,
    domain,
    siteName: siteName(home.html),
    phones: [...phones.values()],
    emails: [...emails.values()].sort((a, b) => b.score - a.score),
    people: [...people.values()].sort((a, b) => b.authority - a.authority),
    pages: pages.map((p) => p.url),
  };
}
