import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/web", "/community", "/question", "/recruitment-notices"],
      disallow: ["/private/", "/admin/", "/api/", "/auth"],
    },
    sitemap: "https://nklcb.kr/sitemap.xml",
  };
}
