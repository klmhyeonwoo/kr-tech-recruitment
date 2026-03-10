import { MetadataRoute } from "next";
import { SERVICE_CATEGORY } from "@/utils/const";
import community from "@/api/domain/community";
import hotIssue from "@/api/domain/hotIssue";

export const revalidate = 86400; // Revalidate once per day

const COMMUNITY_PAGE_SIZE = 50;
const MAX_COMMUNITY_PAGE_COUNT = 5;

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
  if (!value) return new Date();
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
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
      return [];
    }

    const firstPageData = response.data as CommunityListResponse;
    const totalElements =
      firstPageData.metadata?.totalElements ?? firstPageData.list.length;
    const totalPageCount = Math.min(
      Math.max(1, Math.ceil(totalElements / COMMUNITY_PAGE_SIZE)),
      MAX_COMMUNITY_PAGE_COUNT,
    );

    const additionalResponses = await Promise.all(
      Array.from({ length: Math.max(0, totalPageCount - 1) }, (_, index) =>
        community.standardList({
          page: index + 1,
          pageSize: COMMUNITY_PAGE_SIZE,
        }),
      ),
    );

    const additionalPageData = additionalResponses
      .filter((response) => response.status === 200)
      .map((response) => response.data as CommunityListResponse);

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

    const communityPageUrls = Array.from(
      { length: totalPageCount },
      (_, index) => ({
        url: `${baseUrl}/community?page=${index + 1}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      }),
    );

    return [...communityPageUrls, ...communityDetailUrls];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getQuestionLastModified() {
  try {
    const response = await hotIssue.getActivatedList();
    if (!response || response.status !== 200) return new Date();
    const parsedData = response.data as HotIssueResponse;
    const latestQuestion = parsedData.list?.[0];
    return toDate(latestQuestion?.modifiedAt ?? latestQuestion?.createdAt);
  } catch (error) {
    console.error(error);
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nklcb.kr";
  const [communityEntries, questionLastModified] = await Promise.all([
    getCommunitySitemapEntries(baseUrl),
    getQuestionLastModified(),
  ]);
  const now = new Date();

  const companyUrls = Object.keys(SERVICE_CATEGORY).map((company) => ({
    url: `${baseUrl}/?company=${company}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const staticPages = [
    {
      url: `${baseUrl}/web`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/remote-work-companies`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/question`,
      lastModified: questionLastModified,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ];

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...companyUrls,
    ...staticPages,
    ...communityEntries,
  ];
}
