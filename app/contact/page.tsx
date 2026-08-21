import { SectionIntro } from "@/components/SectionIntro";
import { QuoteForm } from "@/components/QuoteForm";
import { site } from "@/content/site";
import { pageMetadata, breadcrumbSchema, jsonLdScript } from "@/content/seo";

export const metadata = pageMetadata("Contact Quality Enterprises", "Call, email or send a quote request to Quality Enterprises, a corrugated packaging unit at IDA Mallapur, Hyderabad. Written specification and price within four working hours.", "/contact");

const pending = (v: string) => v.toLowerCase().includes("pending");

export default function ContactPage() {
  // Rows are omitted rather than shown as "pending" until the real values land.
  const rows: [string, string][] = [["Address", site.address], ["Phone", site.phone], ["Email", site.email], ["Also", site.emailAlt], ["Hours", site.hours],
    ...([["GSTIN", site.gstin]] as [string, string][]).filter(([, v]) => !pending(v))];

  return <div className="site-grid px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-[1100px]">
    <SectionIntro as="h1" eyebrow="Contact the factory" title="Talk to the people who make the box." body="Call us, email us, or send the specification below and we will come back with a written answer. Visitors are welcome at the IDA Mallapur unit by appointment." />

    <div className="mt-12 grid gap-5 md:grid-cols-2">
      <div className="flex flex-col gap-5">
        <div className="spec-panel">
          <div className="spec-panel-top"><span>Factory</span><b>IDA Mallapur unit</b></div>
          <div className="spec-panel-rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={site.phoneHref} className="pill focus-ring inline-flex bg-ultra px-5 py-3 text-sm font-semibold text-paper hover:bg-ink">Call {site.phone}</a>
          <a href={`mailto:${site.email}`} className="pill pill-outline focus-ring inline-flex px-5 py-3 text-sm font-semibold">Email the factory</a>
        </div>

        <div className="card overflow-hidden p-0">
          <iframe
            title="Quality Enterprises factory location on Google Maps"
            src={site.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[320px] w-full border-0 md:h-[380px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-5">
            <p className="text-sm text-ink-soft">{site.address}</p>
            <a href={site.mapLink} target="_blank" rel="noopener noreferrer" className="focus-ring text-sm font-medium text-ultra hover:underline">Open in Maps</a>
          </div>
        </div>

        <div className="card p-7">
          <h2 className="text-xl font-semibold">Visiting the line</h2>
          <p className="mt-4 text-ink-soft">Visits are welcome by appointment during working hours, so someone running the machines is free to walk you through corrugation, printing and finishing before you commit to a run.</p>
        </div>
      </div>

      <div id="quote" className="scroll-mt-28">
        <QuoteForm />
        <p className="mt-5 text-sm text-ink-soft">Every quote states the board, ply, GSM and finished dimensions, so your team can compare it against anything else on the desk. If you need something outside the standard range, call {site.phone} and tell us the load and the handling route.</p>
      </div>
    </div>

    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema([{ name: "Home", path: "" }, { name: "Contact", path: "/contact" }]))} />
  </div></div>;
}
