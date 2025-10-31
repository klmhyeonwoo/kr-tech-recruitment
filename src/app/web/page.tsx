import { SERVICE_CATEGORY, BASE_URL } from "@/utils/const";
import { api } from "@/api";
import CardSection from "@/components/card/Section";
import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import EyesLoading from "@/components/loading/eyes-loading";
import generateServiceOpenGraph from "@/og";
import BreadcrumbData from "@/components/seo/breadcrumb-data";

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
}) {
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
    return { data: [], error };
  }
}

async function RecruitDataSection({
  company,
  category,
}: {
  company: string;
  category: string;
}) {
  return (
    <Fragment>
      <Suspense key={`${company}-${category}`} fallback={<EyesLoading />}>
        <RecruitListSection company={company} category={category} />
      </Suspense>
    </Fragment>
  );
}

async function RecruitListSection({
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

  return <CardSection data={list} />;
}

export default async function Home({ searchParams }: paramsType) {
  const { company, category } = await searchParams;
  const companyName =
    SERVICE_CATEGORY[company?.toLowerCase() as keyof typeof SERVICE_CATEGORY]
      ?.name || "전체";

  const breadcrumbItems = [
    { name: "홈", url: BASE_URL },
    { name: "채용 공고", url: `${BASE_URL}/web` },
  ];

  if (companyName !== "전체") {
    breadcrumbItems.push({
      name: companyName,
      url: `${BASE_URL}/web?company=${company}`,
    });
  }

  return (
    <Fragment>
      <BreadcrumbData items={breadcrumbItems} />
      <Suspense key={`${company}`} fallback={<EyesLoading />}>
        <RecruitDataSection company={company ?? "NAVER"} category={category} />
      </Suspense>
    </Fragment>
  );
}
