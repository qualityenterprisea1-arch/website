"use client";

const questions = [
  ["Can I order fewer than 500 boxes?", "Our standard minimum is 500 boxes. Printed boxes usually cannot go lower because the cutting die and setup cost are fixed, even for a small run."],
  ["How quickly will I get a quote?", "Send the box type, size, ply and quantity. We reply with a written quote within 4 working hours during our working day."],
  ["Can I visit the factory?", "Yes. We are in Narsingi, Hyderabad. Tell us when you are coming and we will show you the machines and the board being made."],
  ["Do you make custom sizes?", "Yes. Every quote is based on your internal length, width and height, so the box fits your product and packing method."],
];

export function Faq() { return <div className="mt-10 grid gap-4">{questions.map(([q, a]) => <details key={q} className="card bg-paper"><summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-lg font-bold"><span>{q}</span><span className="text-3xl leading-none text-ultra">+</span></summary><p className="border-t-2 border-ink px-5 pb-5 pt-4 text-ink-soft">{a}</p></details>)}</div>; }
