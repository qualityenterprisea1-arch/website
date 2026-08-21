import type { Metadata } from "next";

// Single source of truth for the public origin. Set NEXT_PUBLIC_SITE_URL in Vercel
// to the live domain; the fallback only exists so local builds work. Canonicals,
// OG tags, JSON-LD, robots.txt and the sitemap all read from here, so getting this
// wrong advertises a domain we may not own.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const siteName = "Quality Enterprises";

export function pageMetadata(title: string, description: string, path = ""): Metadata {
  const canonical = `${siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, siteName, title: `${title} | ${siteName}`, description, locale: "en_IN" },
    twitter: { card: "summary", title: `${title} | ${siteName}`, description },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${siteUrl}${item.path}` })) };
}

export function jsonLdScript(value: unknown) {
  // Escape the characters that could close the surrounding <script> tag or open a
  // comment. Nothing user-controlled reaches this today — every caller passes
  // constants or a slug already narrowed by generateStaticParams — but this is
  // injected with dangerouslySetInnerHTML, so it should not depend on that.
  return { __html: JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026") };
}
