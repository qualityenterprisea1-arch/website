"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, configured } from "@/lib/supabaseClient";
import { exportWorkbook } from "./exportWorkbook";

/* The staff leads desk.
 *
 * Ported from the local dashboard, with one architectural change: it talks to
 * Supabase directly with the signed-in user's token instead of going through a
 * server that holds a service-role key. Row-level security decides what comes
 * back, so this page can be served publicly and still show nothing at all to
 * someone who is not on the staff allowlist.
 */

type Prospect = {
  id: string; company_name: string; website_url: string | null;
  city: string | null; district: string | null; address: string | null; industry: string | null;
  contact_name: string | null; contact_title: string | null;
  contact_phone: string | null; contact_email: string | null;
  phones: { phone: string; via?: string; source_url?: string }[];
  emails: { email: string; score?: number; source_url?: string }[];
  contacts: { name: string; title: string; authority?: number; source_url?: string; location?: string; company_match?: string; note?: string }[];
  score: { breakdown?: Record<string, { points: number; max: number; why: string }> } | null;
  score_total: number; grade: string; proximity_band: string | null;
  recommended_action: string | null; disqualified_reason: string | null;
  status: string; notes: string | null; is_verified: boolean; do_not_contact: boolean;
  source: string | null; source_url: string | null; last_enriched_at: string | null;
  evidence: { pages_crawled?: string[] } | null;
};

type Quote = {
  id: string; created_at: string; name: string; phone: string; company: string | null; email: string | null;
  box_type: string; length: string; width: string; height: string; unit: string;
  ply: string; quantity: number; printing: string; city: string | null; area: string | null;
  status: string; notes: string | null;
};

const PROX: Record<string, string> = {
  "same-corridor": "Same corridor", "same-district": "Same district", hyderabad: "Hyderabad",
  "telangana-industrial": "TS industrial", telangana: "Telangana", outside: "Outside",
};
const OUT_STATUS = ["new", "researched", "drafted", "approved", "contacted", "won", "lost", "disqualified"];
const IN_STATUS = ["new", "contacted", "quoted", "won", "lost"];

const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

/* ------------------------------------------------------------------ sign in */

