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
      <div className="flex flex-col gap-5">
        <div className="spec-panel">
          <div className="spec-panel-top"><span>Factory</span><b>Narsingi unit</b></div>
          <div className="spec-panel-rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
        </div>
        {!pending(site.phone) && <a href={`tel:${site.phone}`} className="pill pill-outline focus-ring inline-flex w-fit px-5 py-3 text-sm font-semibold">Call the factory</a>}
        <div className="card flex-1 p-7">
          <h2 className="text-xl font-semibold">Visiting the line</h2>
          <p className="mt-4 text-ink-soft">Visits are welcome by appointment during working hours, so someone running the machines is free to walk you through corrugation, printing and finishing before you commit to a run.</p>
        </div>
      </div>
      <div className="card p-7">
        <h2 className="text-xl font-semibold">The fastest way to get a price</h2>
        <p className="mt-4 text-ink-soft">Six short questions covering format, size, ply, quantity and printing. We reply with a written specification and price within {site.quoteSla}.</p>
        <p className="mt-4 text-ink-soft">Minimum order is {site.moq}. If you need something outside the standard range, tell us the load and the handling route and we will say what can run.</p>
        <p className="mt-4 text-ink-soft">Every quote states the board, ply, GSM and finished dimensions, so your team can compare it against anything else on the desk.</p>
        <Link href="/quote" className="pill focus-ring mt-8 inline-flex bg-ultra px-6 py-3 font-semibold text-paper hover:bg-ink">Request a quote</Link>
      </div>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Contact", path: "/contact" }]))} />
  </div></div>;
}
