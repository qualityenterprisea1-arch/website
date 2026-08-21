import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBoxType, boxTypes } from "@/content/boxTypes";
import { site } from "@/content/site";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export function generateStaticParams() { return boxTypes.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = getBoxType(slug); return item ? pageMetadata(`${item.name} for Business`, `${item.description} Request a specification for your product, handling method and delivery requirements.`, `/boxes/${item.slug}`) : pageMetadata("Box format", "Corrugated packaging format details.", "/boxes"); }

export default async function BoxDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBoxType(slug);
  if (!item) notFound();
  const productSchema = { "@context": "https://schema.org", "@type": "Product", name: item.name, description: item.description, category: "Corrugated packaging", material: "Corrugated board", brand: { "@type": "Brand", name: "Quality Enterprises" } };
  return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1200px]">
    <nav className="eyebrow"><Link href="/boxes" className="focus-ring hover:text-ink">Box formats</Link> <span aria-hidden="true">/</span> {item.name}</nav>
    <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-start">
      <div className="card relative aspect-square overflow-hidden"><Image src={item.image} alt={item.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
      <div>
        <h1 className="text-3xl md:text-4xl">{item.name}</h1>
        <p className="mt-5 max-w-xl text-lg text-ink-soft">{item.description}</p>
        <div className="spec-panel mt-8 max-w-md">
          <div className="spec-panel-top"><span>Format</span><b>Specification</b></div>
          <div className="spec-panel-rows">
            <div><span>Construction</span><b>{item.ply}</b></div>
            <div><span>Best for</span><b>{item.bestFor}</b></div>
            <div><span>Minimum order</span><b>{site.moq}</b></div>
            <div><span>Sizing</span><b>Made to your dimensions</b></div>
          </div>
        </div>
        <p className="mt-8 max-w-xl text-ink-soft">Tell us your internal dimensions, quantity and handling requirement. The quote comes back with the construction stated clearly.</p>
        <Link href={`/contact?box=${item.slug}#quote`} className="pill focus-ring mt-8 inline-flex bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Quote this format</Link>
      </div>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(productSchema)} />
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Box formats", path: "/boxes" }, { name: item.name, path: `/boxes/${item.slug}` }]))} />
  </div></div>;
}
