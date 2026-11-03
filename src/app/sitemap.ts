import { MetadataRoute } from "next";
import { companyUrl, getRecruitmentCompanies } from "@/lib/seo/companies";
import community from "@/api/domain/community";
import hotIssue from "@/api/domain/hotIssue";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 86400; // Revalidate once per day

const COMMUNITY_PAGE_SIZE = 50;
const MAX_COMMUNITY_PAGE_COUNT = 25;

type CommunityBoard = {
  boardId: number;
  createdAt?: string;
  modifiedAt?: string;
};

type CommunityListResponse = {
  list: CommunityBoard[];
  metadata?: {
    totalElements?: number;
  };
};

type HotIssueResponse = {
  list: Array<{
    createdAt?: string;
    modifiedAt?: string;
  }>;
};

const toDate = (value?: string) => {
  if (!value) return undefined;
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

async function getCommunitySitemapEntries(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await community.standardList({
      page: 0,
      pageSize: COMMUNITY_PAGE_SIZE,
    });

    if (!response || response.status !== 200) {
      console.warn("[sitemap] Community first page unavailable", { status: response?.status });
      return [];
    }

    const firstPageData = response.data as CommunityListResponse;
    const totalElements =
      firstPageData.metadata?.totalElements ?? firstPageData.list.length;
    const totalPageCount = Math.min(
      Math.max(1, Math.ceil(totalElements / COMMUNITY_PAGE_SIZE)),
      MAX_COMMUNITY_PAGE_COUNT,
    );

    const additionalResponses = await Promise.allSettled(
      Array.from({ length: Math.max(0, totalPageCount - 1) }, (_, index) =>
        community.standardList({
          page: index + 1,
          pageSize: COMMUNITY_PAGE_SIZE,
        }),
      ),
    );

    const failedPages = additionalResponses.flatMap((result, index) =>
      result.status === "rejected" || result.value.status !== 200 ? [index + 1] : [],
    );
    if (failedPages.length) {
      console.warn("[sitemap] Community pages omitted", { pages: failedPages });
    }
    if (totalElements > COMMUNITY_PAGE_SIZE * MAX_COMMUNITY_PAGE_COUNT) {
      console.warn("[sitemap] Community pagination limit reached", { totalElements });
    }

    const additionalPageData = additionalResponses
      .flatMap((result) => result.status === "fulfilled" && result.value.status === 200
        ? [result.value.data as CommunityListResponse]
        : []);

    const mergedBoardList = [firstPageData, ...additionalPageData].flatMap(
      (pageData) => pageData.list,
    );

    const dedupedBoardMap = new Map<number, CommunityBoard>();
    mergedBoardList.forEach((board) => {
      if (typeof board.boardId === "number") {
        dedupedBoardMap.set(board.boardId, board);
      }
    });

    const communityDetailUrls = [...dedupedBoardMap.values()].map((board) => ({
      url: `${baseUrl}/community/detail/${board.boardId}`,
      lastModified: toDate(board.modifiedAt ?? board.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return communityDetailUrls;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getQuestionLastModified() {
  try {
    const response = await hotIssue.getActivatedList();
    if (!response || response.status !== 200) return undefined;
    const parsedData = response.data as HotIssueResponse;
    // /question renders only list[0], including its title and metadata.
    const question = parsedData.list?.[0];
    return toDate(question?.modifiedAt) ?? toDate(question?.createdAt);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const [communityEntries, questionLastModified, companies] = await Promise.all([
    getCommunitySitemapEntries(baseUrl),
    getQuestionLastModified(),
    getRecruitmentCompanies(),
  ]);
  const companyUrls = companies.map(({ companyCode }) => ({
    url: companyUrl(companyCode),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const staticPages = [
    {
      url: `${baseUrl}/tech-articles`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tech-trends`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/subscribe`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/remote-work-companies`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dev-activities`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/question`,
      lastModified: questionLastModified,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/interview-questions`,
      changeFrequency: "daily" as const,
      priority: 0.95,
    },
  ];

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    ...companyUrls,
    ...staticPages,
    ...communityEntries,
  ];
}
