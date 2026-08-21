#!/usr/bin/env node
/* Self-check for the extraction and scoring logic. No network, no database.
 *   node scripts/leads/test.mjs
 *
 * These assertions exist because each one failed at least once during the
 * build: names picked from the wrong side of a title, sentence tails filed as
 * people, a district name treated as a neighbourhood, and postcodes outside
 * Hyderabad scored as if they were in it.
 */

import assert from "node:assert/strict";
import { extractPhones, extractEmails, extractPeople, normalisePhone, siteName, isFreeMail } from "./enrich.mjs";
import { proximity, packagingFit, reachability, scoreProspect, disqualify } from "./score.mjs";
import { parseListing } from "./sources/factoriesindia.mjs";
import { companyMatch, buyingAuthority, pickBuyers } from "./people.mjs";

let pass = 0;
const it = (name, fn) => { try { fn(); pass++; } catch (e) { console.error(`FAIL  ${name}\n      ${e.message}`); process.exitCode = 1; } };

/* --------------------------------------------------------------- phones */

it("normalises Indian numbers and rejects non-numbers", () => {
  assert.equal(normalisePhone("+91 98850 55516"), "+919885055516");
  assert.equal(normalisePhone("040-27638111"), "+914027638111");
  assert.equal(normalisePhone("9885055516"), "+919885055516");
  assert.equal(normalisePhone("919885055516"), "+919885055516");
  // A bare local number is unusable without knowing the city.
  assert.equal(normalisePhone("27200343"), null);
  assert.equal(normalisePhone("27200343", "040"), "+914027200343");
  // Not phone numbers.
  assert.equal(normalisePhone("0000000000"), null);
  assert.equal(normalisePhone("500076"), null, "a PIN code is not a phone number");
  assert.equal(normalisePhone("12345"), null);
  assert.equal(normalisePhone("123456789012345"), null);
});

it("prefers tel: links over free text", () => {
  const out = extractPhones('<a href="tel:+914023770338">call</a> <p>040 2377 0338</p>');
  assert.equal(out.length, 1);
  assert.equal(out[0].phone, "+914023770338");
  assert.equal(out[0].via, "tel-link");
});

/* --------------------------------------------------------------- emails */

it("ranks a purchase inbox above a generic one", () => {
  const out = extractEmails("purchase@acme.com info@acme.com", "acme.com");
  assert.equal(out[0].email, "purchase@acme.com");
  assert.ok(out[0].score > out[1].score);
});

it("knows a free mailbox from a company domain", () => {
  assert.equal(isFreeMail("someone@gmail.com"), true);
  assert.equal(isFreeMail("purchase@acme.com"), false);
});

/* --------------------------------------------------------------- people */

it("pairs a name with its title, in either order", () => {
  const [p] = extractPeople("<p>Ramesh Babu Potluri, Managing Director</p>");
  assert.equal(p.name, "Ramesh Babu Potluri");
  assert.equal(p.title, "Managing Director");
});

it("rejects the things that look like people and are not", () => {
  // A department beside a title.
  assert.deepEqual(extractPeople("<p>Ware House, Executive</p>"), []);
  // A company beside a title.
  assert.deepEqual(extractPeople("<p>Chigurupati Technologies FZE, Director</p>"), []);
  // The title itself, which the length heuristic used to file as the name.
  assert.equal(extractPeople("<p>Managing Director, Gopichand</p>").length, 0);
  // A sentence tail: the title regex is case-insensitive, so the name half
  // could match lowercase and pick up the next word's first letter.
  assert.deepEqual(extractPeople("<p>Introduced i, Director</p>"), []);
});

it("scores a purchase manager above a director", () => {
  const [buyer] = extractPeople("<p>Anil Kumar, Purchase Manager</p>");
  const [md] = extractPeople("<p>Anil Kumar, Managing Director</p>");
  assert.ok(buyer.authority > md.authority, "purchase signs the PO");
});

/* ------------------------------------------------------------ site name */

it("takes a company name from the page, not a greeting", () => {
  assert.equal(siteName("<title>Acme Labs | Bulk drugs</title>"), "Acme Labs");
  assert.equal(siteName("<title>Welcome to SMS Life</title>"), "SMS Life");
  assert.equal(siteName("<title>Home</title>"), null);
});

