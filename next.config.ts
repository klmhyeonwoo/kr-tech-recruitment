import { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => {
    return [
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
