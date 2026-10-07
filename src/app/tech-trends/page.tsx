import type { Metadata } from "next";
import DefaultLayout from "@/components/layout/DefaultLayout";
import TrendChart from "./_components/TrendChart";
import CriteriaAccordion from "./_components/CriteriaAccordion";
import styles from "./page.module.scss";
import "@/styles/domain/web.scss";
import axios from "axios";
import StructuredData from "@/lib/seo/structured-data";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export type Ranking = {
  rank: number;
  rankChange: number | null;
  name: string;
  score: number;
  metrics: {
    githubStars: number | null;
    npmDownloads: number | null;
    soQuestions: number | null;
  };
};

export type TrendsData = {
  collectedAt: string;
  domains: Record<
    string,
    {
      label: string;
      updatedAt: string;
      rankings: Ranking[];
    }
  >;
};

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "오늘의 개발 트렌드",
  description:
    "프론트엔드, 백엔드, 데브옵스 등 카테고리별 기술 스택 트렌드를 점수와 지표로 확인해보세요.",
  alternates: {
    canonical: `${SITE_URL}/tech-trends`,
  },
  openGraph: {
    title: "오늘의 개발 트렌드",
    description:
      "프론트엔드, 백엔드, 데브옵스 등 카테고리별 기술 스택 트렌드를 점수와 지표로 확인해보세요.",
    type: "website",
    url: `${SITE_URL}/tech-trends`,
    siteName: SITE_NAME,
    locale: "ko_KR",
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "오늘의 개발 트렌드",
    description:
      "프론트엔드, 백엔드, 데브옵스 등 카테고리별 기술 스택 트렌드를 점수와 지표로 확인해보세요.",
    images: [OG_IMAGE],
  },
};

async function getTrendsData(): Promise<TrendsData | null> {
  try {
    const { data } = await axios.get<TrendsData>(
      "https://raw.githubusercontent.com/klmhyeonwoo/collector/refs/heads/main/data/trends.json",
    );
    return data;
  } catch {
    return null;
  }
}

export default async function TechTrendsPage() {
  const data = await getTrendsData();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "오늘의 개발 트렌드",
    description:
      "카테고리별 개발 기술 스택 트렌드와 주요 지표를 확인하는 페이지",
    url: `${SITE_URL}/tech-trends`,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
  };

  return (
    <DefaultLayout>
      <StructuredData id="structured-data-tech-trends" data={structuredData} />
      <main className={styles.page}>
        <section className={styles.intro}>
          <h1 className="title">오늘의 개발 트렌드</h1>
          <p className="description">
            오늘 업데이트 된 개발 스택에 대한 트랜드를 파악해보세요
          </p>
        </section>

        <CriteriaAccordion />

        {data ? (
          <TrendChart data={data} />
        ) : (
          <p
            style={{
              color: "var(--greyOpacity500)",
              fontSize: "1.4rem",
              textAlign: "center",
              padding: "4rem 0",
            }}
          >
            데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        )}
      </main>
    </DefaultLayout>
  );
}
