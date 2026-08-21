import { SectionIntro } from "@/components/SectionIntro";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("Corrugated Box Manufacturing Process", "See how Quality Enterprises turns kraft paper into corrugated board and finished cartons through corrugation, cutting, printing and conversion.", "/process");

const stages = [["Corrugation", "Flute paper is heated, formed and bonded between liners to create the board structure. The flute profile determines how the sheet behaves under compression."], ["Cutting", "Sheets are cut to a repeatable blank size before printing or conversion. The cut plan is checked against the finished box dimensions and the usable sheet."], ["Printing", "Rubber-die flexo printing can add handling marks, product information and brand ink. Print coverage is agreed before the run starts."], ["Pasting", "Gum is applied to the joining flap and folded under pressure. The joint must hold through packing, stacking and transport."], ["Scoring", "Score lines create clean folds without crushing the board around the crease. Score position is set from the finished internal dimensions."], ["Slotting", "Slots are cut for flaps and closing panels. Blade settings change with the ply and board thickness, especially on heavy cartons."], ["Punching", "Cut-outs, handles and ventilation openings are made with a die fitted to the blank. The cut pattern is checked for clean release."], ["Stitching", "For heavy cartons, wire stitching gives the joint more holding power. The stitch line is kept clear of the product and the closing flap."], ["Waste management", "Trim and offcuts are separated for recycling instead of mixed disposal. Usable offcuts can also support internal packing work."]];

export default function ProcessPage() { return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1000px]">
  <SectionIntro as="h1" eyebrow="Our process" title="Board in. Box out." body="Nine practical stages, handled close to the machine and checked before the next one." />
  <ol className="mt-12 divide-y divide-line border-y border-line">{stages.map(([name, body], i) => <li key={name} className="grid gap-2 py-7 md:grid-cols-[7rem_1fr] md:gap-8">
    <div className="eyebrow pt-1">Stage {String(i + 1).padStart(2, "0")}</div>
    <div><h2 className="text-xl font-semibold">{name}</h2><p className="mt-2 max-w-2xl text-ink-soft">{body}</p></div>
  </li>)}</ol>
  <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Process", path: "/process" }]))} />
</div></div>; }
