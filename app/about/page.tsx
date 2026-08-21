import Image from "next/image";
import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { boxTypes } from "@/content/boxTypes";
import { site } from "@/content/site";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("About Quality Enterprises", "A corrugated packaging unit in Narsingi, Hyderabad. Written specifications, board sized to the load, a 500-box minimum and repeat orders that stay identical.", "/about");

/* Every claim on this page is backed by something the site already commits to:
   the 4-hour written quote and 500 MOQ in content/site.ts, the nine conversion
   stages on /process, and the "we will tell you when lighter board is enough"
   line in the board diagram. Nothing here asserts scale, history, tonnage or
   client names, because none of that is verified. */
const principles: [string, string, string][] = [
  ["01", "A quote you can act on, not a call you have to chase",
   `Send the format, the internal dimensions, the ply and the quantity. Back comes a written specification within ${site.quoteSla} stating the board, the ply, the GSM and the finished size. If you are putting suppliers side by side, you are comparing like for like.`],
  ["02", "The board is sized to the load, not to the invoice",
   "Over-specifying ply is the easiest margin in packaging and the quickest way to lose a customer. If a 3 ply carton carries your product through your delivery route, we quote 3 ply and tell you why. Tell us what goes inside and how it travels."],
  ["03", `${site.moq} is enough to start`,
   "Printed runs rarely go below this, because the cutting die and the machine setup cost the same whatever the quantity. But it is low enough to trial a format properly before you commit warehouse space to it."],
  ["04", "A repeat order should be a repeat",
   "Each job is held as a written specification, so the second run is the same box as the first. No re-measuring, no re-negotiating, and no surprise on the line when your team starts packing."],
];

const facts: [string, string][] = [
  ["Unit", "Narsingi, Hyderabad"],
  ["Working hours", site.hours],
  ["Board", "3, 5 and 7 ply, 120-220 GSM liner"],
  ["On site", "Corrugation through to finishing"],
  ["Formats", `${boxTypes.length} standard + custom`],
  ["Minimum order", site.moq],
  ["Quote", `Written, within ${site.quoteSla}`],
];

export default function AboutPage() { return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1100px]">
  <SectionIntro as="h1" eyebrow="About Quality Enterprises" title="We make the board and the box in one place."
    body="A corrugated packaging unit in Narsingi, Hyderabad. Corrugation, printing, cutting and finishing happen on the same floor, so the person who can answer a question about your job is standing next to the machine running it." />

  <figure className="card relative mt-12 aspect-[21/9] overflow-hidden">
    <Image src="/images/process/02-cutting.avif" alt="" fill priority sizes="(max-width: 1100px) 100vw, 1100px" className="object-cover" />
  </figure>

  <section className="mt-20">
    <h2 className="text-2xl md:text-3xl">How we work</h2>
    <p className="mt-4 max-w-2xl text-ink-soft">Four things we hold to, because they are the four places packaging suppliers most often let an operations team down.</p>
    <div className="mt-10 grid gap-px overflow-hidden rounded border border-line bg-line md:grid-cols-2">{principles.map(([n, title, body]) => <article key={n} className="bg-paper p-7 md:p-8">
      <span className="mono text-sm text-signal">{n}</span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-ink-soft">{body}</p>
    </article>)}</div>
  </section>

  <section className="mt-20 grid gap-10 md:grid-cols-[1fr_340px] md:items-start">
    <div>
      <h2 className="text-2xl md:text-3xl">Who we are set up for</h2>
      <p className="mt-4 max-w-xl text-ink-soft">Procurement, warehouse, dispatch and production teams who order the same cartons again and again, and who need the box to arrive on the date it was promised and behave the way it did last time.</p>
      <p className="mt-4 max-w-xl text-ink-soft">That covers shipping and storage cartons, mailers, trays, bins, partitions and protective formats &mdash; sized from your internal dimensions rather than pulled off a standard list.</p>
      <p className="mt-4 max-w-xl text-ink-soft">Trim and offcuts are separated for recycling rather than mixed disposal, which matters if your own reporting has to account for packaging waste.</p>
    </div>
    <div className="spec-panel">
      <div className="spec-panel-top"><span>The unit</span><b>At a glance</b></div>
      <div className="spec-panel-rows">{facts.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
    </div>
  </section>

  <section className="mt-20 border-t border-line pt-12">
    <h2 className="text-2xl md:text-3xl">The fastest way to judge a packaging supplier is to walk their floor.</h2>
    <p className="mt-4 max-w-2xl text-ink-soft">Come and see the board being made and the boxes being cut before you place an order. Tell us when suits and we will make sure someone from the line is free to take you round.</p>
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href="/quote" className="pill focus-ring bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Request a quote</Link>
      <Link href="/contact" className="pill pill-outline focus-ring px-6 py-3 font-semibold">Arrange a visit</Link>
    </div>
  </section>

  {/* Same disclosure as /process: the photography is illustrative, not this unit. */}
  <p className="mono mt-16 border-t border-line pt-6 text-xs text-ink-soft">
    Images illustrate standard corrugated conversion stages. Photographs of the Narsingi line are available on a factory visit.
  </p>

  <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "About", path: "/about" }]))} />
</div></div>; }
