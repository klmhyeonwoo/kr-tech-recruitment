import { api } from "@/api";
import { Fragment, Suspense } from "react";
import TabSection from "@/components/tab/Section";
import "@/styles/domain/web.scss";
import Header from "@/components/common/header";
import SearchSection from "@/components/search/Section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "기업별 채용 정보",
  description:
    "네이버, 카카오, 라인, 쿠팡, 배달의민족 등 각 기업별 채용 정보를 상세히 확인하세요. 기업별로 필터링하여 원하는 채용 공고를 쉽게 찾을 수 있습니다.",
  keywords: [
    "기업별 채용",
    "IT 기업 정보",
    "채용 정보 검색",
    "기업 필터링",
    "네카라쿠배 기업",
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

async function getCompanyList() {
  try {
    const { data } = await api.get("/companies");
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

async function getStandardRecruitData() {
  try {
    const { data } = await api.get(`/companies/standard-categories`);
    return data;
  } catch (error) {
    return { data: [], error };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { companies } = await getCompanyList();
  const { list } = await getStandardRecruitData();

  return (
    <Fragment>
      <Header />
      <section>
        <article className="content-wrapper">
          <div>
            <Suspense>
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
