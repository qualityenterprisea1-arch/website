import type { MetadataRoute } from "next";
import { boxTypes } from "@/content/boxTypes";
import { siteUrl } from "@/content/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/about", "/process", "/works", "/boxes", "/contact", ...boxTypes.map((item) => `/boxes/${item.slug}`)];
  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path === "/boxes" ? 0.9 : path.startsWith("/boxes/") ? 0.8 : 0.7,
  }));
}
