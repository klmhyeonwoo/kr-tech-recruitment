import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE_URL,
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth", "/recruitment-notices"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
