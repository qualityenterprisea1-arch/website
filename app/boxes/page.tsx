import Link from "next/link";
import Image from "next/image";
import { boxTypes } from "@/content/boxTypes";
import { SectionIntro } from "@/components/SectionIntro";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("Corrugated Box Formats for Business", "Explore Quality Enterprises corrugated shipping, mailer, storage and handling formats. Choose a starting point and request a box specification for your operation.", "/boxes");

export default function BoxesPage() { return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1400px]">
  <SectionIntro as="h1" eyebrow="B2B packaging range" title="Formats for shipping, storage and handling." body="Start with the closest format. We will size it around your product, packing method, stacking requirement and delivery route." />
  <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{boxTypes.map((item) => <Link key={item.slug} href={`/boxes/${item.slug}`} className="card focus-ring group flex flex-col p-4 transition-colors hover:border-ink">
    <div className="relative aspect-[4/3] overflow-hidden rounded bg-white"><Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-3" /></div>
    <h2 className="mt-4 text-base font-semibold">{item.name}</h2>
    <p className="mt-2 text-sm text-ink-soft">{item.description}</p>
    <span className="mt-4 text-sm font-medium text-ultra group-hover:underline">View format</span>
  </Link>)}</div>
  <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Box formats", path: "/boxes" }]))} />
</div></div>; }
