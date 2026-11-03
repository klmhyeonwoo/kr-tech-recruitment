import { companyUrl, getRecruitmentCompanies, normalizeCompanyCode } from "@/lib/seo/companies";
import { api } from "@/api";
import CardSection from "@/components/card/Section";
import type { RecruitData } from "@/components/card/Section";
import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import EyesLoading from "@/components/loading/eyes-loading";
import generateServiceOpenGraph from "@/og";
import StructuredData from "@/lib/seo/structured-data";

type paramsType = {
  searchParams: Promise<{ company?: string | string[]; category?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: paramsType): Promise<Metadata> {
  const { company } = await searchParams;
  const companyCode = normalizeCompanyCode(company);
  const companies = await getRecruitmentCompanies();
  const selectedCompany = companies.find((item) => item.companyCode === companyCode);
  return {
    ...generateServiceOpenGraph({ companyName: selectedCompany?.name ?? "기업별", companyCode }),
    ...(!selectedCompany ? { robots: { index: false, follow: true } } : {}),
  };
}

async function getRecruitData({
  params,
}: {
  params: {
    companyCode: string;
    page: number;
    pageSize: number;
    category?: string;
    standardCategory?: string;
  };
}): Promise<{ list: RecruitData[]; error?: unknown }> {
  try {
    const { data } = await api.get(`/recruitment-notices/redirections`, {
      params,
    });
    const list = data.list || [];
    const scaledData = {
      ...data,
      list: list.map((item: { url: string }) => ({
        ...item,
        url: btoa(item.url),
      })),
    };
    return scaledData;
  } catch (error) {
    return { list: [], error };
  }
}

function originalPostingUrl(encodedUrl: string): { url?: string } {
  try {
    const url = new URL(atob(encodedUrl));
    return ["https:", "http:"].includes(url.protocol) ? { url: url.href } : {};
  } catch {
    return {};
  }
}

async function RecruitDataSection({
  company,
  category,
}: {
  company: string;
  category?: string;
}) {
  const [{ list }, companies] = await Promise.all([
    getRecruitData({
      params: {
        companyCode: company,
        page: 0,
        pageSize: 9999,
        standardCategory: category,
      },
    }),
    getRecruitmentCompanies(),
  ]);
  const companyName = companies.find((item) => item.companyCode === company)?.name ?? "기업별";
  const pageUrl = companyUrl(company);
  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${companyName} 채용 공고`,
    description: `${companyName}의 최신 채용 공고를 모아보는 페이지`,
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: list.length,
      itemListElement: list.slice(0, 30).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.jobOfferTitle,
        // Reference the original posting rather than the robots-blocked redirect route.
        ...originalPostingUrl(item.url),
      })),
    },
  };

  return (
    <Fragment>
      <header className="recruitment-intro">
        <h1 className="title">{companyName} 채용 공고</h1>
        <p className="description">
          직무별 공고를 살펴보고 관심 있는 공고의 원문에서 지원 자격과 전형 절차를 확인하세요.
          모집 상태와 마감일은 기업의 원문 공고를 기준으로 확인해 주세요.
        </p>
      </header>
      <StructuredData
        id={`structured-data-web-${company || "all"}-${category || "all"}`}
        data={collectionStructuredData}
      />
      <Suspense key={`${company}-${category}`} fallback={<EyesLoading />}>
        <CardSection data={list} />
      </Suspense>
    </Fragment>
  );
}

export default async function Home({ searchParams }: paramsType) {
  const { company, category } = await searchParams;
  return (
    <Suspense key={`${company}`} fallback={<EyesLoading />}>
      <RecruitDataSection company={normalizeCompanyCode(company)} category={Array.isArray(category) ? category[0] : category} />
    </Suspense>
  );
}
