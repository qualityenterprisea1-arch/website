import Image from "next/image";
import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { boxTypes } from "@/content/boxTypes";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("Corrugated Packaging Capabilities", "Review the corrugated box formats and packaging capabilities Quality Enterprises can discuss with procurement, warehouse and operations teams.", "/works");

export default function WorksPage() {
  return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1400px]"><SectionIntro eyebrow="Capability gallery" title="A working range for real operations." body="We do not publish invented client case studies. This gallery shows the formats, constructions and handling jobs we can discuss with your team." /><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{boxTypes.slice(0, 12).map((item) => <Link key={item.slug} href={`/boxes/${item.slug}`} className="card focus-ring group bg-paper p-4"><div className="relative aspect-[4/3] overflow-hidden border border-ink/20 bg-white"><Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain transition-transform duration-300 group-hover:scale-105" /></div><h2 className="mt-4 text-2xl group-hover:text-ultra">{item.name}</h2><p className="mt-2 text-sm text-ink-soft">{item.bestFor}. {item.ply} construction.</p></Link>)}</div><div className="card mt-10 bg-kraft p-7 md:p-9"><div className="eyebrow">Need a different format?</div><h2 className="mt-4 text-4xl">Send the dimensions and handling requirement.</h2><p className="mt-4 max-w-2xl text-ink-soft">We will tell you what can run, what board it needs and what information is needed for a proper quote.</p><Link href="/quote" className="pill focus-ring mt-7 inline-flex bg-ultra px-6 py-3 font-bold text-paper">Request a quote ↗</Link></div><script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Works", path: "/works" }]))} /></div></div>;
}
