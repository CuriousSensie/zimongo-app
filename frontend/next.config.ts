import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  experimental: {
    optimizeCss: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      ...[
        'https://images.unsplash.com',
        'https://ih1.redbubble.net',
        'https://images.pexels.com',
        'https://api.dicebear.com',
        'https://localhost:3000', // REMOVE FOR PROD
      ].map((item) => {
        const url = new URL(item);
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        };
      }),
    ],
  },
};

export default nextConfig;
