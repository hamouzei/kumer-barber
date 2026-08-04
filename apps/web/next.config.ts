import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    // Allows transparent proxying if NEXT_PUBLIC_API_URL is set to relative /api/v1 or external
    const targetApi = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!targetApi || targetApi.startsWith("/")) {
      return [];
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${targetApi.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
