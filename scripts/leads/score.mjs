/* Corrugated-buyer scoring.
 *
 * This replaces the SaaS BANT model the pipeline shipped with, which derived
 * budget from "does the site publish pricing tiers" and timeline from "does the
 * site have job postings". A pharma plant publishes neither for cartons, so
 * every prospect scored 0/25 on budget by construction and graded D. The grades
 * measured the model, not the market.
 *
 * What actually decides whether a Hyderabad manufacturer buys boxes from a unit
 * at IDA Mallapur:
 *
 *   1. Distance. Corrugated is bulky and cheap per kilo, so freight is a large
 *      fraction of delivered cost. A plant on the next road is a structurally
 *      better prospect than a bigger one across the state. This is the single
 *      heaviest weight and it is not close.
 *   2. How much corrugated their output consumes per dispatch.
 *   3. Whether a human who signs a purchase order is reachable at all.
 *   4. Scale, as a proxy for annual volume.
 */

/* ------------------------------------------------------- 1. proximity (30) */

// Industrial estates sharing the factory's own corridor. A lorry reaches these
// without leaving the neighbourhood.
/* Localities on the Mallapur/Nacharam/Uppal industrial belt itself. These are
   suburbs, not districts: "Malkajgiri" belongs to the district list below, and
   putting it here made every Medchal-Malkajgiri plant look like a neighbour. */
const SAME_CORRIDOR = ["mallapur", "mallpur", "nacharam", "uppal", "cherlapally", "cherlapalli",
  "habsiguda", "moula ali", "moulali", "kushaiguda", "boduppal", "ramanthapur", "tarnaka", "meerpet"];

const NEAR_DISTRICTS = ["medchal", "malkajgiri"];
const CITY_DISTRICTS = ["hyderabad", "secunderabad", "ranga reddy", "rangareddy", "ranga-reddy"];
const REGION_DISTRICTS = ["sangareddy", "medak", "nalgonda", "yadadri", "bhuvanagiri", "siddipet",
  "vikarabad", "mahabubnagar", "khammam", "warangal", "karimnagar", "nizamabad", "suryapet", "kamareddy"];

// Postcodes of the corridor itself.
const CORRIDOR_PINS = ["500076", "500039", "500051", "500062", "500092", "500013", "500007"];

export function proximity({ address = "", district = "", city = "" }) {
  const hay = `${address ?? ""} ${district ?? ""} ${city ?? ""}`.toLowerCase().trim();
  /* No location at all is not the same as a far one. Scoring it zero keeps an
     unlocated company visible and sorted low, rather than crediting it with a
     Hyderabad address nobody established. */
  if (!hay) return { band: "unknown", points: 0, why: "No address found — distance unknown, check the site" };
  const pin = (String(address).match(/\b5\d{5}\b/) || [])[0];

  if (CORRIDOR_PINS.includes(pin) || SAME_CORRIDOR.some((a) => hay.includes(a)))
    return { band: "same-corridor", points: 30, why: "Same industrial corridor as the Mallapur unit" };
  /* A named outlying district wins over any postcode heuristic. Sangareddy
     postcodes start 502 and Nalgonda 508, but the directory prints plenty of
     out-of-city plants with a 50xxxx pin, so the name is the reliable signal. */
  if (REGION_DISTRICTS.some((d) => hay.includes(d)))
    return { band: "telangana-industrial", points: 11, why: "Telangana industrial belt, longer run" };
  if (NEAR_DISTRICTS.some((d) => hay.includes(d)))
    return { band: "same-district", points: 24, why: "Medchal-Malkajgiri district" };
  // Greater Hyderabad postcodes are 500xxx and 501xxx. 502+ is another district.
  if (CITY_DISTRICTS.some((d) => hay.includes(d)) || /\b50[01]\d{3}\b/.test(String(address)))
    return { band: "hyderabad", points: 18, why: "Greater Hyderabad" };
  if (hay.includes("telangana"))
    return { band: "telangana", points: 6, why: "Elsewhere in Telangana" };
  return { band: "outside", points: 0, why: "Outside the delivery area" };
}

/* ------------------------------------------------- 2. packaging fit (25) */

/* How much corrugated a sector consumes per dispatch. Finished consumer goods
   ship in printed cartons in a master shipper; bulk chemicals ship in drums and
   bags with far less board per rupee of output. */
const SECTOR_FIT = {
  food: [25, "Finished food goods ship in printed cartons and master shippers"],
  pharma: [23, "Formulations ship in cartons; plants also buy shipper boxes in volume"],
  apparel: [22, "Garments ship in cartons per size-set"],
  leather: [21, "Footwear and goods ship in individual plus master cartons"],
  plastic: [19, "Moulded goods need shippers and partitions"],
  paper: [18, "Stationery and converted paper ships in cartons"],
  coffee: [20, "Packed retail goods in cartons"],
  tea: [20, "Packed retail goods in cartons"],
  wood: [16, "Furniture and joinery need heavy-wall boxes"],
  cotton: [15, "Yarn and fabric ship in cartons and bales"],
  chemical: [13, "Bulk moves in drums; outer cartons and partitions still apply"],
  rubber: [13, "Mixed drum, sack and carton dispatch"],
};

