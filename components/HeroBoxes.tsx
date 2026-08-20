import Link from "next/link";
import Image from "next/image";
import { boxTypes } from "@/content/boxTypes";

function ProductImage({ item }: { item: (typeof boxTypes)[number] }) { return <div className="relative grid aspect-square w-44 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink bg-paper md:w-auto"><Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 176px, 25vw" className="object-contain" /></div>; }

export function HeroBoxes() { return <div className="mt-14 overflow-x-auto pb-4"><div className="flex gap-5 md:grid md:grid-cols-4">{boxTypes.slice(0, 4).map((item) => <Link href={`/boxes/${item.slug}`} key={item.slug} className="focus-ring group"><ProductImage item={item} /><span className="mt-3 block text-center text-sm font-bold group-hover:text-ultra">{item.name}</span></Link>)}</div></div>; }
