import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons', '@radix-ui/react-avatar', '@radix-ui/react-dialog']
  }
};

export default nextConfig;
