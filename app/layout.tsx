import type { Metadata } from "next";
import { Anton, Instrument_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { MobileBar } from "@/components/MobileBar";
import { Footer } from "@/components/Footer";
import { site } from "@/content/site";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Quality Enterprises | Corrugated Boxes from 500 Units", template: "%s | Quality Enterprises" },
  description: "B2B corrugated packaging manufacturing in Narsingi, Hyderabad. Shipping cartons, mailers, storage boxes and protective formats with a written quote in 4 working hours.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = { "@context": "https://schema.org", "@type": ["Organization", "LocalBusiness"], name: site.name, address: { "@type": "PostalAddress", streetAddress: site.address, addressLocality: "Hyderabad", addressRegion: "Telangana", postalCode: "500089", addressCountry: "IN" }, telephone: site.phone, email: site.email, openingHours: site.hours };
  return <html lang="en"><body className={`${anton.variable} ${instrument.variable} ${mono.variable}`}><Header /><main>{children}</main><Footer /><MobileBar /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></body></html>;
}
