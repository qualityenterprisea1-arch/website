"use client";
import { questions } from "@/content/faq";

export function Faq() { return <div className="mt-10 divide-y divide-line border-y border-line">{questions.map(([q, a]) => <details key={q} className="group">
  <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium"><span>{q}</span><span className="text-xl leading-none text-ink-soft transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary>
  <p className="max-w-2xl pb-5 text-ink-soft">{a}</p>
</details>)}</div>; }
