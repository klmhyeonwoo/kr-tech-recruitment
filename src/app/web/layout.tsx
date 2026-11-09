import { SITE_URL } from "@/lib/seo/site";
import Link from "next/link";
import { companyPath, getRecruitmentCompanies } from "@/lib/seo/companies";
import { Fragment } from "react";
import "@/styles/domain/web.scss";
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
    url: `${SITE_URL}/web`,
  },
  twitter: {
    card: "summary_large_image",
    title: "네카라쿠배 - 기업별 채용 정보",
    description: "각 기업별 채용 정보를 상세히 확인하세요",
  },
  alternates: {
    canonical: `${SITE_URL}/web`,
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const companies = await getRecruitmentCompanies();

  return (
    <Fragment>
      <section>
        <article className="content-wrapper" data-layout="recruit">
          <div>
            {children}
            <nav className="company-directory" aria-label="기업별 채용 공고 바로가기">
              <h2>다른 기업 채용 공고</h2>
              <ul>
                {companies.map(({ companyCode, name }) => (
                  <li key={companyCode}><Link href={companyPath(companyCode)}>{name} 채용</Link></li>
                ))}
              </ul>
            </nav>
            <UserAds />
          </div>
        </article>
      </section>
    </Fragment>
  );
}
