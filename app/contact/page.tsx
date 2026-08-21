import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { site } from "@/content/site";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("Contact Quality Enterprises", "Contact Quality Enterprises in Narsingi, Hyderabad about corrugated packaging formats, board construction and a written B2B quote.", "/contact");

const pending = (v: string) => v.toLowerCase().includes("pending");

export default function ContactPage() {
  // Contact rows are omitted rather than shown as "pending" until the real values land.
  const rows: [string, string][] = [["Address", site.address], ["Hours", site.hours],
    ...([["Phone", site.phone], ["Email", site.email], ["GSTIN", site.gstin]] as [string, string][]).filter(([, v]) => !pending(v))];

  return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1100px]">
    <SectionIntro as="h1" eyebrow="Contact the factory" title="Talk to the people who make the box." body="Send the basics and we will come back with a written answer, or visit the unit in Narsingi." />
    <div className="mt-12 grid gap-5 md:grid-cols-2">
      <div className="card p-7">
        <h2 className="text-xl font-semibold">Factory details</h2>
        <dl className="mt-6 grid gap-5">{rows.map(([label, value]) => <div key={label}>
          <dt className="eyebrow">{label}</dt><dd className="mt-1 font-medium">{value}</dd>
        </div>)}</dl>
        {!pending(site.phone) && <a href={`tel:${site.phone}`} className="pill pill-outline focus-ring mt-8 inline-flex px-5 py-3 text-sm font-semibold">Call the factory</a>}
      </div>
      <div className="card p-7">
        <h2 className="text-xl font-semibold">The fastest way to get a price</h2>
        <p className="mt-4 text-ink-soft">Six short questions covering format, size, ply, quantity and printing. We reply with a written specification and price within {site.quoteSla}.</p>
        <p className="mt-4 text-ink-soft">Minimum order is {site.moq}. If you need something outside the standard range, tell us the load and the handling route and we will say what can run.</p>
        <Link href="/quote" className="pill focus-ring mt-8 inline-flex bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Request a quote</Link>
      </div>
    </div>
    <p className="mt-8 max-w-2xl text-sm text-ink-soft">Visits are welcome by appointment during working hours so someone from the line is free to walk you through the machines.</p>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Contact", path: "/contact" }]))} />
  </div></div>;
}
