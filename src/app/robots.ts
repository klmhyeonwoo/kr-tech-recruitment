import { MetadataRoute } from "next";
import { BASE_URL } from "@/utils/const";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/web", "/community", "/question", "/recruitment-notices"],
      disallow: ["/private/", "/admin/", "/api/", "/auth"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
