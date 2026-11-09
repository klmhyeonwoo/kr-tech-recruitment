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
    // 예전 홈 탭 주소(/?view=...)는 각 페이지의 실제 주소로 영구 이동합니다.
    const legacyViews = {
      remote: "/remote-work-companies",
      activities: "/dev-activities",
      interview: "/interview-questions",
      trends: "/tech-trends",
      community: "/community",
    } as const;
    return [
      ...Object.entries(legacyViews).map(([view, destination]) => ({
        source: "/",
        has: [{ type: "query" as const, key: "view", value: view }],
        destination,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
