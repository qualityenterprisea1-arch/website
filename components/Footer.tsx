import Link from "next/link";
import { site } from "@/content/site";

export function Footer() { return <footer className="site-footer border-t border-line bg-paper px-5 pb-[calc(3rem+var(--mobile-bar-reserve))] pt-14 md:px-10 md:pb-12">
  <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[1fr_auto_auto] md:items-start">
    <div className="min-w-0"><Link href="/" className="focus-ring text-lg font-semibold tracking-tight">Quality Enterprises</Link><p className="mt-4 max-w-sm break-words text-sm text-ink-soft">Corrugated packaging for shipping, storage and handling. Manufactured in Narsingi, Hyderabad.</p></div>
    <div className="min-w-0"><div className="eyebrow">Visit</div><p className="mt-3 max-w-[220px] break-words text-sm font-medium">{site.address}</p><p className="mt-2 text-sm text-ink-soft">{site.hours}</p></div>
    <div><div className="eyebrow">Start here</div><Link href="/quote" className="focus-ring mt-3 block text-sm font-medium text-ultra hover:underline">Request a quote</Link><Link href="/contact" className="focus-ring mt-2 block text-sm font-medium hover:underline">Contact the factory</Link></div>
  </div>
  <div className="mx-auto mt-12 max-w-[1400px] border-t border-line pt-5 text-sm text-ink-soft">© {new Date().getFullYear()} Quality Enterprises, Narsingi, Hyderabad.</div>
</footer>; }
