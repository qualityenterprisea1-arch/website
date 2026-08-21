"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { boxTypes } from "@/content/boxTypes";
import deliveryAreas from "@/content/deliveryAreas.json";
import { site } from "@/content/site";

type Answers = { boxType: string; length: string; width: string; height: string; unit: "mm" | "in"; ply: string; quantity: string; printing: string; location: string; outsideArea: string; name: string; phone: string; company: string; email: string; website: string };
const initial: Answers = { boxType: "", length: "", width: "", height: "", unit: "mm", ply: "", quantity: "500", printing: "", location: "", outsideArea: "", name: "", phone: "", company: "", email: "", website: "" };

const MOQ = 500;
const field = "focus-ring mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-ink";
const choice = (selected: boolean) => `card focus-ring p-4 text-left transition-colors ${selected ? "border-ultra bg-ultra text-paper" : "hover:border-ink"}`;

export default function QuotePage() {
  const [answers, setAnswers] = useState<Answers>(initial);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"editing" | "sending" | "sent" | "failed">("editing");
  const update = (key: keyof Answers, value: string) => setAnswers((a) => ({ ...a, [key]: value }));

  const canNext = useMemo(() => {
    if (step === 0) return !!answers.boxType;
    if (step === 1) return !!answers.length && !!answers.width && !!answers.height;
    if (step === 2) return !!answers.ply;
    if (step === 3) return Number(answers.quantity) >= MOQ;
    if (step === 4) return !!answers.printing;
    const selectedLocation = deliveryAreas.locations.find((item) => item.value === answers.location);
    return !!answers.name.trim() && !!answers.phone.trim() && !!selectedLocation && (!selectedLocation.requiresDetail || answers.outsideArea.trim().length >= 2);
  }, [answers, step]);

  // A failed write must surface. Reporting success on a dropped request loses the lead.
  const submit = async () => {
    setStatus("sending");
    const payload = {
      box_type: answers.boxType,
      length: answers.length, width: answers.width, height: answers.height,
      unit: answers.unit,
      ply: answers.ply,
      quantity: Number(answers.quantity),
      printing: answers.printing,
      location: answers.location,
      outside_area: answers.outsideArea,
      name: answers.name, phone: answers.phone,
      company: answers.company, email: answers.email,
      website: answers.website, // honeypot
    };
    try {
      const res = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setStatus(res.ok ? "sent" : "failed");
    } catch { setStatus("failed"); }
  };

  if (status === "sent") return <div className="site-grid px-5 py-20 md:px-10"><div className="mx-auto max-w-2xl">
    <div className="eyebrow">Request received</div>
    <h1 className="mt-5 text-3xl md:text-4xl">We will come back to you within {site.quoteSla}.</h1>
    <p className="mt-6 text-lg text-ink-soft">Your request is with the factory team. We have your box format, size, ply, quantity, printing and delivery area, and will reply with a written specification and price.</p>
    <Link href="/" className="pill focus-ring mt-8 inline-flex bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Back to home</Link>
  </div></div>;

  if (status === "failed") return <div className="site-grid px-5 py-20 md:px-10"><div className="mx-auto max-w-2xl">
    <div className="eyebrow">Request not sent</div>
    <h1 className="mt-5 text-3xl md:text-4xl">Something went wrong on our side.</h1>
    <p className="mt-6 text-lg text-ink-soft">Your request did not reach us, so please do not assume it is in the queue. Try again in a moment, or reach the factory directly and we will take the details down.</p>
    <div className="mt-8 flex flex-wrap gap-3">
      <button onClick={() => setStatus("editing")} className="pill focus-ring bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Try again</button>
      <Link href="/contact" className="pill pill-outline focus-ring px-6 py-3 font-semibold">Contact the factory</Link>
    </div>
  </div></div>;

  const steps = [
    <div key="box">
      <h2 className="text-2xl md:text-3xl">Which packaging format do you need?</h2>
      <p className="mt-3 text-ink-soft">Choose the closest format. We can refine the construction with your operations team.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">{boxTypes.map((item) => <button key={item.slug} type="button" aria-pressed={answers.boxType === item.name} onClick={() => update("boxType", item.name)} className={choice(answers.boxType === item.name)}>
        <span className="font-medium">{item.name}</span><span className="mt-1 block text-sm opacity-75">{item.short}</span>
      </button>)}</div>
    </div>,
    <div key="size">
      <h2 className="text-2xl md:text-3xl">What size is the box?</h2>
      <p className="mt-3 text-ink-soft">Enter the internal length, width and height.</p>
      <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">{([["length", "Length"], ["width", "Width"], ["height", "Height"]] as const).map(([key, label]) => <label key={key} className="eyebrow">{label}
        <input value={answers[key]} onChange={(e) => update(key, e.target.value)} inputMode="decimal" className={field} />
      </label>)}</div>
      <div className="mt-6 flex gap-2">{(["mm", "in"] as const).map((unit) => <button key={unit} type="button" aria-pressed={answers.unit === unit} onClick={() => setAnswers((a) => ({ ...a, unit }))} className={`pill focus-ring px-4 py-2 text-sm font-semibold ${answers.unit === unit ? "bg-ink text-paper" : "pill-outline"}`}>{unit}</button>)}</div>
    </div>,
    <div key="ply">
      <h2 className="text-2xl md:text-3xl">How much wall does it need?</h2>
      <p className="mt-3 text-ink-soft">The ply changes the stiffness and the load the box can carry.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">{[["3 ply", "Everyday cartons"], ["5 ply", "More protection"], ["7 ply", "Heavy loads"]].map(([ply, hint]) => <button key={ply} type="button" aria-pressed={answers.ply === ply} onClick={() => update("ply", ply)} className={choice(answers.ply === ply)}>
        <span className="text-lg font-semibold">{ply}</span><span className="mt-1 block text-sm opacity-75">{hint}</span>
      </button>)}</div>
    </div>,
    <div key="quantity">
      <h2 className="text-2xl md:text-3xl">How many boxes?</h2>
      <p className="mt-3 text-ink-soft">Our minimum order is {site.moq}.</p>
      <label className="eyebrow mt-8 block max-w-xs">Quantity
        <input value={answers.quantity} onChange={(e) => update("quantity", e.target.value)} type="number" min={MOQ} inputMode="numeric" aria-describedby="qty-note" className={field} />
      </label>
      {Number(answers.quantity) < MOQ && <p id="qty-note" role="alert" className="mt-3 text-sm font-medium text-[#B3261E]">Please enter at least {MOQ} boxes.</p>}
    </div>,
    <div key="printing">
      <h2 className="text-2xl md:text-3xl">Do you need printing?</h2>
      <p className="mt-3 text-ink-soft">We will confirm coverage and colours before production.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">{["None", "1 colour", "2 colour", "Full colour"].map((printing) => <button key={printing} type="button" aria-pressed={answers.printing === printing} onClick={() => update("printing", printing)} className={`${choice(answers.printing === printing)} font-medium`}>{printing}</button>)}</div>
    </div>,
    <div key="details">
      <h2 className="text-2xl md:text-3xl">Where should we send the quote?</h2>
      <p className="mt-3 text-ink-soft">Phone is required. Email lets us send the written specification.</p>
      <div className="mt-8 grid max-w-2xl gap-5 sm:grid-cols-2">
        <label className="eyebrow sm:col-span-2">City / delivery area *
          <select required value={answers.location} onChange={(e) => { update("location", e.target.value); update("outsideArea", ""); }} className={field}>
            <option value="">Choose an area</option>
            {deliveryAreas.locations.map((location) => <option key={location.value} value={location.value}>
              {location.requiresDetail ? location.city : `${location.area}, ${location.city}`}
            </option>)}
          </select>
        </label>
        {deliveryAreas.locations.find((item) => item.value === answers.location)?.requiresDetail && <label className="eyebrow sm:col-span-2">City or delivery area outside Hyderabad *
          <input required maxLength={120} value={answers.outsideArea} onChange={(e) => update("outsideArea", e.target.value)} autoComplete="address-level2" className={field} />
          <span className="mt-2 block font-sans text-xs font-normal normal-case tracking-normal text-ink-soft">We do not serve this area today, but we will keep the request for delivery planning.</span>
        </label>}
        {([
        { key: "name", label: "Your name", required: true, type: "text", autoComplete: "name" },
        { key: "phone", label: "Phone number", required: true, type: "tel", autoComplete: "tel" },
        { key: "company", label: "Company", required: false, type: "text", autoComplete: "organization" },
        { key: "email", label: "Email", required: false, type: "email", autoComplete: "email" },
      ] satisfies { key: keyof Answers; label: string; required: boolean; type: string; autoComplete: string }[]).map((f) => <label key={f.key} className="eyebrow">{f.label}{f.required ? " *" : ""}
        <input required={f.required} type={f.type} autoComplete={f.autoComplete} value={answers[f.key]} onChange={(e) => update(f.key, e.target.value)} className={field} />
      </label>)}</div>
      {/* Honeypot. Hidden from people and from assistive tech; bots fill it in. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={answers.website} onChange={(e) => update("website", e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />
    </div>,
  ];

  const summary: [string, string][] = [
    ["Box", answers.boxType || "Not chosen"],
    ["Size", answers.length ? `${answers.length} × ${answers.width} × ${answers.height} ${answers.unit}` : "Not chosen"],
    ["Ply", answers.ply || "Not chosen"],
    ["Quantity", answers.quantity ? `${answers.quantity} boxes` : "Not chosen"],
    ["Printing", answers.printing || "Not chosen"],
    ["Delivery", (() => {
      const location = deliveryAreas.locations.find((item) => item.value === answers.location);
      if (!location) return "Not chosen";
      return location.requiresDetail ? (answers.outsideArea || "Outside Hyderabad") : `${location.area}, ${location.city}`;
    })()],
    ["Contact", answers.phone || "Not chosen"],
  ];

  return <div className="site-grid px-5 py-12 md:px-10 md:py-20"><div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1fr_300px]">
    <div>
      <h1 className="text-2xl md:text-3xl">Request a quote</h1>
      <div className="mt-6 flex items-center gap-4">
        <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-ultra transition-[width] duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <span className="eyebrow shrink-0">Step {step + 1} of {steps.length}</span>
      </div>
      <div className="mt-10">{steps[step]}</div>
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
        <button type="button" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="pill pill-outline focus-ring px-5 py-3 font-semibold disabled:opacity-30">Back</button>
        {step < steps.length - 1
          ? <button type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="pill focus-ring bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          : <button type="button" disabled={!canNext || status === "sending"} onClick={submit} className="pill focus-ring bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40">{status === "sending" ? "Sending…" : "Send request"}</button>}
      </div>
    </div>
    <aside className="card h-fit p-5 lg:sticky lg:top-28">
      <div className="eyebrow">Your specification</div>
      <dl className="mt-5 grid gap-4 text-sm">{summary.map(([label, value]) => <div key={label}>
        <dt className="eyebrow">{label}</dt><dd className="mt-1 font-medium">{value}</dd>
      </div>)}</dl>
    </aside>
  </div></div>;
}
