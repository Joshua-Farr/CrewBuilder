import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "image.optcg.gg" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.wikia.nocookie.net" }
    ],
  },
};

export default nextConfig;
