import Link from "next/link";
import { site } from "@/content/site";

export function MobileBar() {
  return <div className="mobile-bar fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-line bg-paper p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] lg:hidden">
    <a className="pill pill-outline focus-ring flex min-h-12 items-center justify-center text-sm font-semibold" href={site.phoneHref}>Call the factory</a>
    <Link className="pill focus-ring flex min-h-12 items-center justify-center bg-ultra text-sm font-semibold text-paper" href="/contact#quote">Request a quote</Link>
  </div>;
}
