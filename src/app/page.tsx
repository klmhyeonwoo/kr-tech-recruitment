import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/api";
import community from "@/api/domain/community";
import hotIssue from "@/api/domain/hotIssue";
import StructuredData from "@/lib/seo/structured-data";
import { getRecruitmentCompanies } from "@/lib/seo/companies";
import { SITE_URL } from "@/lib/seo/site";
import { baseMetaData } from "@/og";
import { deadlineOf } from "@/utils/jobs";
import type { RecruitData } from "@/components/card/Section";
import type { QuestionTypes } from "./question/_components/question-banner";
import type { ListProps } from "./community/_components/list";
import JobBoard from "./_components/job-board";
import MainCommunityListItem from "./_components/main-community-list-item";
import "@/styles/domain/home-page.scss";

export const revalidate = 3600; // 한 시간마다 새로 만듭니다.

const TITLE = "개발자 채용 공고 모음 - 네이버·카카오·토스 채용 한눈에 | 서울데브클럽";
const DESCRIPTION =
  "네이버, 카카오, 토스, 쿠팡, 당근 등 IT 기업의 개발자 채용 공고를 직무별·기업별로 한곳에서 확인하세요. 마감일과 원문 링크까지 바로 볼 수 있어요.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: { ...baseMetaData.openGraph, title: TITLE, description: DESCRIPTION, url: SITE_URL },
  twitter: { ...baseMetaData.twitter, title: TITLE, description: DESCRIPTION },
};

const INITIAL_PAGE_SIZE = 24;

type DataResponse<T> = { list: T[]; metadata?: { totalElements: number }; error?: unknown };

/** 마감되지 않은 공고만, 최신 시작일 순으로 정리해 첫 화면용 24개와 전체 개수를 돌려줍니다. */
async function getRecruitData(): Promise<{ list: RecruitData[]; total: number; error?: unknown }> {
  try {
    const { data } = await api.get("/recruitment-notices/redirections", {
      params: { page: 0, pageSize: 9999 },
      timeout: 10000,
    });
    if (!Array.isArray(data?.list)) throw new Error("Invalid recruitment response");
    const time = (value?: string | null) => (value ? new Date(value).getTime() : 0);
    const open = (data.list as RecruitData[])
      .filter((item) => deadlineOf(item.endAt).tone !== "closed")
      .sort((a, b) => time(b.startAt) - time(a.startAt) || b.recruitmentNoticeId - a.recruitmentNoticeId);
    return {
      total: open.length,
      list: open.slice(0, INITIAL_PAGE_SIZE).map((item) => ({ ...item, url: btoa(item.url) })),
    };
  } catch (error) {
    return { list: [], total: 0, error };
  }
}

async function getCategories(): Promise<{ code: string; name: string }[]> {
  try {
    const { data } = await api.get<{ list: { code: string; name: string }[] }>("/companies/standard-categories");
    const list = Array.isArray(data?.list) ? data.list : [];
    // "기타"는 항상 맨 뒤에 둡니다.
    return [...list.filter((item) => item.code !== "ETC"), ...list.filter((item) => item.code === "ETC")];
  } catch {
    return [];
  }
}

async function getCommunityData(): Promise<DataResponse<ListProps["list"][number]>> {
  try {
    const { data } = await community.standardList({ page: 0, pageSize: 3 });
    return data;
  } catch (error) {
    return { list: [], error };
  }
}

async function getHotIssueQuestionData(): Promise<DataResponse<QuestionTypes["questionData"]>> {
  try {
    const { data } = await hotIssue.getActivatedList();
    return data;
  } catch (error) {
    return { list: [], error };
  }
}

/** 구조화 데이터에는 로봇이 막힌 중계 주소 대신 원문 공고 주소를 씁니다. */
function originalPostingUrl(encodedUrl: string): { url?: string } {
  try {
    const url = new URL(atob(encodedUrl));
    return ["https:", "http:"].includes(url.protocol) ? { url: url.href } : {};
  } catch {
    return {};
  }
}

export default async function Home() {
  const [recruit, categories, companies, { list: hotIssueList }, { list: communityList }] = await Promise.all([
    getRecruitData(),
    getCategories(),
    getRecruitmentCompanies(),
    getHotIssueQuestionData(),
    getCommunityData(),
  ]);
  const { total } = recruit;

  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/#jobs`,
    name: "개발자 채용 공고 모음",
    description: DESCRIPTION,
    url: SITE_URL,
    inLanguage: "ko-KR",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: total,
      itemListElement: recruit.list.slice(0, 12).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.jobOfferTitle,
        ...originalPostingUrl(item.url),
      })),
    },
  };

  return (
    <Fragment>
      <StructuredData id="structured-data-home-page" data={pageStructuredData} />
      <a href="#jobs" className="skip-link">채용 공고 목록으로 바로가기</a>
      <main className="home-page">
        <JobBoard initial={recruit.list} total={total} categories={categories} companies={companies} />

        {(communityList.length > 0 || hotIssueList[0]) && (
          <div className="home-below">
            {communityList.length > 0 && (
              <section id="community" aria-labelledby="home-community-title">
                <div className="home-heading">
                  <h2 id="home-community-title">커뮤니티</h2>
                  <Link href="/community">전체 보기</Link>
                </div>
                <div className="home-list">
                  {communityList.map((item: ListProps["list"][number]) => (
                    <MainCommunityListItem key={item.boardId} id={item.boardId} title={item.title}
                      writer={item.nickname} date={item.createdAt} />
                  ))}
                </div>
              </section>
            )}
            {hotIssueList[0] && (
              <Link href="/question" className="home-question">
                <span>이번 주 질문</span>
                <strong>{hotIssueList[0].title}</strong>
              </Link>
            )}
          </div>
        )}
      </main>
    </Fragment>
  );
}
