import { MetadataRoute } from "next";
import { SERVICE_CATEGORY } from "@/utils/const";

export const revalidate = 86400; // Revalidate once per day

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://nklcb.kr";

  const companyUrls = Object.keys(SERVICE_CATEGORY).map((company) => ({
    url: `${baseUrl}/?company=${company}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const staticPages = [
    {
      url: `${baseUrl}/web`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/question`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...companyUrls,
    ...staticPages,
  ];
}
