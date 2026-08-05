import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  allowedDevOrigins: [
    "*.space-z.ai",
    "preview-*.space-z.ai",
  ],
};

export default nextConfig;
