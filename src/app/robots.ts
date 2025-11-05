import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/web", "/recruitment-notices"],
      disallow: ["/private/", "/admin/", "/api/"],
    },
    sitemap: "https://nklcb.kr/sitemap.xml",
  };
}
