import Link from "next/link";
import { Faq } from "@/components/Faq";
import { HeroBoxes } from "@/components/HeroBoxes";
import { SectionIntro } from "@/components/SectionIntro";
import { Hero } from "@/components/Hero";
import { BoardConstructionLoader } from "@/components/BoardConstructionLoader";
import { questions } from "@/content/faq";
import { site } from "@/content/site";
import { pageMetadata, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("Corrugated Packaging Manufacturer in Hyderabad", "Quality Enterprises makes corrugated shipping cartons, mailers, storage boxes and protective formats for procurement, warehouse and operations teams in Hyderabad.");

const commitments: [string, string][] = [
  ["Minimum order", site.moq],
  ["Quote turnaround", `Written back within ${site.quoteSla}`],
  ["Written specification", "Board, ply, GSM and dimensions stated on every quote"],
  ["Pre-run sample", "Available for approval before the run starts"],
  ["Factory visit", "Open to buyers by appointment, IDA Mallapur"],
];

/* Board figures are indicative ranges. The exact construction is confirmed
   on the written quote once the load and handling conditions are known. */
const specs = [
  { ply: "3 ply", wall: "Single wall", rows: [["Liner", "120-220 GSM"], ["Bursting", "6-8 kg/cm²"], ["Load", "Up to 10 kg"], ["Flute", "B, 3.0 mm"]], use: "Retail, food and general dispatch" },
  { ply: "5 ply", wall: "Double wall", rows: [["Liner", "120-220 GSM"], ["Bursting", "10-14 kg/cm²"], ["Load", "Up to 25 kg"], ["Flute", "B + C, 7.0 mm"]], use: "Shipping, storage and produce" },
  { ply: "7 ply", wall: "Triple wall", rows: [["Liner", "120-220 GSM"], ["Bursting", "16-20 kg/cm²"], ["Load", "Up to 50 kg"], ["Flute", "B + C + C, 11 mm"]], use: "Industrial loads and freight" },
] as const;

const strengths: [string, string, string, string][] = [
  ["01", "Delivery planning", "Dates you can plan against", "We schedule the run against your dispatch requirement and confirm the next step in writing."],
  ["02", "Custom formats", "Sized to the product", "Dimensions, ply, print, partitions and closing style are chosen around your product and handling conditions."],
  ["03", "One factory", "Board and conversion together", "Board conversion and box finishing stay under one roof, so questions are answered by the people running the work."],
];

export default function Home() { return <div className="site-grid">
  <Hero />

  <section className="mx-auto max-w-[1400px] px-5 pt-16 md:px-10">
    <HeroBoxes />
  </section>

  <BoardConstructionLoader />

  <section className="border-y border-kraft-dp/25 bg-kraft-lt px-5 py-12 md:px-10">
    <p className="mx-auto max-w-4xl text-center text-lg font-medium md:text-xl">From everyday dispatch cartons to heavy-duty freight packaging &mdash; one factory for the full range.</p>
  </section>

  <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10">
    <SectionIntro eyebrow="Why teams work with us" title="Packaging support that fits the way you operate." body="The right box is only useful when it arrives on time, fits the job and can be repeated on the next run." />
    <div className="mt-10 grid gap-5 md:grid-cols-3">{strengths.map(([index, tag, title, body]) => <article key={tag} className="card p-6">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <span className="eyebrow eyebrow-plain">{tag}</span><span className="mono text-[11px] text-ink-soft">{index}</span>
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-ink-soft">{body}</p>
    </article>)}</div>
  </section>

  <section className="bg-ink px-5 py-20 text-paper md:px-10"><div className="mx-auto max-w-[1400px]">
    <SectionIntro light eyebrow="What we put in writing" title="You should not have to chase the basics." body="Every quote we send states these five things before a run starts." />
    <dl className="mt-10 divide-y divide-paper/20 border-y border-paper/20">{commitments.map(([label, value]) => <div key={label} className="grid gap-1 py-5 md:grid-cols-[18rem_1fr] md:gap-8">
      <dt className="eyebrow !text-paper/55 md:pt-1">{label}</dt><dd className="font-medium">{value}</dd>
    </div>)}</dl>
  </div></section>

  <section className="border-y border-line bg-bone px-5 py-20 md:px-10"><div className="mx-auto max-w-[1400px]">
    <SectionIntro eyebrow="Board specifications" title="Choose the wall for the job." body="Indicative ranges for the three constructions we run most. The exact board is confirmed on your written quote once we know the load and the handling route." />
    <div className="mt-10 grid gap-5 md:grid-cols-3">{specs.map(({ ply, wall, rows, use }) => <div key={ply} className="spec-panel bg-paper">
      <div className="spec-panel-top"><span>{wall}</span><b>{ply}</b></div>
      <div className="spec-panel-rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
      <p className="border-t border-line px-3.5 pb-3.5 pt-3 font-sans text-sm text-ink-soft"><span className="font-medium text-ink">Best for</span> {use}</p>
    </div>)}</div>
  </div></section>

  <section className="mx-auto max-w-[820px] px-5 py-20 md:px-10">
    <SectionIntro eyebrow="Questions, answered" title="Before you call." body="Short answers to the things buyers ask first." />
    <Faq />
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, answer]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: answer } })) })} />
  </section>

  <section className="border-t border-kraft-dp/25 bg-kraft-lt px-5 py-16 md:px-10">
    <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
      <div>
        <h2 className="max-w-2xl text-2xl md:text-4xl">Tell us what you need packed.</h2>
        <p className="mt-3 max-w-xl text-ink-soft">Send the dimensions, the quantity and what goes inside. We will come back with a written specification and price.</p>
      </div>
      <Link href="/contact#quote" className="pill focus-ring shrink-0 bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Request a quote</Link>
    </div>
  </section>
</div>; }