function SignIn() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/leads` },
    });
    if (error) { setMessage(error.message); setState("error"); return; }
    setState("sent");
  };

  if (state === "sent") return <div className="card mx-auto max-w-md p-7">
    <div className="eyebrow">Check your inbox</div>
    <h1 className="mt-4 text-2xl">A sign-in link is on its way.</h1>
    <p className="mt-4 text-ink-soft">We sent it to {email}. The link signs you in on this device and expires shortly.</p>
    <p className="mt-4 text-sm text-ink-soft">Nothing arrived? The address has to be on the staff list. Ask the factory to add it.</p>
  </div>;

  return <form onSubmit={send} className="card mx-auto max-w-md p-7">
    <div className="eyebrow">Staff only</div>
    <h1 className="mt-4 text-2xl">Leads desk</h1>
    <p className="mt-4 text-ink-soft">Sign in with your work email. We will send a one-time link — there is no password to remember or share.</p>
    <label className="label-stack eyebrow mt-7">Email address
      <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
        className="focus-ring mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-ink" />
    </label>
    {state === "error" && <p role="alert" className="mt-4 text-sm font-medium text-[#B3261E]">{message}</p>}
    <button type="submit" disabled={state === "sending"} className="pill focus-ring mt-6 inline-flex bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink disabled:opacity-40">
      {state === "sending" ? "Sending…" : "Send sign-in link"}
    </button>
  </form>;
}

/* -------------------------------------------------------------------- desk */

export function LeadsDesk() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"outbound" | "inbound">("outbound");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [denied, setDenied] = useState(false);
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("");
  const [prox, setProx] = useState("");
  const [status, setStatus] = useState("");
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [namedOnly, setNamedOnly] = useState(false);
  const [showDisq, setShowDisq] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    if (!supabase || !session) return;
    const [p, qr] = await Promise.all([
      supabase.from("outbound_prospects").select("*").order("score_total", { ascending: false }),
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
    ]);
    // RLS returns an empty set rather than an error for a non-allowlisted user,
    // so "signed in but sees nothing anywhere" is how access denial looks.
    setDenied(!p.error && !qr.error && (p.data?.length ?? 0) === 0 && (qr.data?.length ?? 0) === 0);
    setProspects((p.data as Prospect[]) ?? []);
    setQuotes((qr.data as Quote[]) ?? []);
  }, [session]);

  useEffect(() => { void load(); }, [load]);

  const live = useMemo(() => prospects.filter((r) => r.status !== "disqualified" && r.grade !== "X"), [prospects]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (tab === "inbound") {
      return quotes.filter((r) => (!status || r.status === status)
        && (!needle || JSON.stringify(r).toLowerCase().includes(needle)));
    }
    return prospects.filter((r) => {
      if (!showDisq && (r.status === "disqualified" || r.grade === "X")) return false;
      if (grade && r.grade !== grade) return false;
      if (prox && r.proximity_band !== prox) return false;
      if (status && r.status !== status) return false;
      if (phoneOnly && !(r.phones ?? []).length) return false;
      if (namedOnly && !r.contact_name) return false;
      return !needle || JSON.stringify(r).toLowerCase().includes(needle);
    });
  }, [tab, prospects, quotes, q, grade, prox, status, phoneOnly, namedOnly, showDisq]);

  const patch = async (table: string, id: string, values: Record<string, unknown>) => {
    if (!supabase) return;
    setSaving(id);
    const { error } = await supabase.from(table).update(values).eq("id", id);
    setSaving("");
    if (error) { alert(error.message); return; }
    await load();
  };

  if (!configured) return <p className="text-ink-soft">Supabase is not configured for this deployment.</p>;
  if (!ready) return <p className="text-ink-soft">Loading…</p>;
  if (!session) return <SignIn />;

  if (denied) return <div className="card mx-auto max-w-md p-7">
    <div className="eyebrow">No access</div>
    <h1 className="mt-4 text-2xl">This address is not on the staff list.</h1>
    <p className="mt-4 text-ink-soft">You are signed in as {session.user.email}, but it has not been given access to the leads desk. Ask the factory to add it.</p>
    <button onClick={() => supabase?.auth.signOut()} className="pill pill-outline focus-ring mt-6 px-5 py-3 text-sm font-semibold">Sign out</button>
  </div>;

  const open = openId ? (tab === "outbound" ? prospects : quotes).find((r) => r.id === openId) : null;

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex gap-1">
        {(["outbound", "inbound"] as const).map((t) => <button key={t} onClick={() => { setTab(t); setStatus(""); setOpenId(null); }}
          aria-pressed={tab === t}
          className={`pill focus-ring px-4 py-2 text-sm font-semibold ${tab === t ? "bg-ink text-paper" : "pill-outline"}`}>
          {t === "outbound" ? "Outbound prospects" : "Inbound quotes"}
        </button>)}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-ink-soft">{session.user.email}</span>
        <button onClick={() => void load()} className="pill pill-outline focus-ring px-4 py-2 text-sm font-semibold">Refresh</button>
        <button
          onClick={async () => {
            setExporting(true);
            // Export exactly what is on screen, filters included - an export that
            // silently ignores the filters is how the wrong list gets called.
            try { await exportWorkbook(tab, rows as Prospect[], rows as unknown as Quote[]); }
            catch (e) { alert(e instanceof Error ? e.message : "Export failed"); }
            finally { setExporting(false); }
          }}
          disabled={exporting || !rows.length}
          className="pill pill-outline focus-ring px-4 py-2 text-sm font-semibold disabled:opacity-40">
          {exporting ? "Building…" : `Export ${rows.length} to Excel`}
        </button>
        <button onClick={() => supabase?.auth.signOut()} className="pill pill-outline focus-ring px-4 py-2 text-sm font-semibold">Sign out</button>
      </div>
    </div>

    {tab === "outbound" && <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {([
        ["Live prospects", live.length, `${prospects.length - live.length} disqualified`],
        ["Grade A or B", live.filter((r) => r.grade === "A" || r.grade === "B").length, "worth a call"],
        ["Named contact", live.filter((r) => r.contact_name).length, "a person, not an inbox"],
        ["Same corridor", live.filter((r) => r.proximity_band === "same-corridor").length, "shortest delivery run"],
      ] as [string, number, string][]).map(([k, n, sub]) => <div key={k} className="card p-5">
        <div className="eyebrow">{k}</div>
        <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">{n}</div>
        <div className="mt-1 text-xs text-ink-soft">{sub}</div>
      </div>)}
    </div>}

    <div className="mt-7 flex flex-wrap items-center gap-2">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, contact, phone…"
        aria-label="Search"
        className="focus-ring min-w-[200px] flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
      {tab === "outbound" && <>
        <select aria-label="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm">
          <option value="">All grades</option>{["A", "B", "C", "D"].map((g) => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select aria-label="Distance" value={prox} onChange={(e) => setProx(e.target.value)} className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm">
          <option value="">Any distance</option>{Object.entries(PROX).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </>}
      <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm">
        <option value="">Any status</option>{(tab === "outbound" ? OUT_STATUS : IN_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {tab === "outbound" && <>
        <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm">
          <input type="checkbox" checked={phoneOnly} onChange={(e) => setPhoneOnly(e.target.checked)} /> Has phone
        </label>
        <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm">
          <input type="checkbox" checked={namedOnly} onChange={(e) => setNamedOnly(e.target.checked)} /> Named contact
        </label>
        <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm">
          <input type="checkbox" checked={showDisq} onChange={(e) => setShowDisq(e.target.checked)} /> Show disqualified
        </label>
      </>}
    </div>

    <div className="card mt-4 overflow-x-auto p-0">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{tab === "outbound" ? "Outbound prospects" : "Inbound quote requests"}</caption>
        <thead>
          <tr className="border-b border-line">
            {(tab === "outbound"
              ? ["Grade", "Score", "Company", "Contact", "Phone", "Distance", "Status"]
              : ["Received", "Name", "Company", "Phone", "Format", "Qty", "Status"]
            ).map((h) => <th key={h} scope="col" className="eyebrow whitespace-nowrap px-3 py-3 text-left">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => tab === "outbound" ? (() => { const p = r as Prospect; return <tr key={p.id}
            onClick={() => setOpenId(p.id)} tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(p.id); } }}
            className={`cursor-pointer border-b border-line/50 hover:bg-paper ${p.do_not_contact ? "opacity-50" : ""}`}>
            <td className="px-3 py-2.5"><span className="rounded bg-ultra px-2 py-0.5 font-mono text-xs font-bold text-paper">{p.grade}</span></td>
            <td className="px-3 py-2.5 text-right font-mono tabular-nums">{p.score_total}</td>
            <td className="px-3 py-2.5"><b>{p.company_name}</b>
              <div className="text-xs text-ink-soft">{(p.address ?? "").slice(0, 68)}</div></td>
            <td className="px-3 py-2.5">{p.contact_name ?? <span className="text-ink-soft">—</span>}
              {p.contact_title && <div className="text-xs text-ink-soft">{p.contact_title}</div>}</td>
            <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">{p.contact_phone ?? "—"}</td>
            <td className="px-3 py-2.5 text-xs">{PROX[p.proximity_band ?? ""] ?? "—"}</td>
            <td className="px-3 py-2.5 text-xs">{p.status}</td>
          </tr>; })() : (() => { const c = r as Quote; return <tr key={c.id}
            onClick={() => setOpenId(c.id)} tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(c.id); } }}
            className="cursor-pointer border-b border-line/50 hover:bg-paper">
            <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">{fmtDate(c.created_at)}</td>
            <td className="px-3 py-2.5"><b>{c.name}</b></td>
            <td className="px-3 py-2.5 text-xs">{c.company ?? "—"}</td>
            <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">{c.phone}</td>
            <td className="px-3 py-2.5 text-xs">{c.box_type}</td>
            <td className="px-3 py-2.5 text-right font-mono tabular-nums">{c.quantity}</td>
            <td className="px-3 py-2.5 text-xs">{c.status}</td>
          </tr>; })())}
        </tbody>
      </table>
      {!rows.length && <p className="px-5 py-12 text-center text-ink-soft">Nothing matches these filters.</p>}
    </div>

    {open && <>
      <div className="fixed inset-0 z-40 bg-ink/40" onClick={() => setOpenId(null)} />
      <aside role="dialog" aria-modal="true" aria-label="Record detail"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[560px] overflow-y-auto border-l border-line bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">{"company_name" in open ? open.company_name : open.name}</h2>
          <button onClick={() => setOpenId(null)} className="pill pill-outline focus-ring px-4 py-2 text-sm font-semibold">Close</button>
        </div>

        {"company_name" in open ? <ProspectDetail p={open as Prospect} onPatch={(v) => patch("outbound_prospects", open.id, v)} busy={saving === open.id} />
          : <QuoteDetail c={open as Quote} onPatch={(v) => patch("quote_requests", open.id, v)} busy={saving === open.id} />}
      </aside>
    </>}
  </div>;
}

/* ------------------------------------------------------------------ detail */

function ProspectDetail({ p, onPatch, busy }: { p: Prospect; onPatch: (v: Record<string, unknown>) => void; busy: boolean }) {
  const [notes, setNotes] = useState(p.notes ?? "");
  const breakdown = p.score?.breakdown ?? {};

  return <>
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="rounded bg-ultra px-2 py-0.5 font-mono text-xs font-bold text-paper">{p.grade}</span>
      <span className="font-mono text-lg">{p.score_total}<span className="text-xs text-ink-soft">/100</span></span>
      <span className="pill px-3 py-0.5 text-xs">{PROX[p.proximity_band ?? ""] ?? "—"}</span>
      {p.is_verified && <span className="pill px-3 py-0.5 text-xs text-[#1B7F4B]">Verified</span>}
      {p.do_not_contact && <span className="pill px-3 py-0.5 text-xs text-[#C0392B]">Do not contact</span>}
    </div>
    {p.recommended_action && <p className="mt-4">{p.recommended_action}</p>}

    <div className="eyebrow mt-6">Why this score</div>
    <ul className="mt-2 grid gap-1.5">
      {Object.entries(breakdown).map(([k, v]) => <li key={k} className="grid grid-cols-[110px_46px_1fr] items-baseline gap-2 text-xs">
        <span className="text-ink-soft">{k.replace(/_/g, " ")}</span>
        <b className="font-mono">{v.points}/{v.max}</b>
        <span>{v.why}</span>
      </li>)}
    </ul>

    <div className="mt-5 flex flex-wrap gap-2">
      {p.contact_phone && <a href={`tel:${p.contact_phone}`} className="pill focus-ring bg-ultra px-5 py-2.5 text-sm font-semibold text-paper">Call {p.contact_phone}</a>}
      {p.contact_email && <a href={`mailto:${p.contact_email}`} className="pill pill-outline focus-ring px-5 py-2.5 text-sm font-semibold">Email</a>}
      {p.website_url && !p.website_url.startsWith("urn:") &&
        <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="pill pill-outline focus-ring px-5 py-2.5 text-sm font-semibold">Website</a>}
    </div>

    <div className="spec-panel mt-5">
      <div className="spec-panel-rows">
        {([["Address", p.address], ["District", p.district], ["Industry", p.industry],
           ["Source", p.source], ["Harvested", fmtDate(p.last_enriched_at)]] as [string, string | null][])
          .filter(([, v]) => v).map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
      </div>
    </div>

    {!!(p.contacts ?? []).length && <>
      <div className="eyebrow mt-5">Buying contacts</div>
      <div className="mt-2 grid gap-1.5 text-xs">
        {[...p.contacts].sort((a, b) => (b.authority ?? 0) - (a.authority ?? 0)).map((c, i) => <div key={i}>
          <b>{c.name}</b> — <span className="text-ink-soft">{c.title}</span>
          {(c.authority ?? 0) >= 85 && <span className="pill ml-1 px-2 py-0.5 text-[10px] text-[#1B7F4B]">buyer</span>}
          {c.company_match === "near" && <span className="pill ml-1 px-2 py-0.5 text-[10px] text-[#C0392B]">name match approximate</span>}
          {c.location && <span className="ml-1 text-ink-soft">{c.location}</span>}
          {c.source_url && <> · <a href={c.source_url} target="_blank" rel="noopener noreferrer">source</a></>}
          {c.note && <div className="text-ink-soft">{c.note}</div>}
        </div>)}
      </div>
    </>}

    {!!(p.phones ?? []).length && <>
      <div className="eyebrow mt-5">Phone numbers</div>
      <div className="mt-2 grid gap-1 text-xs">
        {p.phones.map((x) => <div key={x.phone}>
          <a href={`tel:${x.phone}`} className="font-mono">{x.phone}</a>
          {x.source_url && <> · <a href={x.source_url} target="_blank" rel="noopener noreferrer">source</a></>}
        </div>)}
      </div>
    </>}

    <div className="eyebrow mt-6">Status</div>
    <div className="mt-2 flex flex-wrap gap-2">
      <select aria-label="Status" value={p.status} onChange={(e) => onPatch({ status: e.target.value })}
        className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm">
        {OUT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button onClick={() => onPatch({ is_verified: !p.is_verified })} className="pill pill-outline focus-ring px-4 py-2 text-sm font-semibold">
        {p.is_verified ? "Mark unverified" : "Mark verified"}
      </button>
      <button onClick={() => onPatch({ do_not_contact: !p.do_not_contact })} className="pill pill-outline focus-ring px-4 py-2 text-sm font-semibold">
        {p.do_not_contact ? "Allow contact" : "Do not contact"}
      </button>
    </div>
    <p className="mt-2 text-xs text-ink-soft">Verification is a human judgement: check the number against its source before ticking it. Nothing here is ever emailed automatically.</p>

    <div className="eyebrow mt-6">Notes</div>
    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
      className="focus-ring mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
    <button disabled={busy} onClick={() => onPatch({ notes })} className="pill focus-ring mt-3 bg-ultra px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-40">
      {busy ? "Saving…" : "Save notes"}
    </button>
  </>;
}

function QuoteDetail({ c, onPatch, busy }: { c: Quote; onPatch: (v: Record<string, unknown>) => void; busy: boolean }) {
  const [notes, setNotes] = useState(c.notes ?? "");
  return <>
    <div className="mt-4 flex flex-wrap gap-2">
      <a href={`tel:${c.phone}`} className="pill focus-ring bg-ultra px-5 py-2.5 text-sm font-semibold text-paper">Call {c.phone}</a>
      {c.email && <a href={`mailto:${c.email}`} className="pill pill-outline focus-ring px-5 py-2.5 text-sm font-semibold">Email</a>}
    </div>
    <div className="spec-panel mt-5">
      <div className="spec-panel-rows">
        {([["Received", fmtDate(c.created_at)], ["Company", c.company], ["Email", c.email],
           ["Format", c.box_type], ["Size", `${c.length} × ${c.width} × ${c.height} ${c.unit}`],
           ["Ply", c.ply], ["Quantity", `${c.quantity} boxes`], ["Printing", c.printing],
           ["Delivery", [c.area, c.city].filter(Boolean).join(", ") || "Ask on the call"]] as [string, string | null][])
          .filter(([, v]) => v).map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
      </div>
    </div>
    <div className="eyebrow mt-6">Status</div>
    <select aria-label="Status" value={c.status} onChange={(e) => onPatch({ status: e.target.value })}
      className="focus-ring mt-2 rounded-md border border-line bg-white px-3 py-2 text-sm">
      {IN_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
    <div className="eyebrow mt-6">Notes</div>
    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
      className="focus-ring mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
    <button disabled={busy} onClick={() => onPatch({ notes })} className="pill focus-ring mt-3 bg-ultra px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-40">
      {busy ? "Saving…" : "Save notes"}
    </button>
  </>;
}
