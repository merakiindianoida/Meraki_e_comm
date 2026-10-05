import path from "node:path";
import type { NextConfig } from "next";

// Baseline hardening headers, applied to every route. Deliberately no
// Content-Security-Policy here - Clerk, Cloudinary, and Resend each need
// specific allowances, and a wrong CSP fails silently (a blocked script
// just doesn't run, with no obvious error) rather than loudly, so it needs
// its own dedicated pass with real testing, not a bolt-on here.
const securityHeaders = [
  // Blocks the site from being embedded in an iframe on another domain -
  // the standard clickjacking defense.
  { key: "X-Frame-Options", value: "DENY" },
  // Stops browsers from guessing/"sniffing" a file's type from its
  // content instead of trusting the server's Content-Type - closes off a
  // class of attacks where a malicious upload gets reinterpreted as HTML
  // or a script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only sends the full referring URL to same-origin requests; other
  // sites just see the origin, not the full path/query someone came from.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Explicitly denies device APIs this site never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    // There's an unrelated package.json/lockfile sitting directly in
    // C:\Users\SATYAM MISHRA\ (outside this project) that makes Next.js's
    // auto-detected workspace root ambiguous - it was picking that folder
    // instead of this one, which led to a stale Turbopack cache. Pinning
    // it here removes the guesswork.
    root: path.resolve(__dirname),
  },
  images: {
    // AVIF preferred (20-40% smaller than WebP); WebP fallback for older
    // browsers. Both formats are generated automatically by Next's image
    // optimizer based on the request's Accept header, so the same <Image>
    // call works everywhere.
    formats: ["image/avif", "image/webp"],
    // Most product/hero/catalog views look fine at q=75; higher values
    // blow out bytes for no perceptual gain at these sizes.
    qualities: [60, 75, 85],
    // Bump from the 4h default to 30 days — product + hero images don't
    // churn that often, and regenerating optimized AVIF/WebP is the
    // slowest part of a cold-cache hit on Lighthouse/Slow-4G throttling.
    minimumCacheTTL: 2_592_000,
    remotePatterns: [
      // Product photos live on Cloudinary (res.cloudinary.com/tksnn8ya).
      // Restricted to that exact account + the /image/upload path, not
      // the whole Cloudinary CDN, per the docs' "be as specific as
      // possible" rule for remotePatterns.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/tksnn8ya/image/upload/**",
        search: "",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
