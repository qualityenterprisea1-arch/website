import type { Metadata } from "next";

// Single source of truth for the public origin. Canonicals, OG tags, JSON-LD,
// robots.txt and the sitemap all read from here.
//
// The order matters. NEXT_PUBLIC_SITE_URL wins so a custom domain can be forced.
// Failing that we use Vercel's own production URL, which is the deployment's real
// public origin and becomes the custom domain automatically once one is attached —
// so a forgotten env var degrades to "correct but unbranded" rather than shipping
// canonical tags pointing at localhost. This module is server-only (no client
// component imports it), so the unprefixed Vercel variable is readable here.
// `??` is wrong here: an env var set to an empty string in the Vercel dashboard is
// "" not undefined, which would slip through and crash the build on `new URL("")`.
// Treat blank as unset.
const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);
const vercelHost = clean(process.env.VERCEL_PROJECT_PRODUCTION_URL);

const configured =
  clean(process.env.NEXT_PUBLIC_SITE_URL) ??
  (vercelHost ? `https://${vercelHost}` : undefined) ??
  "http://localhost:3000";

export const siteUrl = configured.replace(/\/+$/, "");
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
