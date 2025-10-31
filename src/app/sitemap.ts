import { MetadataRoute } from "next";
import { SERVICE_CATEGORY } from "@/utils/const";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://nklcb.kr";

  const companyUrls = Object.keys(SERVICE_CATEGORY).map((company) => ({
    url: `${baseUrl}/web?company=${company}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/web`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/question`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/recruitment-notices`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...companyUrls,
  ];
}
