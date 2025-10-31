import { MetadataRoute } from "next";
import { SERVICE_CATEGORY, BASE_URL } from "@/utils/const";

export default function sitemap(): MetadataRoute.Sitemap {
  const companyUrls = Object.keys(SERVICE_CATEGORY).map((company) => ({
    url: `${BASE_URL}/web?company=${company}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/web`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/question`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/recruitment-notices`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...companyUrls,
  ];
}
