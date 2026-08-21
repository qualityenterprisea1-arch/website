"use client";

import Link from "next/link";
import { useState } from "react";

const links = [["Boxes", "/boxes"], ["About us", "/about"], ["Our process", "/process"], ["Capabilities", "/works"], ["Contact", "/contact"]];

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-sm">
    <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 lg:px-10">
      <Link href="/" className="focus-ring text-lg font-semibold tracking-tight sm:text-xl">Quality Enterprises</Link>
      <nav className="hidden items-center gap-7 lg:flex">{links.map(([label, href]) => <Link key={href} href={href} className="focus-ring text-sm text-ink-soft transition-colors hover:text-ink">{label}</Link>)}</nav>
      <div className="hidden items-center gap-4 lg:flex">
        <Link href="/contact" className="focus-ring text-sm text-ink-soft transition-colors hover:text-ink">Contact the factory</Link>
        <Link href="/quote" className="pill focus-ring bg-ultra px-4 py-2 text-sm font-semibold text-paper hover:bg-ink">Request a quote</Link>
      </div>
      <button aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)} className="focus-ring pill pill-outline px-4 py-2 text-sm font-semibold lg:hidden">Menu</button>
    </div>
    {open && <nav className="border-t border-line bg-paper px-5 py-4 lg:hidden">{links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="focus-ring block border-b border-line py-3 text-sm font-medium">{label}</Link>)}<Link onClick={() => setOpen(false)} href="/quote" className="pill focus-ring mt-4 inline-flex bg-ultra px-5 py-3 text-sm font-semibold text-paper">Request a quote</Link></nav>}
  </header>;
}
