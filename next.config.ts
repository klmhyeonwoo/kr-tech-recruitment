import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize production builds
  poweredByHeader: false,
  compress: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  headers: async () => {
    return [
      {
        source: "/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/ads.txt",
        destination: "https://srv.adstxtmanager.com/79067/nklcb.kr",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
