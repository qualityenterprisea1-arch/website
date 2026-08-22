/* Links that survive the trip from a post to a quote request.
 *
 * lib/attribution.ts already captures the first touch in the browser and files
 * it against the quote. This is the other half: every link that leaves this
 * system carries the tags that half reads, and — the part that actually matters
 * — utm_content carries the post's slug. That is what turns "Instagram sent us
 * eleven quotes" into "the flute-direction reel sent us four of them".
 *
 * Bare links are never posted. A link without utm_content is an unmeasurable
 * post, and an unmeasurable post cannot be repeated on purpose.
 */

export const SITE = "https://www.quality-enterprises.co.in";
const WHATSAPP = "919440432434"; // content/site.ts phone, digits only

/* Instagram and WhatsApp both hand us their own referrer, but only sometimes —
 * in-app browsers strip it often enough that referrer alone loses maybe a third
 * of the attribution. The tags are what make it reliable. */
export function postLink(slug, channel, { path = "/contact" } = {}) {
  const url = new URL(path, SITE);
  url.searchParams.set("utm_source", channel);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "content");
  url.searchParams.set("utm_content", slug);
  return url.toString();
}

/* Click-to-chat with the enquiry half-written.
 *
 * A person who has to compose the first message from nothing sends it maybe a
 * quarter as often as one who only has to fill three blanks. The prefill is not
 * a gimmick; it is most of the conversion.
 */
export function whatsappLink(slug, subject) {
  const text = [
    `Hi Quality Enterprises — I saw your post about ${subject}.`,
    "",
    "Size (L x W x H):",
    "What goes inside:",
    "Weight per box:",
    "Quantity per month:",
    "Printing: yes / no",
  ].join("\n");
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}#${slug}`;
}

/* Instagram allows one link in bio, so the caption CTA points at the profile and
 * the bio link carries the week's slug. Rotate it when the week's slate changes. */
export const bioLink = (slug) => postLink(slug, "instagram", { path: "/contact" });
