import Link from "next/link";
import { Faq } from "@/components/Faq";
import { HeroBoxes } from "@/components/HeroBoxes";
import { SectionIntro } from "@/components/SectionIntro";
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
  ["Factory visit", "Open to buyers by appointment, Narsingi"],
];

/* Board figures below are indicative ranges. The exact construction is confirmed
   on the written quote once the load and handling conditions are known. */
const specs: [string, string, string, string, string][] = [
  ["3 ply", "Single wall", "120-220 GSM", "Light cartons", "Retail, food and general dispatch"],
  ["5 ply", "Double wall", "120-220 GSM", "Medium loads", "Shipping, storage and produce"],
  ["7 ply", "Triple wall", "120-220 GSM", "Heavy loads", "Industrial and freight"],
];

const strengths: [string, string, string][] = [
  ["Delivery planning", "Dates you can plan against", "We schedule the run against your dispatch requirement and confirm the next step in writing."],
  ["Custom formats", "Sized to the product", "Dimensions, ply, print, partitions and closing style are chosen around your product and handling conditions."],
  ["One factory", "Board and conversion together", "Board conversion and box finishing stay under one roof, so questions are answered by the people running the work."],
];

export default function Home() { return <div className="site-grid">
  <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-16 md:px-10 md:pb-20 md:pt-24">
    <div className="max-w-3xl">
      <div className="eyebrow">Corrugated packaging &middot; Narsingi, Hyderabad</div>
      <h1 className="mt-5 text-[clamp(2.1rem,5vw,3.5rem)]">Packaging built for business.</h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-soft">Shipping cartons, mailers, storage boxes and protective formats for procurement, warehouse and operations teams.</p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href="/quote" className="pill focus-ring bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Request a quote</Link>
        <Link href="/boxes" className="pill pill-outline focus-ring px-6 py-3 font-semibold">See what we make</Link>
      </div>
      <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
        {[["Minimum order", site.moq], ["Quote back in", site.quoteSla], ["Supply", "Factory direct"], ["Sizes", "Made to spec"]].map(([label, value]) => <div key={label}>
          <dt className="eyebrow">{label}</dt><dd className="mt-2 font-medium">{value}</dd>
        </div>)}
      </dl>
    </div>
    <HeroBoxes />
  </section>

  <BoardConstructionLoader />

  <section className="border-y border-line bg-kraft-lt px-5 py-12 md:px-10">
    <p className="mx-auto max-w-4xl text-center text-lg font-medium md:text-xl">From everyday dispatch cartons to heavy-duty freight packaging &mdash; one factory for the full range.</p>
  </section>

  <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10">
    <SectionIntro eyebrow="Why teams work with us" title="Packaging support that fits the way you operate." body="The right box is only useful when it arrives on time, fits the job and can be repeated on the next run." />
    <div className="mt-10 grid gap-5 md:grid-cols-3">{strengths.map(([tag, title, body]) => <article key={tag} className="card p-6">
      <div className="eyebrow text-ultra">{tag}</div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-ink-soft">{body}</p>
    </article>)}</div>
  </section>

  <section className="bg-ink px-5 py-20 text-paper md:px-10"><div className="mx-auto max-w-[1400px]">
    <SectionIntro light eyebrow="What we put in writing" title="You should not have to chase the basics." body="Every quote we send states these five things before a run starts." />
    <dl className="mt-10 divide-y divide-paper/20 border-y border-paper/20">{commitments.map(([label, value]) => <div key={label} className="grid gap-1 py-5 md:grid-cols-[16rem_1fr] md:gap-8">
      <dt className="eyebrow !text-paper/60 md:pt-1">{label}</dt><dd className="font-medium">{value}</dd>
    </div>)}</dl>
  </div></section>

  <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10">
    <SectionIntro eyebrow="Board specifications" title="Choose the wall for the job." body="Indicative ranges for the three constructions we run most. The exact board is confirmed on your written quote once we know the load and the handling route." />
    <div className="mt-10 grid gap-5 md:grid-cols-3">{specs.map(([ply, wall, liner, load, use]) => <div key={ply} className="card p-6">
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <span className="text-xl font-semibold">{ply}</span><span className="eyebrow">{wall}</span>
      </div>
      <dl className="mt-4 grid gap-3.5">{[["Liner", liner], ["Load", load], ["Best for", use]].map(([label, value]) => <div key={label}>
        <dt className="eyebrow">{label}</dt><dd className="mt-1 font-medium">{value}</dd>
      </div>)}</dl>
    </div>)}</div>
  </section>

  <section className="mx-auto max-w-[820px] px-5 py-20 md:px-10">
    <SectionIntro eyebrow="Questions, answered" title="Before you call." body="Short answers to the things buyers ask first." />
    <Faq />
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, answer]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: answer } })) })} />
  </section>

  <section className="border-t border-line bg-kraft-lt px-5 py-16 md:px-10">
    <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
      <div>
        <h2 className="max-w-2xl text-2xl md:text-4xl">Tell us what you need packed.</h2>
        <p className="mt-3 max-w-xl text-ink-soft">Send the dimensions, the quantity and what goes inside. We will come back with a written specification and price.</p>
      </div>
      <Link href="/quote" className="pill focus-ring shrink-0 bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Request a quote</Link>
    </div>
  </section>
</div>; }
