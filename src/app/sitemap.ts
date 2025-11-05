import { MetadataRoute } from "next";
import { SERVICE_CATEGORY } from "@/utils/const";
import { api } from "@/api";

interface RecruitmentNotice {
  recruitmentNoticeId: number;
  url: string;
  startAt?: string;
}

async function getRecruitmentNotices(): Promise<RecruitmentNotice[]> {
  try {
    const { data } = await api.get("/recruitment-notices/redirections", {
      params: {
        page: 0,
        pageSize: 9999,
      },
    });
    return data.list || [];
  } catch (error) {
    console.error("Failed to fetch recruitment notices for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nklcb.kr";

  const companyUrls = Object.keys(SERVICE_CATEGORY).map((company) => ({
    url: `${baseUrl}/?company=${company}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Fetch all recruitment notices
  const recruitmentNotices = await getRecruitmentNotices();
  
  // Create URLs for each recruitment notice
  const recruitmentUrls = recruitmentNotices.map((notice) => ({
    url: `${baseUrl}/recruitment-notices?id=${notice.recruitmentNoticeId}&path=${btoa(notice.url)}`,
    lastModified: new Date(notice.startAt || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
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
    ...companyUrls,
    ...recruitmentUrls,
  ];
}
