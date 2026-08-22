/* One piece, five platforms, five different jobs.
 *
 * The same caption pasted everywhere is the tell that nobody is really running
 * the account. Not because of some rule about "native content" — because the
 * platforms genuinely differ in what they truncate, what they index, what they
 * make clickable, and who is reading:
 *
 *   Instagram   ~125 characters before "more". No clickable link. Alt text is
 *               indexed. Six tags beats thirty; thirty now reads as a page
 *               nobody is home at.
 *   Facebook    Links are clickable and previewed. Truncates around 80
 *               characters on a phone. Hashtags do almost nothing.
 *   LinkedIn    The audience is the purchase manager the outbound pipeline
 *               already names. Roughly 200 characters before "see more", so the
 *               first line has to carry the whole idea. Three tags, CamelCase.
 *   YouTube     Search, not feed. The title should be the query, and the first
 *               two lines of the description should answer it outright — that
 *               is the text that gets pulled into a result, an AI overview or
 *               an assistant's reply. Tags are a separate field.
 *   WhatsApp    People who already know you. No hashtags, no marketing voice,
 *               and the link opens a chat rather than a page.
 *
 * The answer-first structure is the whole AEO play and it costs nothing: state
 * the answer in a sentence, then explain. A page that buries its answer under a
 * preamble cannot be quoted by anything, human or machine.
 */

import { SEARCH, PILLARS, altText } from "./bank.mjs";

/* Tag pools. Small, real, and the ones a Hyderabad packaging buyer would
 * plausibly follow — not the reach-chasing generics. */
const TAGS = {
  core: ["corrugatedboxes", "packaging", "cartons", "boxmanufacturer"],
  local: ["hyderabad", "telangana", "idamallapur", "hyderabadbusiness"],
  trade: ["manufacturing", "msme", "supplychain", "logistics", "industrialpackaging", "packagingdesign"],
};

/* Tags follow the pillar, so a spec-school post and a factory post do not carry
 * an identical block. Identical tag blocks across every post is one of the
 * things platforms themselves treat as a spam signal. */
const BY_PILLAR = {
  "How a box works": ["corrugatedboxes", "packaging", "manufacturing", "boxmanufacturer", "hyderabad", "industrialpackaging"],
  "Format file":     ["packaging", "cartons", "packagingdesign", "corrugatedboxes", "hyderabad", "msme"],
  "Spec school":     ["packaging", "supplychain", "msme", "corrugatedboxes", "hyderabad", "logistics"],
  "The real thing":  ["manufacturing", "corrugatedboxes", "hyderabad", "idamallapur", "msme", "boxmanufacturer"],
};

const CAMEL = {
  corrugatedboxes: "CorrugatedPackaging", packaging: "Packaging", cartons: "Cartons",
  boxmanufacturer: "Manufacturing", hyderabad: "Hyderabad", telangana: "Telangana",
  idamallapur: "Hyderabad", hyderabadbusiness: "Hyderabad", manufacturing: "Manufacturing",
  msme: "MSME", supplychain: "SupplyChain", logistics: "Logistics",
  industrialpackaging: "IndustrialPackaging", packagingdesign: "PackagingDesign",
};

export const PLATFORMS = {
  instagram: { limit: 2200, fold: 125, tags: 6, link: "bio" },
  facebook:  { limit: 2000, fold: 80,  tags: 2, link: "inline" },
  linkedin:  { limit: 3000, fold: 200, tags: 3, link: "comment" },
  youtube:   { limit: 5000, fold: 100, tags: 3, link: "inline" },
  whatsapp:  { limit: 700,  fold: 300, tags: 0, link: "chat" },
};

const pillarTags = (entry, n) => (BY_PILLAR[PILLARS[entry.pillar] ?? entry.pillar] ?? TAGS.core).slice(0, n);

/* The answer, stated outright, in at most two sentences.
 *
 * This is what an assistant quotes and what a search result shows. It is taken
 * from the body copy rather than written separately, so there is exactly one
 * place a claim can be wrong. */
export function answer(entry) {
  // Only ever the opening paragraph, so that a description can print the answer
  // and then continue from body[1] without saying the same thing twice.
  const sentences = entry.body[0].replace(/\s+/g, " ").split(/(?<=\.)\s+/);
  return sentences.slice(0, 2).join(" ");
}

/* The rest of the piece after the answer has been stated. */
const detail = (entry) => (entry.body.length > 1 ? entry.body.slice(1) : entry.body).join("\n\n");

/* YouTube titles are queries, not headlines. The bank's title is written for a
 * feed, where a person is already scrolling; a search title has to contain the
 * words somebody typed. Capitalise the question and keep it under 60 so it is
 * not clipped in results. */
