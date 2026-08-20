"use client";
import { questions } from "@/content/faq";

export function Faq() { return <div className="mt-10 grid gap-4">{questions.map(([q, a]) => <details key={q} className="card bg-paper"><summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-lg font-bold"><span>{q}</span><span className="text-3xl leading-none text-ultra">+</span></summary><p className="border-t-2 border-ink px-5 pb-5 pt-4 text-ink-soft">{a}</p></details>)}</div>; }
