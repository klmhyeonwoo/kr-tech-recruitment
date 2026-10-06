import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    host: "https://www.nklcb.kr",
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/private/", "/admin/", "/api/"],
      },
    ],
    sitemap: "https://www.nklcb.kr/sitemap.xml",
  };
}
