import type { Metadata } from "next";
import DefaultLayout from "@/components/layout/DefaultLayout";
import StructuredData from "@/lib/seo/structured-data";
import InterviewQuestionsClient from "./_components/InterviewQuestionsClient";
import styles from "./page.module.scss";
import data from "@/data/interview-questions.json";
import "@/styles/domain/web.scss";

const PAGE_URL = "https://nklcb.kr/interview-questions";
const OG_IMAGE =
  "https://raw.githubusercontent.com/klmhyeonwoo/Asset-Archieve./main/nklcb.png";

const TITLE = "개발자 기술 질문 모음 (매일메일)";
const DESCRIPTION =
  "매일메일(maeil-mail) 서비스 종료 후 공개된 프론트엔드·백엔드 기술 면접 질문과 답변 300개 이상을 카테고리별로 확인해보세요. JavaScript, React, Next.js, Spring, JPA, 네트워크, 운영체제 등 핵심 질문을 모았습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "매일메일",
    "maeil-mail",
    "매일메일 질문",
    "매일메일 콘텐츠",
    "개발자 기술 면접",
    "기술 면접 질문",
    "프론트엔드 면접 질문",
    "백엔드 면접 질문",
    "개발자 면접 준비",
    "코딩 면접",
    "JavaScript 면접 질문",
    "React 면접 질문",
    "Next.js 면접 질문",
    "TypeScript 면접 질문",
    "Spring 면접 질문",
    "JPA 면접 질문",
    "자바 면접 질문",
    "네트워크 면접 질문",
    "운영체제 면접 질문",
    "데이터베이스 면접 질문",
    "CS 면접 질문",
    "컴퓨터 사이언스 면접",
    "개발자 기술 질문",
    "클로저 면접",
    "이벤트 루프 면접",
    "가상 DOM 면접",
    "SSR 면접 질문",
    "서버 컴포넌트 면접",
    "SOLID 원칙 면접",
    "네카라쿠배 면접",
    "빅테크 면접 질문",
  ],
  authors: [{ name: "네카라쿠배 채용" }],
  creator: "네카라쿠배 채용",
  publisher: "네카라쿠배 채용",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "네카라쿠배 채용",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "개발자 기술 질문 모음 - 네카라쿠배 채용",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export const revalidate = 86400;

export default function InterviewQuestionsPage() {
  const allQuestions = [
    ...data.frontend.categories.flatMap((c) => c.questions),
    ...data.backend.categories.flatMap((c) => c.questions),
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    inLanguage: "ko",
    isPartOf: {
      "@type": "WebSite",
      name: "네카라쿠배 채용",
      url: "https://nklcb.kr",
    },
    mainEntity: {
      "@type": "ItemList",
      name: "개발자 기술 면접 질문 목록",
      numberOfItems: allQuestions.length,
      itemListOrder: "https://schema.org/ItemListUnordered",
      itemListElement: allQuestions.slice(0, 50).map((q, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: q.title,
        url: `${PAGE_URL}#${q.id}`,
      })),
    },
  };

  return (
    <DefaultLayout>
      <StructuredData id="structured-data-interview-questions" data={structuredData} />
      <main className={styles.page}>
        <section className={styles.intro}>
          <h1 className="title">개발자 기술 질문 모음</h1>
          <p className="description">
            기술 면접 준비를 위한 프론트엔드·백엔드 질문과 답변을 카테고리별로
            확인해보세요
          </p>
        </section>

        <InterviewQuestionsClient data={data} />

        <footer className={styles.sourceNotice}>
          <a
            href="https://github.com/maeil-mail/maeil-mail-contents"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="원본 GitHub 저장소 보기"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.95-3.19.69-3.86-1.54-3.86-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.14 1.17a10.9 10.9 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.59.23 2.76.11 3.05.73.8 1.18 1.82 1.18 3.07 0 4.41-2.68 5.38-5.24 5.66.41.35.77 1.03.77 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.21.66.79.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            maeil-mail/maeil-mail-contents
          </a>
          <span>매일메일 서비스 종료 후 공개된 콘텐츠를 기반으로 서비스됩니다.</span>
        </footer>
      </main>
    </DefaultLayout>
  );
}
