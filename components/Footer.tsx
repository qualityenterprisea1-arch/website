import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

export function Footer() { return <footer className="site-footer border-t border-line bg-paper px-5 pb-[calc(3rem+var(--mobile-bar-reserve))] pt-14 md:px-10 md:pb-12">
  <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[1fr_auto_auto] md:items-start">
    <div className="min-w-0"><Link href="/" className="focus-ring inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight"><Image src="/logo.png" alt="" width={181} height={209} className="h-8 w-auto" />Quality Enterprises</Link><p className="mt-4 max-w-sm break-words text-sm text-ink-soft">Corrugated packaging for shipping, storage and handling. Manufactured at IDA Mallapur, Hyderabad.</p></div>
    <div className="min-w-0"><div className="eyebrow">Visit</div><p className="mt-3 max-w-[220px] break-words text-sm font-medium">{site.address}</p><p className="mt-2 text-sm text-ink-soft">{site.hours}</p><a href={site.phoneHref} className="focus-ring mt-3 block text-sm font-medium hover:underline">{site.phone}</a><a href={`mailto:${site.email}`} className="focus-ring mt-1 block break-words text-sm text-ink-soft hover:underline">{site.email}</a></div>
    <div><div className="eyebrow">Start here</div><Link href="/contact#quote" className="focus-ring mt-3 block text-sm font-medium text-ultra hover:underline">Request a quote</Link><Link href="/contact" className="focus-ring mt-2 block text-sm font-medium hover:underline">Contact the factory</Link></div>
  </div>
  <div className="mx-auto mt-12 max-w-[1400px] border-t border-line pt-5 text-sm text-ink-soft">© {new Date().getFullYear()} Quality Enterprises, IDA Mallapur, Hyderabad.</div>
</footer>; }
