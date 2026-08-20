import type { ReactNode } from "react";
import { pageMetadata } from "@/content/seo";

export const metadata = pageMetadata("Request a Corrugated Box Quote", "Send your box format, dimensions, ply, quantity and printing requirements to Quality Enterprises for a written B2B packaging quote.", "/quote");

export default function QuoteLayout({ children }: { children: ReactNode }) { return children; }
