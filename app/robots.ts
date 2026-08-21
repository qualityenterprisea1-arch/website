import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/seo";

export default function robots(): MetadataRoute.Robots {
  // /leads is the internal staff desk. It is behind a login, but keeping it out
  // of the index means nobody finds it to try. The page also sends noindex.
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/leads" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
