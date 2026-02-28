import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

// Trigger Vercel Auto-Deploy

// Trigger Vercel Auto-Deploy for Next.js Preset Update
