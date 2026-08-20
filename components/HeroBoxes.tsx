import Link from "next/link";
import { boxTypes } from "@/content/boxTypes";

function Placeholder({ item }: { item: (typeof boxTypes)[number] }) { return <div className="relative grid aspect-square w-44 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink md:w-auto" style={{ background: item.colour }}><div className="absolute inset-5 rounded-full border border-paper/40" /><div className="relative px-6 text-center"><div className="mono text-xs font-bold uppercase tracking-[.16em] text-paper/80">Photo slot</div><div className="mt-2 font-bold leading-tight text-paper">{item.name}</div></div></div>; }

export function HeroBoxes() { return <div className="mt-14 overflow-x-auto pb-4"><div className="flex gap-5 md:grid md:grid-cols-4">{boxTypes.slice(0, 4).map((item) => <Link href={`/boxes/${item.slug}`} key={item.slug} className="focus-ring group"><Placeholder item={item} /><span className="mt-3 block text-center text-sm font-bold group-hover:text-ultra">{item.name}</span></Link>)}</div></div>; }
