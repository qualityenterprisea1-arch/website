import Image from "next/image";
import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("Corrugated Packaging Capabilities", "Printing, die-cutting, multi-depth scoring and custom sizing at Quality Enterprises, IDA Mallapur, Hyderabad. What we can run for procurement and operations teams.", "/works");

/* This page deliberately does NOT repeat the /boxes product grid. It shows what the
   line can do — the blanks, the print, the scoring — rather than the finished catalogue. */
const capabilities = [
  { n: "01", title: "Flexo printing", image: "/images/products/chipboard-cartons.avif", body: "Handling marks, product information, panel identification and brand ink applied on the rubber-die flexo line. Coverage and colour count are agreed before the run starts." },
  { n: "02", title: "Die-cutting and blanks", image: "/images/products/reverse-tuck-corrugated-boxes.avif", body: "Cut-outs, tuck flaps, hand holes and ventilation are made with a die fitted to the blank. The cut pattern is checked for clean release before the full run." },
  { n: "03", title: "Fold and lock constructions", image: "/images/products/easy-fold-mailers.avif", body: "Tab-locking, easy-fold and reverse tuck closures for packing lines that need speed without tape. The fold sequence is set from your packing method." },
  { n: "04", title: "Multi-depth scoring", image: "/images/products/multi-depth-boxes.avif", body: "One blank creased for several finished heights, so a single carton covers a range of product sizes and reduces the number of SKUs you hold." },
];

const line: [string, string][] = [
  ["Board range", "3, 5 and 7 ply, 120-220 GSM liner"],
  ["Conversion", "Corrugation, cutting, scoring, slotting, punching"],
  ["Joining", "Pasted or wire-stitched, chosen by load"],
  ["Printing", "Up to full colour flexo, coverage agreed pre-run"],
  ["Sizing", "Made to your internal dimensions"],
  ["Minimum order", "500 boxes"],
];

export default function WorksPage() {
  return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1200px]">
    <SectionIntro as="h1" eyebrow="Capabilities" title="What the line can run." body="The formats in the catalogue are starting points. This is the work behind them — the print, the cut, the score and the close. Named client work is shared on request rather than published." />

    <div className="mt-14 grid gap-12">{capabilities.map(({ n, title, image, body }, i) => <article key={n} className={`grid items-center gap-8 md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>figure]:order-2" : ""}`}>
      <figure className="card relative aspect-[4/3] overflow-hidden">
        <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </figure>
      <div>
        <div className="flex items-baseline gap-4">
          <span className="mono text-sm text-signal">{n}</span>
          <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
        </div>
        <p className="mt-4 max-w-lg text-ink-soft">{body}</p>
      </div>
    </article>)}</div>

    <div className="mt-20 grid gap-8 border-t border-line pt-12 md:grid-cols-[1fr_340px] md:items-start">
      <div>
        <h2 className="text-xl font-semibold md:text-2xl">Need a format that is not in the catalogue?</h2>
        <p className="mt-4 max-w-xl text-ink-soft">Send the dimensions, the load and the handling route. We will tell you what can run, what board it needs and what else we need to price it properly.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact#quote" className="pill focus-ring bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Request a quote</Link>
          <Link href="/boxes" className="pill pill-outline focus-ring px-6 py-3 font-semibold">Browse the catalogue</Link>
        </div>
      </div>
      <div className="spec-panel">
        <div className="spec-panel-top"><span>The line</span><b>IDA Mallapur</b></div>
        <div className="spec-panel-rows">{line.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
      </div>
    </div>

    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Capabilities", path: "/works" }]))} />
  </div></div>;
}
