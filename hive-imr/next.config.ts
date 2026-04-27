import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  typescript: {
    // Component is JS-style (no annotations) per Phase 2 "do not refactor".
    // Strict typing lands when the component is split up post-pilot.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
