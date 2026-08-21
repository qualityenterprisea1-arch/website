import type { NextConfig } from "next";

/* No Content-Security-Policy yet: Next injects inline styles and hydration
   scripts, so a correct policy needs a nonce and per-route testing. The headers
   below are the ones that are unambiguously safe to set on a static marketing
   site, and they close clickjacking, MIME sniffing and referrer leakage. */
const securityHeaders = [
  // Clickjacking. frame-ancestors is the modern control; X-Frame-Options covers
  // older browsers that ignore it.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin cross-site so quote referrals are still attributable, but
  // never leak a full path to a third party.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Nothing on this site uses these; deny them rather than leave them open.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // The six-step /quote wizard was replaced by a single form on /contact.
  // Anything already indexed or bookmarked must still land on the form.
  async redirects() {
    return [{ source: "/quote", destination: "/contact#quote", permanent: true }];
  },
};

export default nextConfig;
