import type { Metadata } from "next";

export const siteUrl = "https://quality-enterprises.co.in";
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
  return { __html: JSON.stringify(value) };
}
