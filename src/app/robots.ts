import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    host: "https://nklcb.kr",
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/web", "/community", "/question"],
        disallow: ["/private/", "/admin/", "/api/"],
      },
    ],
    sitemap: "https://nklcb.kr/sitemap.xml",
  };
}
