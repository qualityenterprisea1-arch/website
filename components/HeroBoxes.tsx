import Link from "next/link";
import Image from "next/image";
import { boxTypes } from "@/content/boxTypes";

function ProductTile({ item, mobile = false }: { item: (typeof boxTypes)[number]; mobile?: boolean }) {
  return <Link href={`/boxes/${item.slug}`} className={`focus-ring group shrink-0 bg-paper ${mobile ? "w-[190px] border border-ink/20 p-3" : "card p-3"}`}>
    <div className={`relative overflow-hidden bg-white ${mobile ? "aspect-[4/3]" : "aspect-[4/3] border border-ink/20"}`}><Image src={item.image} alt={item.name} fill sizes={mobile ? "190px" : "(max-width: 1024px) 25vw, 280px"} className="object-contain transition-transform duration-300 group-hover:scale-105" /></div>
    <span className="mt-3 block text-center text-xs font-bold uppercase leading-tight tracking-[.06em] group-hover:text-ultra">{item.name}</span>
  </Link>;
}

export function HeroBoxes() {
  const mobileItems = boxTypes.slice(0, 8);
  return <div className="mt-14">
    <div className="hidden gap-5 md:grid md:grid-cols-4">{mobileItems.slice(0, 4).map((item) => <ProductTile item={item} key={item.slug} />)}</div>
    <div className="mobile-product-marquee md:hidden" aria-label="Packaging formats">
      <div className="mobile-product-marquee__track">{[...mobileItems, ...mobileItems].map((item, index) => <ProductTile item={item} mobile key={`${item.slug}-${index}`} />)}</div>
    </div>
    <p className="mono mt-4 text-center text-[10px] uppercase tracking-[.16em] text-ink-soft md:hidden">Packaging formats available on request</p>
  </div>;
}
