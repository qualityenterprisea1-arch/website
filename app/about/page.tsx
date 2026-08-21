import { SectionIntro } from "@/components/SectionIntro";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("About Quality Enterprises", "Quality Enterprises is a corrugated packaging manufacturing unit in Narsingi, Hyderabad, supplying procurement, warehouse and operations teams.", "/about");

const panels: [string, string][] = [
  ["For working supply chains", "We support procurement, warehouses, dispatch teams, retailers and manufacturers with repeatable packaging formats and clear board specifications."],
  ["What we do here", "We run corrugation, cutting, printing, pasting, scoring, slotting and finishing. You can visit and see the line before your order is made."],
];

export default function AboutPage() { return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1000px]">
  <SectionIntro as="h1" eyebrow="About the factory" title="A practical packaging partner for business." body="Quality Enterprises is a corrugated packaging manufacturing unit in Narsingi, Hyderabad. We make the board and convert it into formats your operations team can use." />
  <div className="mt-12 grid gap-5 md:grid-cols-2">{panels.map(([title, body]) => <div key={title} className="card p-7">
    <h2 className="text-xl font-semibold">{title}</h2><p className="mt-4 text-ink-soft">{body}</p>
  </div>)}</div>
  <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "About", path: "/about" }]))} />
</div></div>; }
