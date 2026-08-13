import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // There's an unrelated package.json/lockfile sitting directly in
    // C:\Users\SATYAM MISHRA\ (outside this project) that makes Next.js's
    // auto-detected workspace root ambiguous — it was picking that folder
    // instead of this one, which led to a stale Turbopack cache. Pinning
    // it here removes the guesswork.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
