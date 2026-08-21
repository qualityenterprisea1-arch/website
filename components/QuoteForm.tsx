"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { boxTypes } from "@/content/boxTypes";
import deliveryAreas from "@/content/deliveryAreas.json";
import { site } from "@/content/site";

/* One screen, not a wizard. The six-step flow made a buyer click Next five times
   before the form would accept anything; every field now sits on one page and the
   only required ones are format, size, quantity, area, name and phone. */

const MOQ = 500;
const field = "focus-ring mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-ink";

type Answers = {
  boxType: string; length: string; width: string; height: string; unit: "mm" | "in";
  ply: string; quantity: string; printing: string; location: string; outsideArea: string;
  name: string; phone: string; company: string; email: string; website: string;
};

const initial: Answers = {
  boxType: "", length: "", width: "", height: "", unit: "mm", ply: "3 ply", quantity: "500",
  printing: "None", location: "", outsideArea: "", name: "", phone: "", company: "", email: "", website: "",
};

export function QuoteForm() {
  const [a, setA] = useState<Answers>(initial);
  const [status, setStatus] = useState<"editing" | "sending" | "sent" | "failed">("editing");
  const [error, setError] = useState("");
  const set = (key: keyof Answers, value: string) => setA((prev) => ({ ...prev, [key]: value }));

  // /boxes/<slug> links here with ?box=<slug>. Read it after mount so the page
  // stays statically rendered and needs no Suspense boundary.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("box");
    const match = boxTypes.find((item) => item.slug === slug);
    if (match) setA((prev) => ({ ...prev, boxType: match.name }));
  }, []);

  const selectedLocation = deliveryAreas.locations.find((item) => item.value === a.location);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (Number(a.quantity) < MOQ) { setError(`Minimum order is ${MOQ} boxes.`); return; }
    setStatus("sending");
    setError("");
    const payload = {
      box_type: a.boxType, length: a.length, width: a.width, height: a.height, unit: a.unit,
      ply: a.ply, quantity: Number(a.quantity), printing: a.printing,
      location: a.location, outside_area: a.outsideArea,
      name: a.name, phone: a.phone, company: a.company, email: a.email,
      website: a.website, // honeypot
    };
    try {
      const res = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { setStatus("sent"); return; }
      const body = await res.json().catch(() => ({}));
      setError(body.error || "");
      setStatus("failed");
    } catch { setStatus("failed"); }
  };

  if (status === "sent") return <div className="card p-7">
    <div className="eyebrow">Request received</div>
    <h2 className="mt-4 text-2xl">We will come back within {site.quoteSla}.</h2>
    <p className="mt-4 text-ink-soft">Your request is with the factory team. We have the format, size, ply, quantity, printing and delivery area, and will reply with a written specification and price.</p>
    <Link href="/" className="pill focus-ring mt-7 inline-flex bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Back to home</Link>
  </div>;

  return <form onSubmit={submit} className="card p-6 md:p-7">
    <h2 className="text-2xl md:text-3xl">Request a quote</h2>
    <p className="mt-3 text-ink-soft">One form. Minimum order is {site.moq} and we reply with a written specification within {site.quoteSla}.</p>

    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      <label className="label-stack eyebrow sm:col-span-2">Packaging format *
        <select required value={a.boxType} onChange={(e) => set("boxType", e.target.value)} className={field}>
          <option value="">Choose a format</option>
          {boxTypes.map((item) => <option key={item.slug} value={item.name}>{item.name}</option>)}
        </select>
      </label>

      <fieldset className="sm:col-span-2">
        <legend className="eyebrow">Internal size *</legend>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([["length", "Length"], ["width", "Width"], ["height", "Height"]] as const).map(([key, label]) => <label key={key} className="label-stack eyebrow !mt-0">{label}
            <input required inputMode="decimal" value={a[key]} onChange={(e) => set(key, e.target.value)} className={field} />
          </label>)}
          <label className="label-stack eyebrow !mt-0">Unit
            <select value={a.unit} onChange={(e) => set("unit", e.target.value)} className={field}><option value="mm">mm</option><option value="in">in</option></select>
          </label>
        </div>
      </fieldset>

      <label className="label-stack eyebrow">Ply
        <select value={a.ply} onChange={(e) => set("ply", e.target.value)} className={field}>
          <option value="3 ply">3 ply — everyday cartons</option>
          <option value="5 ply">5 ply — more protection</option>
          <option value="7 ply">7 ply — heavy loads</option>
          <option value="Not sure">Not sure — advise me</option>
        </select>
      </label>

      <label className="label-stack eyebrow">Quantity *
        <input required type="number" min={MOQ} inputMode="numeric" value={a.quantity} onChange={(e) => set("quantity", e.target.value)} className={field} />
      </label>

      <label className="label-stack eyebrow">Printing
        <select value={a.printing} onChange={(e) => set("printing", e.target.value)} className={field}>
          {["None", "1 colour", "2 colour", "Full colour"].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>

      <label className="label-stack eyebrow">Delivery area *
        <select required value={a.location} onChange={(e) => { set("location", e.target.value); set("outsideArea", ""); }} className={field}>
          <option value="">Choose an area</option>
          {deliveryAreas.locations.map((location) => <option key={location.value} value={location.value}>
            {location.requiresDetail ? location.city : `${location.area}, ${location.city}`}
          </option>)}
        </select>
      </label>

      {selectedLocation?.requiresDetail && <label className="label-stack eyebrow sm:col-span-2">City or delivery area outside Hyderabad *
        <input required maxLength={120} value={a.outsideArea} onChange={(e) => set("outsideArea", e.target.value)} autoComplete="address-level2" className={field} />
        <span className="mt-2 block font-sans text-xs font-normal normal-case tracking-normal text-ink-soft">We do not serve this area today, but we will keep the request for delivery planning.</span>
      </label>}

      {([
        { key: "name", label: "Your name", required: true, type: "text", autoComplete: "name" },
        { key: "phone", label: "Phone number", required: true, type: "tel", autoComplete: "tel" },
        { key: "company", label: "Company", required: false, type: "text", autoComplete: "organization" },
        { key: "email", label: "Email", required: false, type: "email", autoComplete: "email" },
      ] satisfies { key: keyof Answers; label: string; required: boolean; type: string; autoComplete: string }[]).map((f) => <label key={f.key} className="label-stack eyebrow">{f.label}{f.required ? " *" : ""}
        <input required={f.required} type={f.type} autoComplete={f.autoComplete} value={a[f.key]} onChange={(e) => set(f.key, e.target.value)} className={field} />
      </label>)}

    </div>

    {/* Honeypot. Hidden from people and from assistive tech; bots fill it in. */}
    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={a.website} onChange={(e) => set("website", e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />

    {status === "failed" && <p role="alert" className="mt-6 text-sm font-medium text-[#B3261E]">
      {error || "Your request did not reach us, so please do not assume it is in the queue."} You can also call us on <a className="underline" href={site.phoneHref}>{site.phone}</a>.
    </p>}
    {error && status !== "failed" && <p role="alert" className="mt-6 text-sm font-medium text-[#B3261E]">{error}</p>}

    <button type="submit" disabled={status === "sending"} className="pill focus-ring mt-8 inline-flex bg-ultra px-7 py-3.5 font-semibold text-paper hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40">
      {status === "sending" ? "Sending…" : "Send request"}
    </button>
  </form>;
}