function youtubeTitle(entry) {
  const q = SEARCH[entry.slug]?.q ?? entry.title;
  const asked = q.charAt(0).toUpperCase() + q.slice(1);
  const withMark = /^(what|why|how|which|do|does|is|are|should|can|where|when)\b/i.test(q) ? `${asked}?` : asked;
  return withMark.length <= 70 ? withMark : `${asked.slice(0, 66).trimEnd()}…`;
}

/**
 * Render one piece for one platform.
 *
 * `link` is already channel-tagged by the caller — utm_source has to match the
 * platform the text is going to, or the attribution names the wrong channel.
 */
export function render(entry, platform, link) {
  const p = PLATFORMS[platform];
  if (!p) throw new Error(`Unknown platform: ${platform}`);

  const q = SEARCH[entry.slug]?.q ?? "";
  const ans = answer(entry);
  const alt = altText(entry);
  const tags = pillarTags(entry, p.tags);
  const warnings = [];

  let text;
  let extra = {};

  if (platform === "youtube") {
    /* Description order is deliberate: answer, then detail, then the link, then
     * the query in plain words. Nothing decorative above the fold. */
    text = [
      ans,
      "",
      detail(entry),
      "",
      `Written quote in 4 working hours. Minimum 500 boxes.`,
      link,
      "",
      "Quality Enterprises — corrugated boxes, Road No. 13, Plot 75A, IDA Mallapur, Hyderabad 500076. Mon-Sat 9:30-18:30.",
      "",
      tags.map((t) => `#${t}`).join(" ") + (entry.format === "reel" || entry.format === "short" ? " #Shorts" : ""),
    ].join("\n");
    extra = {
      title: youtubeTitle(entry),
      /* The tags field is a separate box in the upload form, comma separated.
       * Whole phrases only — single words chopped out of the query ("makes",
       * "strong") match nothing anybody searches for and dilute the ones that
       * do. */
      keywords: [
        q,
        entry.title.toLowerCase().replace(/[—,]/g, "").replace(/\s+/g, " "),
        "corrugated boxes hyderabad",
        "box manufacturer hyderabad",
        "corrugated packaging india",
      ].join(", ").slice(0, 480),
    };
    if (extra.title.length > 60) warnings.push(`Title is ${extra.title.length} chars — YouTube clips around 60 in results.`);

  } else if (platform === "linkedin") {
    /* The hook alone is often too short to carry the idea past "see more", so
     * the first line here is the hook and the answer together. */
    const opener = `${entry.hook} ${ans}`.trim();
    text = [
      opener,
      "",
      detail(entry),
      "",
      "Send the size, what goes inside, the weight and how many a month — written quote in 4 working hours. Link in the first comment.",
      "",
      tags.map((t) => `#${CAMEL[t] ?? t}`).join(" "),
    ].join("\n");
    /* LinkedIn measurably suppresses posts carrying an outbound link, so the
     * link goes in the first comment. That is a real cost either way: this
     * version trades one click for the reach that makes the click possible. */
    extra = { firstComment: `Details and a written quote: ${link}` };
    if (opener.length > p.fold) warnings.push(`Opening line is ${opener.length} chars — LinkedIn folds around ${p.fold}.`);

  } else if (platform === "whatsapp") {
    /* Status is read by people who already know the factory. No hashtags, no
     * pitch, and the link opens a chat rather than a page. */
    text = [entry.hook, "", ans, "", link].join("\n");

  } else if (platform === "facebook") {
    text = [
      entry.hook,
      "",
      entry.body.join("\n\n"),
      "",
      `Written quote in 4 working hours, minimum 500 boxes. ${link}`,
      "",
      tags.map((t) => `#${t}`).join(" "),
    ].join("\n");
    if (entry.hook.length > p.fold) warnings.push(`Hook is ${entry.hook.length} chars — Facebook folds around ${p.fold} on a phone.`);

  } else {
    /* Instagram. The link is not clickable, so the caption sends people to the
     * profile and the bio link carries the slug for that week. */
    text = [
      entry.hook,
      "",
      entry.body.join("\n\n"),
      "",
      "Link in bio for a written quote in 4 working hours. Or WhatsApp the size — minimum 500 boxes.",
      "",
      tags.map((t) => `#${t}`).join(" "),
    ].join("\n");
    if (entry.hook.length > p.fold) warnings.push(`Hook is ${entry.hook.length} chars — Instagram folds at ${p.fold}.`);
  }

  if (text.length > p.limit) {
    warnings.push(`Caption is ${text.length} chars, over the ${p.limit} limit.`);
    text = text.slice(0, p.limit - 1).trimEnd() + "…";
  }

  return { platform, text, tags, alt, query: q, answer: ans, warnings, ...extra };
}

/** Every platform for one piece, keyed by name. */
export function renderAll(entry, linkFor) {
  const out = {};
  for (const name of Object.keys(PLATFORMS)) out[name] = render(entry, name, linkFor(name));
  return out;
}