const KEYWORD_FIT = [
  [24, ["confectionery", "bakery", "snack", "biscuit", "dairy", "beverage", "spice", "ready to eat", "packaged food", "nutraceutical", "cosmetic", "personal care", "fmcg"]],
  [22, ["formulation", "tablet", "capsule", "ointment", "syrup", "injectable", "device", "diagnostic"]],
  [20, ["electronic", "appliance", "hardware", "fitting", "component", "auto part", "spare"]],
  [10, ["api", "bulk drug", "intermediate", "solvent", "resin", "granule"]],
];

export function packagingFit({ industry = "", sector = "", description = "" }) {
  const hay = `${industry} ${sector} ${description}`.toLowerCase();
  for (const [points, words] of KEYWORD_FIT) {
    const hit = words.find((w) => hay.includes(w));
    if (hit) return { points, why: `Output profile: ${hit}` };
  }
  const base = SECTOR_FIT[String(industry).toLowerCase()];
  if (base) return { points: base[0], why: base[1] };
  return { points: 8, why: "Manufacturer, packaging intensity unknown" };
}

/* --------------------------------------------------- 3. reachability (25) */

export function reachability({ people = [], phones = [], emails = [] }) {
  const parts = [];
  let points = 0;

  const best = people.reduce((a, b) => (a && a.authority >= b.authority ? a : b), null);
  if (best) {
    // A named purchase manager is the whole game; a named MD is next best.
    const p = best.authority >= 85 ? 12 : best.authority >= 75 ? 9 : 5;
    points += p;
    parts.push(`${best.name} (${best.title})`);
  }

  if (phones.length) { points += 8; parts.push(`${phones.length} phone${phones.length > 1 ? "s" : ""}`); }

  const bestEmail = emails.reduce((a, b) => (a && a.score >= b.score ? a : b), null);
  if (bestEmail) {
    // purchase@ / procurement@ is a real buying channel. info@ barely is.
    points += bestEmail.score >= 90 ? 5 : bestEmail.score >= 70 ? 3 : 1;
    parts.push(bestEmail.email);
  }

  return { points: Math.min(points, 25), why: parts.join(", ") || "No reachable contact found" };
}

/* ---------------------------------------------------------- 4. scale (20) */

export function scale({ employment = null, investment_cr = null, company_name = "", plants = 1 }) {
  // Where the source publishes real figures, use them.
  if (employment != null || investment_cr != null) {
    const e = Number(employment) || 0;
    const i = Number(investment_cr) || 0;
    const points = Math.min(20, Math.round(Math.min(e / 25, 12) + Math.min(i / 10, 8)));
    return { points, why: `${e || "?"} employees, ${i || "?"} cr investment (official register)` };
  }
  // Otherwise infer only from things that are actually on the record.
  let points = 6;
  const why = [];
  if (plants > 1) { points += 5; why.push(`${plants} plants listed`); }
  if (/\b(limited|ltd)\b/i.test(company_name) && !/\bpvt\b/i.test(company_name)) { points += 4; why.push("public limited"); }
  else if (/\b(pvt|private)\b/i.test(company_name)) { points += 2; why.push("private limited"); }
  return { points: Math.min(points, 20), why: why.join(", ") || "Scale unknown" };
}

/* ------------------------------------------------------------ disqualifiers */

/* Selling boxes to a box maker is not a lead. Neither is a company with no
   address, because proximity is most of the score and we cannot compute it. */
const COMPETITOR = /\b(corrugat|packaging|packing|carton|box(es)?\s+(manufactur|maker)|paper\s*mill|kraft\s*paper)\b/i;

export function disqualify(prospect) {
  if (COMPETITOR.test(prospect.company_name || "") || COMPETITOR.test(prospect.description || ""))
    return "Packaging or corrugated business - competitor or supplier, not a buyer";
  /* A missing address is a gap to fill, not a reason to bin a real company -
     as long as there is a website where someone can find it in a few seconds.
     With neither, there is nothing to work with. */
  if (!prospect.address && !prospect.city && !prospect.district
      && (!prospect.website_url || String(prospect.website_url).startsWith("urn:")))
    return "No location and no website, so there is nothing to check";
  if (proximity(prospect).band === "outside")
    return "Outside the delivery area";
  return null;
}

/* ---------------------------------------------------------------- scoring */

export function scoreProspect(prospect) {
  const blocked = disqualify(prospect);
  if (blocked) return { total: 0, grade: "X", disqualified: blocked, breakdown: {}, action: "Do not contact" };

  const prox = proximity(prospect);
  const fit = packagingFit(prospect);
  const reach = reachability(prospect);
  const size = scale(prospect);

  const total = prox.points + fit.points + reach.points + size.points;
  const grade = total >= 78 ? "A" : total >= 62 ? "B" : total >= 45 ? "C" : "D";

  const action = {
    A: "Call this week. Named contact and short delivery run - lead with a sample carton to spec.",
    B: "Call within two weeks. Confirm who signs the packaging PO before quoting.",
    C: "Email first with the format list and MOQ; call only if it lands.",
    D: "Low priority. Revisit if a contact name or phone number appears.",
  }[grade];

  return {
    total,
    grade,
    disqualified: null,
    action,
    proximity_band: prox.band,
    breakdown: {
      proximity: { points: prox.points, max: 30, why: prox.why },
      packaging_fit: { points: fit.points, max: 25, why: fit.why },
      reachability: { points: reach.points, max: 25, why: reach.why },
      scale: { points: size.points, max: 20, why: size.why },
    },
  };
}
