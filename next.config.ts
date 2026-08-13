import path from "node:path";
import type { NextConfig } from "next";

// Baseline hardening headers, applied to every route. Deliberately no
// Content-Security-Policy here — Clerk, Cloudinary, and Resend each need
// specific allowances, and a wrong CSP fails silently (a blocked script
// just doesn't run, with no obvious error) rather than loudly, so it needs
// its own dedicated pass with real testing, not a bolt-on here.
const securityHeaders = [
  // Blocks the site from being embedded in an iframe on another domain —
  // the standard clickjacking defense.
  { key: "X-Frame-Options", value: "DENY" },
  // Stops browsers from guessing/"sniffing" a file's type from its
  // content instead of trusting the server's Content-Type — closes off a
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
    // auto-detected workspace root ambiguous — it was picking that folder
    // instead of this one, which led to a stale Turbopack cache. Pinning
    // it here removes the guesswork.
    root: path.resolve(__dirname),
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
