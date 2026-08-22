"use client";

/* Where a quote request came from.
 *
 * The problem this solves: an enquiry from Instagram and an enquiry from a
 * Google search arrive identical, so there is no way to tell whether a content
 * plan or an ad budget is doing anything. Spending money on a channel you
 * cannot measure is the expensive version of guessing.
 *
 * Two things make this awkward, and both are handled here:
 *
 *   1. People rarely land on the form. They land on the homepage from an
 *      Instagram link, read for a minute, then navigate to /contact — by which
 *      point the UTM tags are long gone from the URL. So the first touch is
 *      captured on whatever page they arrive at and held for the session.
 *   2. The first touch is the one worth keeping. If someone arrives from
 *      Instagram and later returns via a Google search for the brand name,
 *      Instagram is what actually earned the enquiry. Later visits do not
 *      overwrite it.
 *
 * sessionStorage, not a cookie: it needs no consent banner, it dies with the
 * tab, and it never leaves the browser except attached to a quote the person
 * deliberately submitted.
 */

const KEY = "qe_attribution";

export type Attribution = {
  channel: string;          // human-readable: "Instagram", "Google", "Direct"
  utm: Record<string, string>;
  referrer: string | null;
  landing_page: string | null;
  first_seen: string;
};

/* Map a referring host or utm_source to something a person reading the lead
   notification recognises. Anything unmatched keeps its raw host, which is more
   useful than bucketing it as "Other". */
const CHANNELS: [RegExp, string][] = [
  [/instagram|ig\b|l\.instagram/i, "Instagram"],
  [/facebook|fb\.|m\.facebook|l\.facebook/i, "Facebook"],
  [/whatsapp|wa\.me/i, "WhatsApp"],
  [/linkedin|lnkd\.in/i, "LinkedIn"],
  [/google|googleadservices|gclid/i, "Google"],
  [/bing|duckduckgo|yahoo|ecosia/i, "Search"],
  [/indiamart|tradeindia|justdial|exportersindia/i, "B2B directory"],
  [/youtube|youtu\.be/i, "YouTube"],
  [/t\.co|twitter|x\.com/i, "X"],
];

function nameChannel(utm: Record<string, string>, referrer: string | null): string {
  const explicit = utm.utm_source || utm.source || "";
  const hay = `${explicit} ${utm.utm_medium || ""} ${referrer || ""}`;
  for (const [re, name] of CHANNELS) if (re.test(hay)) return name;
  if (explicit) return explicit;
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    // A referral from our own site is not a source; the person was already here.
    if (host.endsWith("quality-enterprises.co.in")) return "Direct";
    return host;
  } catch { return "Direct"; }
}

/** Capture the first touch of this session. Safe to call on every page. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return;   // first touch wins

    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const [k, v] of params) {
      if (/^utm_/i.test(k) || ["gclid", "fbclid", "ref", "source"].includes(k.toLowerCase())) {
        utm[k.toLowerCase()] = v.slice(0, 120);
      }
    }
    const referrer = document.referrer || null;

    // Nothing to record and no referrer means a direct visit; still store it, so
    // "Direct" is a measured answer rather than an absence of data.
    const value: Attribution = {
      channel: nameChannel(utm, referrer),
      utm,
      referrer: referrer ? referrer.slice(0, 300) : null,
      landing_page: (window.location.pathname + window.location.search).slice(0, 300),
      first_seen: new Date().toISOString(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch { /* private mode or storage disabled - attribution is not worth an error */ }
}

/** Read it back for submission. Returns null if nothing was captured. */
export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch { return null; }
}
