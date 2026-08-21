import Image from "next/image";
import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { boxTypes } from "@/content/boxTypes";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("Corrugated Packaging Capabilities", "Review the corrugated box formats and packaging capabilities Quality Enterprises can discuss with procurement, warehouse and operations teams.", "/works");

export default function WorksPage() {
  return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1400px]">
    <SectionIntro as="h1" eyebrow="Capabilities" title="A working range for real operations." body="The formats, constructions and handling jobs we can take on. Named client work is shared on request rather than published." />
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{boxTypes.slice(0, 12).map((item) => <Link key={item.slug} href={`/boxes/${item.slug}`} className="card focus-ring group flex flex-col p-4 transition-colors hover:border-ink">
      <div className="relative aspect-[4/3] overflow-hidden rounded bg-white"><Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-3" /></div>
      <h2 className="mt-4 text-base font-semibold">{item.name}</h2>
      <p className="mt-2 text-sm text-ink-soft">{item.bestFor}. {item.ply} construction.</p>
    </Link>)}</div>
    <div className="card mt-12 p-8 md:p-10">
      <div className="eyebrow">Need a different format?</div>
      <h2 className="mt-4 text-2xl md:text-3xl">Send the dimensions and handling requirement.</h2>
      <p className="mt-4 max-w-2xl text-ink-soft">We will tell you what can run, what board it needs and what information is needed for a proper quote.</p>
      <Link href="/quote" className="pill focus-ring mt-8 inline-flex bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Request a quote</Link>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Works", path: "/works" }]))} />
  </div></div>;
}