/* -------------------------------------------------------------- listing */

it("parses a directory entry into fields", () => {
  const html = `<h2 class="entry-title"> Acme Pharma Limited, Hyderabad </h2>
    <table><tr><td><strong>Phone</strong></td><td>:</td><td>40-27200343</td></tr>
    <tr><td><strong>Address</strong></td><td>:</td><td>Plot 9, IDA Mallapur, Hyderabad - 500076</td></tr>
    <tr><td><strong>District</strong></td><td>:</td><td>Medchal</td></tr></table>
    <tr><td colspan="3">https://acmepharma.example/</td></tr>`;
  const [row] = parseListing(html, "https://src.example/list");
  assert.equal(row.company_name, "Acme Pharma Limited");
  assert.equal(row.city, "Hyderabad");
  assert.match(row.address, /IDA Mallapur/);
  assert.deepEqual(row.raw_phones, ["40-27200343"]);
  assert.equal(row.website_url, "https://acmepharma.example/");
  assert.equal(row.source_url, "https://src.example/list", "provenance must survive parsing");
});

it("never files the directory's own address as the company's", () => {
  const html = `<h2 class="entry-title"> Acme Ltd, Hyderabad </h2>
    <table><tr><td><strong>Address</strong></td><td>:</td><td>Hyderabad</td></tr></table>
    contact@factoriesindia.net`;
  assert.equal(parseListing(html, "u")[0].email, null);
});

/* ------------------------------------------------------------ proximity */

it("ranks distance by real geography, not by postcode prefix", () => {
  const at = (address, district = "") => proximity({ address, district }).band;
  assert.equal(at("Plot 79, IDA Mallapur, Nacharam, Hyderabad - 500076"), "same-corridor");
  assert.equal(at("Plot 14B, IDA Uppal, Hyderabad - 500039"), "same-corridor");
  // A district is not a neighbourhood: Bachupally is Medchal-Malkajgiri, but it
  // is not on the Mallapur belt.
  assert.equal(at("Bachupally Village, Bachupally Mandal - 500090", "Medchal-Malkajgiri"), "same-district");
  // 502xxx and 508xxx are other districts, however Hyderabad-ish they look.
  assert.equal(at("Sadasivpet Mandal, Sangareddy - 502291", "Sangareddy"), "telangana-industrial");
  assert.equal(at("Kodad mandal, Nalgonda - 508206", "Nalgonda"), "telangana-industrial");
  assert.equal(at("Andheri East, Mumbai, Maharashtra 400069"), "outside");
});

it("weights distance above everything else", () => {
  const near = proximity({ address: "IDA Mallapur, Hyderabad - 500076" }).points;
  const far = proximity({ address: "Kodad, Nalgonda - 508206", district: "Nalgonda" }).points;
  assert.ok(near > far * 2, "freight dominates the economics of a bulky, cheap load");
});

/* ---------------------------------------------------------------- score */

it("rates packaged goods above bulk chemicals", () => {
  assert.ok(packagingFit({ industry: "food" }).points > packagingFit({ industry: "chemical" }).points);
  assert.ok(packagingFit({ description: "bulk drug intermediates" }).points < packagingFit({ industry: "food" }).points);
});

it("rewards a reachable buyer over a nameless inbox", () => {
  const named = reachability({ people: [{ name: "A B", title: "Purchase Manager", authority: 95 }], phones: [{ phone: "+919885055516" }], emails: [{ email: "purchase@x.com", score: 90 }] });
  const cold = reachability({ people: [], phones: [], emails: [{ email: "info@x.com", score: 30 }] });
  assert.ok(named.points > cold.points + 15);
  assert.ok(named.points <= 25, "the term is capped");
});

it("refuses to sell boxes to a box maker", () => {
  assert.ok(disqualify({ company_name: "Sri Corrugated Packaging Pvt Ltd", address: "IDA Mallapur, Hyderabad - 500076" }));
  assert.equal(disqualify({ company_name: "Acme Foods Ltd", address: "IDA Mallapur, Hyderabad - 500076" }), null);
});

