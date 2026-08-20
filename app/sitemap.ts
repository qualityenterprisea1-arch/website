import type { MetadataRoute } from "next";
import { boxTypes } from "@/content/boxTypes";

export default function sitemap(): MetadataRoute.Sitemap { const base = "https://quality-enterprises.co.in"; return ["", "/about", "/process", "/works", "/boxes", "/contact", "/quote", ...boxTypes.map((item) => `/boxes/${item.slug}`)].map((path) => ({ url: `${base}${path}`, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : path === "/boxes" ? 0.9 : path.startsWith("/boxes/") ? 0.8 : 0.7 })); }
