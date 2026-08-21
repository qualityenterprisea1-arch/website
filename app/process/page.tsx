import Image from "next/image";
import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("Corrugated Box Manufacturing Process", "See how Quality Enterprises turns kraft paper into corrugated board and finished cartons through corrugation, cutting, printing and conversion.", "/process");

const stages: [string, string, string][] = [
  ["Corrugation", "01-corrugation", "Flute paper is heated, formed and bonded between liners to create the board structure. The flute profile determines how the sheet behaves under compression."],
  ["Cutting", "02-cutting", "Sheets are cut to a repeatable blank size before printing or conversion. The cut plan is checked against the finished box dimensions and the usable sheet."],
  ["Printing", "03-printing", "Rubber-die flexo printing can add handling marks, product information and brand ink. Print coverage is agreed before the run starts."],
  ["Pasting", "04-pasting", "Gum is applied to the joining flap and folded under pressure. The joint must hold through packing, stacking and transport."],
  ["Scoring", "05-scoring", "Score lines create clean folds without crushing the board around the crease. Score position is set from the finished internal dimensions."],
  ["Slotting", "06-slotting", "Slots are cut for flaps and closing panels. Blade settings change with the ply and board thickness, especially on heavy cartons."],
  ["Punching", "07-punching", "Cut-outs, handles and ventilation openings are made with a die fitted to the blank. The cut pattern is checked for clean release."],
  ["Stitching", "08-stitching", "For heavy cartons, wire stitching gives the joint more holding power. The stitch line is kept clear of the product and the closing flap."],
  ["Waste management", "09-waste", "Trim and offcuts are separated for recycling instead of mixed disposal. Usable offcuts can also support internal packing work."],
];

export default function ProcessPage() { return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1200px]">
  <SectionIntro as="h1" eyebrow="Our process" title="Board in. Box out." body="Nine practical stages, handled close to the machine and checked before the next one." />

  <ol className="mt-16 grid gap-16 md:gap-20">{stages.map(([name, file, body], i) => <li key={name} className={`grid items-center gap-8 md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>figure]:order-2" : ""}`}>
    <figure className="card relative aspect-[3/2] overflow-hidden">
      <Image src={`/images/process/${file}.avif`} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
    </figure>
    <div>
      <div className="flex items-baseline gap-4">
        <span className="mono text-sm text-signal">{String(i + 1).padStart(2, "0")}</span>
        <h2 className="text-xl font-semibold md:text-2xl">{name}</h2>
      </div>
      <p className="mt-4 max-w-lg text-ink-soft">{body}</p>
    </div>
  </li>)}</ol>

  {/* Illustrative process photographs, not pictures of this unit. Saying so keeps
     the page inside the spec's "every claim checkable" rule. */}
  <p className="mono mt-16 border-t border-line pt-6 text-xs text-ink-soft">
    Images illustrate standard corrugated conversion stages. Photographs of the Narsingi line are available on a factory visit.
  </p>

  <div className="mt-10 flex flex-wrap gap-3">
    <Link href="/quote" className="pill focus-ring bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Request a quote</Link>
    <Link href="/contact" className="pill pill-outline focus-ring px-6 py-3 font-semibold">Arrange a visit</Link>
  </div>

  <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Process", path: "/process" }]))} />
</div></div>; }
