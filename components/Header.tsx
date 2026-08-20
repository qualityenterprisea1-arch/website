"use client";

import Link from "next/link";
import { useState } from "react";

const links = [["Boxes", "/boxes"], ["About us", "/about"], ["Our process", "/process"], ["Our works", "/works"], ["Contact", "/contact"]];

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-20 border-b-2 border-ink bg-paper/95 backdrop-blur-sm"><div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 lg:px-10"><Link href="/" className="focus-ring text-2xl font-bold tracking-tight">Quality<span className="text-ultra">.</span></Link><nav className="hidden items-center gap-7 lg:flex">{links.map(([label, href]) => <Link key={href} href={href} className="focus-ring text-sm font-semibold hover:text-ultra">{label}</Link>)}</nav><div className="hidden items-center gap-3 lg:flex"><Link href="/quote" className="focus-ring text-sm font-semibold">Request a quote</Link><Link href="/contact" className="pill focus-ring bg-ultra px-5 py-2 text-sm font-bold text-paper">Call the factory</Link></div><button aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)} className="focus-ring pill px-4 py-2 text-sm font-bold lg:hidden">Menu</button></div>{open && <nav className="border-t-2 border-ink bg-paper px-5 py-4 lg:hidden">{links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="focus-ring block border-b border-ink/20 py-3 font-semibold">{label}</Link>)}<Link onClick={() => setOpen(false)} href="/quote" className="mt-4 inline-flex pill bg-ultra px-5 py-3 font-bold text-paper">Request a quote</Link></nav>}</header>;
}
