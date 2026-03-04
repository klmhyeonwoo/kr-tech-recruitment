import { SERVICE_CATEGORY } from "@/utils/const";
import { api } from "@/api";
import CardSection from "@/components/card/Section";
import type { RecruitData } from "@/components/card/Section";
import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import EyesLoading from "@/components/loading/eyes-loading";
import generateServiceOpenGraph from "@/og";
import StructuredData from "@/lib/seo/structured-data";

type paramsType = {
  searchParams: Promise<{ company: string; category: string }>;
};

export async function generateMetadata({
  searchParams,
}: paramsType): Promise<Metadata> {
  const { company } = await searchParams;
  const companyName =
    SERVICE_CATEGORY[company?.toLowerCase() as keyof typeof SERVICE_CATEGORY]
      ?.name;
  return generateServiceOpenGraph({
    companyName: companyName,
  });
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

async function RecruitDataSection({
  company,
  category,
}: {
  company: string;
  category: string;
}) {
  const { list } = await getRecruitData({
    params: {
      companyCode: company,
      page: 0,
      pageSize: 9999,
      standardCategory: category,
    },
  });

  const companyName =
    SERVICE_CATEGORY[company?.toLowerCase() as keyof typeof SERVICE_CATEGORY]
      ?.name ?? company;
  const queryParams = new URLSearchParams();
  if (company) queryParams.set("company", company);
  if (category) queryParams.set("category", category);
  const query = queryParams.toString();
  const pageUrl = `https://nklcb.kr/web${query ? `?${query}` : ""}`;
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
        url: `https://nklcb.kr/recruitment-notices?${new URLSearchParams({
          id: String(item.recruitmentNoticeId),
          path: item.url,
        }).toString()}`,
      })),
    },
  };

  return (
    <Fragment>
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
      <RecruitDataSection company={company ?? "NAVER"} category={category} />
    </Suspense>
  );
}
