#!/usr/bin/env node
/* Weekly digest of new leads, emailed to the factory.
 *
 * This is the only email the lead system sends, and it goes to Quality
 * Enterprises, never to a prospect. Outreach stays a human decision; this just
 * means nobody has to remember to open the dashboard.
 *
 *   node --env-file=C:/qe-leads-dashboard/.env scripts/leads/digest.mjs
 *   ... --days 7 --dry     print the email instead of sending it
 *
 * Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, QUOTE_NOTIFY_TO.
 */

const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const DAYS = Number(arg("days", "7"));
const DRY = argv.includes("--dry");

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const RESEND_KEY = process.env.RESEND_API_KEY;
const TO = process.env.QUOTE_NOTIFY_TO;
const FROM = process.env.QUOTE_NOTIFY_FROM || "Quality Enterprises <quotes@send.quality-enterprises.co.in>";

if (!SUPABASE_URL || !KEY) { console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required."); process.exit(1); }

const since = new Date(Date.now() - DAYS * 864e5).toISOString();
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const rows = await fetch(
  `${SUPABASE_URL}/rest/v1/outbound_prospects?select=*&status=eq.new&do_not_contact=eq.false&grade=in.(A,B)` +
  `&last_enriched_at=gte.${since}&order=score_total.desc&limit=25`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
).then((r) => r.json());

if (!Array.isArray(rows) || !rows.length) {
  console.log(`No new grade A or B prospects in the last ${DAYS} days. Nothing sent.`);
  process.exit(0);
}

const PROX = { "same-corridor": "same corridor", "same-district": "same district", hyderabad: "Hyderabad",
  "telangana-industrial": "TS industrial belt", telangana: "Telangana" };

const line = (p) => {
  const who = p.contact_name ? `${p.contact_name}${p.contact_title ? `, ${p.contact_title}` : ""}` : "no named contact yet";
  return { p, who };
};

const plain = `${rows.length} new prospects worth a call, found in the last ${DAYS} days.\n\n` +
  rows.map((p) => {
    const { who } = line(p);
    return [
      `${p.grade}  ${p.score_total}/100  ${p.company_name}`,
      `    ${who}`,
      `    ${p.contact_phone || "no phone on record"}   ${p.contact_email || ""}`,
      `    ${PROX[p.proximity_band] || ""}${p.address ? ` — ${p.address}` : ""}`,
      `    ${p.recommended_action || ""}`,
    ].join("\n");
  }).join("\n\n") +
  `\n\nOpen the dashboard to work these: http://localhost:4180\nNothing has been sent to any of them.`;

const html = `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:640px;color:#1A1714">
  <p style="font:600 11px/1.2 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#5A5249;margin:0 0 6px">Weekly lead digest</p>
  <h1 style="font-size:20px;margin:0 0 4px">${rows.length} new prospects worth a call</h1>
  <p style="color:#5A5249;margin:0 0 22px;font-size:14px">Grade A and B, found in the last ${DAYS} days. Nothing has been sent to any of them.</p>
  ${rows.map((p) => {
    const { who } = line(p);
    return `<div style="border:1px solid #E5E0D6;border-radius:6px;padding:14px 16px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;gap:10px">
        <b style="font-size:15px">${esc(p.company_name)}</b>
        <span style="font:600 12px ui-monospace,monospace;color:#14407A">${esc(p.grade)} · ${p.score_total}/100</span>
      </div>
      <div style="font-size:13px;color:#5A5249;margin-top:6px">${esc(who)}</div>
      <div style="font-size:13px;margin-top:6px">
        ${p.contact_phone ? `<a href="tel:${esc(p.contact_phone)}" style="color:#14407A;font-weight:600;text-decoration:none">${esc(p.contact_phone)}</a>` : '<span style="color:#8B8378">no phone on record</span>'}
        ${p.contact_email ? ` &middot; <a href="mailto:${esc(p.contact_email)}" style="color:#14407A">${esc(p.contact_email)}</a>` : ""}
      </div>
      <div style="font-size:12px;color:#5A5249;margin-top:6px">${esc(PROX[p.proximity_band] || "")}${p.address ? ` &middot; ${esc(p.address)}` : ""}</div>
      ${p.recommended_action ? `<div style="font-size:12px;color:#5A5249;margin-top:8px">${esc(p.recommended_action)}</div>` : ""}
    </div>`;
  }).join("")}
  <p style="font-size:12px;color:#5A5249;margin-top:20px">Every contact above was read off a public page and stores the URL it came from. None is verified until someone checks it.</p>
</div>`;

if (DRY || !RESEND_KEY || !TO) {
  console.log(plain);
  console.log(DRY ? "\n[dry] not sent." : "\n[not configured] RESEND_API_KEY or QUOTE_NOTIFY_TO missing; nothing sent.");
  process.exit(0);
}

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from: FROM, to: [TO], subject: `${rows.length} new packaging prospects worth a call`, text: plain, html }),
});
if (!res.ok) { console.error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`); process.exit(1); }
console.log(`Digest sent to ${TO} — ${rows.length} prospects. Resend id ${(await res.json().catch(() => ({}))).id}`);
