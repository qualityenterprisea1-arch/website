import Link from "next/link";
import Image from "next/image";
import { boxTypes } from "@/content/boxTypes";
import { site } from "@/content/site";

const stats: [string, string][] = [
  ["Minimum order", site.moq],
  ["Quote turnaround", site.quoteSla],
  ["Board", "3, 5 and 7 ply"],
  ["Formats", `${boxTypes.length} standard + custom`],
];

/* Delays are hand-set rather than computed so the cascade reads as one movement:
   rule, eyebrow, headline lines, sub, buttons, then the strip underneath. */
export function Hero() {
  return <section className="hero">
    <div className="hero-media aspect-[4/3] lg:aspect-auto">
      <div className="hero-float">
        <Image src={boxTypes[0].image} alt="Kraft corrugated shipping cartons in three sizes" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="hero-reveal" />
      </div>
      <span className="hero-wash" aria-hidden="true" />
      <span className="hero-sheen" aria-hidden="true" />
    </div>

    <div className="relative z-[4] mx-auto w-full max-w-[1400px] px-5 pb-14 pt-16 md:px-10 md:pb-20 md:pt-24 lg:min-h-[min(86vh,780px)] lg:pb-28 lg:pt-32">
      <div className="max-w-[36rem] lg:max-w-[34rem]">
        <span className="hero-rule mb-7 block h-px w-16 bg-ink/35" style={{ animationDelay: "80ms" }} aria-hidden="true" />
        <div className="eyebrow hero-rise" style={{ animationDelay: "160ms" }}>Corrugated packaging &middot; Narsingi, Hyderabad</div>

        <h1 className="mt-6 text-[clamp(2.6rem,5.6vw,4.4rem)]">
          <span className="hero-line"><span style={{ animationDelay: "260ms" }}>Packaging built</span></span>
          <span className="hero-line"><span style={{ animationDelay: "360ms" }}>for business.</span></span>
        </h1>

        <p className="hero-rise mt-7 max-w-lg text-lg text-ink-soft" style={{ animationDelay: "520ms" }}>
          Shipping cartons, mailers, storage boxes and protective formats for procurement, warehouse and operations teams.
        </p>

        <div className="hero-rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "640ms" }}>
          <Link href="/quote" className="pill focus-ring bg-ultra px-7 py-3.5 font-semibold text-paper hover:bg-ink">Request a quote</Link>
          <Link href="/boxes" className="pill pill-outline focus-ring border-ink/25 px-7 py-3.5 font-semibold hover:bg-ink/5">See what we make</Link>
        </div>
      </div>
    </div>

    <div className="hero-strip border-t border-ink/12 bg-paper/55 backdrop-blur-sm">
      <dl className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px px-5 md:grid-cols-4 md:px-10">
        {stats.map(([label, value], i) => <div key={label} className="hero-rise py-6 pr-6 md:py-7" style={{ animationDelay: `${780 + i * 90}ms` }}>
          <dt className="eyebrow">{label}</dt>
          <dd className="mt-2 font-medium">{value}</dd>
        </div>)}
      </dl>
    </div>
  </section>;
}
