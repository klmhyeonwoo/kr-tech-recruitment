import { api } from "@/api";
import { Fragment, Suspense } from "react";
import TabSection from "@/components/tab/Section";
import "@/styles/domain/web.scss";
import Header from "@/components/common/navigation/header";
import SearchSection from "@/components/search/Section";
import { Metadata } from "next";
import UserAds from "@/components/ads/user-ads";

export const metadata: Metadata = {
  title: "기업별 채용 정보",
  description:
    "네이버, 카카오, 라인, 쿠팡, 배달의민족, 토스, 당근, 두나무, 야놀자 등 각 기업별 채용 정보를 상세히 확인하세요. 기업별로 필터링하여 원하는 채용 공고를 쉽게 찾을 수 있습니다.",
  keywords: [
    "기업별 채용",
    "IT 기업 정보",
    "채용 정보 검색",
    "기업 필터링",
    "네카라쿠배 기업",
    "네이버 채용",
    "카카오 채용",
    "라인 채용",
    "쿠팡 채용",
    "배달의민족 채용",
    "토스 채용",
    "당근 채용",
    "두나무 채용",
    "야놀자 채용",
    "삼성전자 채용",
    "LG전자 채용",
    "현대오토에버 채용",
    "SK하이닉스 채용",
    "엔씨소프트 채용",
    "넷마블 채용",
    "크래프톤 채용",
    "빅테크 채용",
  ],
  openGraph: {
    title: "네카라쿠배 - 기업별 채용 정보",
    description:
      "각 기업별 채용 정보를 상세히 확인하세요. 기업별로 필터링하여 원하는 채용 공고를 쉽게 찾을 수 있습니다.",
    type: "website",
    url: "https://nklcb.io/web",
  },
  twitter: {
    card: "summary_large_image",
    title: "네카라쿠배 - 기업별 채용 정보",
    description: "각 기업별 채용 정보를 상세히 확인하세요",
  },
  alternates: {
    canonical: "https://nklcb.io/web",
  },
};

export const revalidate = 3600; // Revalidate every hour

type CompanyType = { companyCode: string; name: string };
type SearchCategoryType = { code: string; name: string };
type CompanyListResponse = { companies: CompanyType[] };
type StandardRecruitResponse = { list: SearchCategoryType[]; error?: unknown };

async function getCompanyList(): Promise<CompanyListResponse> {
  try {
    const { data } = await api.get("/companies");
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return { companies: [] };
  }
}

async function getStandardRecruitData(): Promise<StandardRecruitResponse> {
  try {
    const { data } = await api.get(`/companies/standard-categories`);
    return data;
  } catch (error) {
    return { list: [], error };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch data in parallel for better performance
  const [{ companies }, { list }] = await Promise.all([
    getCompanyList(),
    getStandardRecruitData(),
  ]);

  return (
    <Fragment>
      <Header />
      <section>
        <article className="content-wrapper">
          <div>
            <Suspense>
              <UserAds />
              <TabSection data={companies} />
              <SearchSection data={list || []} />
            </Suspense>
            {children}
          </div>
        </article>
      </section>
    </Fragment>
  );
}
