import type { Metadata } from "next";
import { LeadsDesk } from "./LeadsDesk";

/* The internal leads desk. Staff only, and deliberately invisible to search:
   it is on the public domain for convenience, not for discovery. */
export const metadata: Metadata = {
  title: "Leads desk",
  description: "Internal sales desk for Quality Enterprises staff.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function LeadsPage() {
  return <div className="site-grid px-5 py-12 md:px-10">
    <div className="mx-auto max-w-[1500px]"><LeadsDesk /></div>
  </div>;
}
