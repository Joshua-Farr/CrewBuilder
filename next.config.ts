import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // recharts/framer-motion break under optimizePackageImports (webpack "reading 'call'" on /)
    optimizePackageImports: ["lucide-react"],
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