it("disqualifies a prospect with no location, because distance is most of the score", () => {
  const s = scoreProspect({ company_name: "Acme Foods Ltd" });
  assert.equal(s.grade, "X");
  assert.equal(s.total, 0);
  assert.match(s.disqualified, /location/i);
});

it("grades a near, reachable, carton-heavy plant top and a far anonymous one bottom", () => {
  const best = scoreProspect({
    company_name: "Acme Foods Limited", industry: "food",
    address: "Plot 20, IDA Mallapur, Hyderabad - 500076",
    people: [{ name: "A B", title: "Purchase Manager", authority: 95 }],
    phones: [{ phone: "+919885055516" }], emails: [{ email: "purchase@acme.com", score: 90 }],
  });
  const worst = scoreProspect({
    company_name: "Far Chem", industry: "chemical",
    address: "Kodad mandal, Nalgonda - 508206", district: "Nalgonda",
    people: [], phones: [], emails: [],
  });
  assert.equal(best.grade, "A");
  assert.ok(worst.total < 45, `expected a D, got ${worst.total}`);
  assert.ok(best.total <= 100 && worst.total >= 0);
  // The breakdown must explain itself - a score with no reason is not reviewable.
  for (const term of Object.values(best.breakdown)) assert.ok(term.why && term.why.length > 3);
});

/* ------------------------------------------------ named buying contacts */

it("treats a similarly-named company as a different company", () => {
  // The real trap: both exist, both are in Hyderabad, both start "SMS".
  assert.equal(companyMatch("SMS Pharmaceuticals Limited", "SMS PHARMACEUTICALS LIMITED"), "exact");
  assert.equal(companyMatch("SMS Pharmaceuticals Limited", "SMS LIFESCIENCES INDIA PRIVATE LIMITED"), "none");
  assert.equal(companyMatch("Shilpa Medicare Ltd.", "Shilpa Medicare Limited"), "exact");
  assert.equal(companyMatch("Granules India Limited", "Granules India Ltd"), "exact");
});

it("ranks procurement titles above the board", () => {
  assert.ok(buyingAuthority("Head of Procurement") > buyingAuthority("Managing Director"));
  assert.ok(buyingAuthority("Purchase Manager") > buyingAuthority("Chairman"));
  assert.ok(buyingAuthority("DGM Purchase") > buyingAuthority("Sr Executive-Procurement"));
  assert.equal(buyingAuthority("QA Chemist"), null, "not a buying role");
});

it("keeps only current roles at the right company", () => {
  const results = [
    { title: "Sms Srinivas", url: "https://in.linkedin.com/in/sms-srinivas",
      highlights: ["### [SMS PHARMACEUTICALS LIMITED](https://www.linkedin.com/company/sms-pharmaceuticals-limited)\n#### Purchase Manager (Current)"] },
    // Same title, but the role ended - must not be offered as a contact.
    { title: "Old Buyer", url: "https://in.linkedin.com/in/old-buyer",
      highlights: ["### [SMS PHARMACEUTICALS LIMITED](https://www.linkedin.com/company/sms-pharmaceuticals-limited)\n#### Purchase Manager"] },
    // Current, but at the confusingly-named other company.
    { title: "Rahul Kanth", url: "https://in.linkedin.com/in/rahul-kanth",
      highlights: ["### [SMS LIFESCIENCES INDIA PRIVATE LIMITED](https://www.linkedin.com/company/sms-lifesciences-india-private-limited)\n#### Deputy Manager Purchase (Current)"] },
  ];
  const buyers = pickBuyers(results, "Sms Pharmaceuticals Limited");
  assert.equal(buyers.length, 1, `expected only the current SMS Pharma buyer, got ${JSON.stringify(buyers.map((b) => b.name))}`);
  assert.equal(buyers[0].name, "Sms Srinivas");
  assert.equal(buyers[0].company_match, "exact");
  assert.ok(buyers[0].source_url.includes("linkedin"), "a name must carry the profile it came from");
  assert.equal(buyers[0].verified, false, "nothing scraped is verified until a human says so");
});

console.log(`${pass} checks passed${process.exitCode ? " (with failures above)" : ""}`);
