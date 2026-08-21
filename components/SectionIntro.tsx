export function SectionIntro({ eyebrow, title, body, light = false, as: Heading = "h2" }: { eyebrow: string; title: string; body: string; light?: boolean; as?: "h1" | "h2" }) {
  return <div className={light ? "text-paper" : ""}>
    <div className={`eyebrow ${light ? "!text-paper/60" : ""}`}>{eyebrow}</div>
    <Heading className="mt-4 max-w-3xl text-3xl md:text-5xl">{title}</Heading>
    <p className={`mt-5 max-w-2xl ${light ? "text-paper/70" : "text-ink-soft"}`}>{body}</p>
  </div>;
}
