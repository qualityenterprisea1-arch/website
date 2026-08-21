import { NextResponse } from "next/server";

/* The quote form used to POST straight from the browser to Supabase. It now goes
   through here so the Resend key stays server-side and the payload is validated
   before it touches the database. */

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const NOTIFY_TO = process.env.QUOTE_NOTIFY_TO;
const NOTIFY_FROM = process.env.QUOTE_NOTIFY_FROM ?? "Quality Enterprises <onboarding@resend.dev>";

const MOQ = 500;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

type Row = {
  box_type: string; length: string; width: string; height: string; unit: "mm" | "in";
  ply: string; quantity: number; printing: string;
  name: string; phone: string; company: string | null; email: string | null;
};

function parse(body: Record<string, unknown>): Row | string {
  const quantity = Number(body.quantity);
  const unit = body.unit === "in" ? "in" : "mm";
  const row: Row = {
    box_type: str(body.box_type, 120),
    length: str(body.length, 20), width: str(body.width, 20), height: str(body.height, 20),
    unit,
    ply: str(body.ply, 40),
    quantity,
    printing: str(body.printing, 40),
    name: str(body.name, 120),
    phone: str(body.phone, 40),
    company: str(body.company, 160) || null,
    email: str(body.email, 254) || null,
  };
  if (!row.box_type) return "Choose a packaging format.";
  if (!row.name) return "Enter your name.";
  if (row.phone.length < 4) return "Enter a phone number we can reach you on.";
  if (!Number.isFinite(quantity) || quantity < MOQ) return `Minimum order is ${MOQ} boxes.`;
  if (quantity > 10_000_000) return "That quantity looks wrong. Please call us instead.";
  if (row.email && !row.email.includes("@")) return "That email address does not look right.";
  return row;
}

async function notify(row: Row) {
  if (!RESEND_KEY || !NOTIFY_TO) return { sent: false, reason: "not configured" };
  const size = [row.length, row.width, row.height].filter(Boolean).join(" x ");
  const lines: [string, string][] = [
    ["Format", row.box_type],
    ["Size", size ? `${size} ${row.unit}` : "Not given"],
    ["Ply", row.ply || "Not given"],
    ["Quantity", `${row.quantity} boxes`],
    ["Printing", row.printing || "Not given"],
    ["Name", row.name],
    ["Phone", row.phone],
    ["Company", row.company || "Not given"],
    ["Email", row.email || "Not given"],
  ];
  const text = lines.map(([k, v]) => `${k.padEnd(10)} ${v}`).join("\n");
  const html = `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px">
  <p style="font:600 11px/1.2 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#5A5249;margin:0 0 6px">New quote request</p>
  <h1 style="font-size:20px;margin:0 0 20px;color:#1A1714">${esc(row.name)}${row.company ? ` &middot; ${esc(row.company)}` : ""}</h1>
  <table style="border-collapse:collapse;width:100%;font-size:14px">${lines.map(([k, v]) => `
    <tr><td style="padding:8px 16px 8px 0;color:#5A5249;white-space:nowrap;border-bottom:1px solid #E5E0D6">${esc(k)}</td>
        <td style="padding:8px 0;color:#1A1714;font-weight:500;border-bottom:1px solid #E5E0D6">${esc(v)}</td></tr>`).join("")}
  </table>
  <p style="margin:22px 0 0"><a href="tel:${esc(row.phone)}" style="background:#14407A;color:#F8F6F2;text-decoration:none;padding:11px 20px;border-radius:4px;display:inline-block;font-weight:600">Call ${esc(row.phone)}</a></p>
</div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: NOTIFY_FROM, to: [NOTIFY_TO],
      reply_to: row.email || undefined,
      subject: `Quote request — ${row.box_type}, ${row.quantity} boxes (${row.name})`,
      text, html,
    }),
  });
  if (!res.ok) return { sent: false, reason: `resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
  const { id } = (await res.json().catch(() => ({}))) as { id?: string };
  return { sent: true, id };
}

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("[quote] Supabase env vars are missing");
    return NextResponse.json({ error: "The quote form is not configured yet." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Malformed request." }, { status: 400 }); }

  // Honeypot: a field no human ever sees, so anything in it is a bot.
  if (str(body.website, 200)) return NextResponse.json({ ok: true });

  const row = parse(body);
  if (typeof row === "string") return NextResponse.json({ error: row }, { status: 400 });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/quote_requests`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    console.error("[quote] insert failed", res.status, (await res.text()).slice(0, 400));
    return NextResponse.json({ error: "We could not save your request." }, { status: 502 });
  }

  // The lead is already saved. A failed notification must not lose it, so this
  // never turns into an error response — it is logged and the caller still wins.
  try {
    const n = await notify(row);
    if (n.sent) console.log("[quote] notification sent, resend id", n.id);
    else console.warn("[quote] notification not sent:", n.reason);
  } catch (e) {
    console.error("[quote] notification threw", e);
  }

  return NextResponse.json({ ok: true });
}
