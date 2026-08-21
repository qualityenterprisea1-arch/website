import type { Metadata } from "next";
import { Instrument_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { MobileBar } from "@/components/MobileBar";
import { Footer } from "@/components/Footer";
import { site } from "@/content/site";
import { siteUrl } from "@/content/seo";

const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Quality Enterprises | Corrugated Packaging Manufacturer", template: "%s | Quality Enterprises" },
  description: "B2B corrugated packaging manufacturing in Narsingi, Hyderabad. Shipping cartons, mailers, storage boxes and protective formats for procurement and operations teams.",
  alternates: { canonical: siteUrl },
  openGraph: { type: "website", siteName: site.name, title: "Quality Enterprises | Corrugated Packaging Manufacturer", description: "B2B corrugated packaging manufacturing in Narsingi, Hyderabad for shipping, storage and handling.", url: siteUrl, locale: "en_IN" },
  twitter: { card: "summary", title: "Quality Enterprises | Corrugated Packaging Manufacturer", description: "B2B corrugated packaging manufacturing in Narsingi, Hyderabad." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = { "@context": "https://schema.org", "@type": ["Organization", "LocalBusiness"], "@id": `${siteUrl}#organization`, name: site.name, url: siteUrl, address: { "@type": "PostalAddress", streetAddress: "Narsingi", addressLocality: "Hyderabad", addressRegion: "Telangana", postalCode: "500089", addressCountry: "IN" }, areaServed: "Hyderabad", openingHours: site.hours };
  return <html lang="en"><body className={`${instrument.variable} ${mono.variable}`}><Header /><main>{children}</main><Footer /><MobileBar /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></body></html>;
}
