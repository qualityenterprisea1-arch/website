import Link from "next/link";
import Image from "next/image";
import { boxTypes } from "@/content/boxTypes";

function ProductTile({ item, mobile = false }: { item: (typeof boxTypes)[number]; mobile?: boolean }) {
  return <Link href={`/boxes/${item.slug}`} className={`card focus-ring group shrink-0 p-3 transition-colors hover:border-ink ${mobile ? "w-[190px]" : ""}`}>
    <div className="relative aspect-[4/3] overflow-hidden rounded-sm"><Image src={item.image} alt={item.name} fill sizes={mobile ? "190px" : "(max-width: 1024px) 25vw, 300px"} className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" /></div>
    <span className="mt-3 block text-sm font-medium">{item.name}</span>
  </Link>;
}

export function HeroBoxes() {
  const items = boxTypes.slice(0, 8);
  return <div className="border-t border-line pt-10">
    <div className="eyebrow">A few of the formats we run</div>
    <div className="mt-5 hidden gap-5 md:grid md:grid-cols-4">{items.slice(0, 4).map((item) => <ProductTile item={item} key={item.slug} />)}</div>
    <div className="mobile-product-marquee mt-5 md:hidden" aria-label="Packaging formats">
      <div className="mobile-product-marquee__track">{[...items, ...items].map((item, index) => <ProductTile item={item} mobile key={`${item.slug}-${index}`} />)}</div>
    </div>
    <Link href="/boxes" className="focus-ring mt-6 inline-block text-sm font-medium text-ultra hover:underline">See all formats</Link>
  </div>;
}
