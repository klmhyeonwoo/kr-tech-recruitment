import type { Metadata } from "next";
import Link from "next/link";
import DefaultLayout from "@/components/layout/DefaultLayout";
import StructuredData from "@/lib/seo/structured-data";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import styles from "./page.module.scss";
import "@/styles/domain/web.scss";

const PAGE_URL = `${SITE_URL}/developer-career`;
const TITLE = "개발자 취업 준비";
const DESCRIPTION =
  "개발자 채용 공고 탐색부터 기술 면접 준비, 성장 경험 찾기까지. 취업 준비에 필요한 정보를 한 흐름으로 시작하세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

const steps = [
  {
    number: "01",
    title: "공고를 먼저 좁히세요",
    description: "관심 기업과 직무를 기준으로 현재 열려 있는 공고부터 살펴보세요.",
    href: "/web",
    action: "채용 공고 보기",
  },
  {
    number: "02",
    title: "질문으로 빈 곳을 찾으세요",
    description: "면접 질문을 읽으며 지금 보완할 기술과 개념을 확인할 수 있어요.",
    href: "/interview-questions",
    action: "기술 면접 질문 보기",
  },
  {
    number: "03",
    title: "다음 경험을 고르세요",
    description: "동아리, 밋업, 교육과 컨퍼런스에서 포트폴리오의 다음 장면을 찾으세요.",
    href: "/dev-activities",
    action: "대외활동 보기",
  },
  {
    number: "04",
    title: "읽은 내용을 지원으로 이어가세요",
    description: "현업의 기술 이야기를 읽고, 관심 분야의 공고를 다시 확인해보세요.",
    href: "/tech-articles",
    action: "테크 아티클 보기",
  },
];

const faqs = [
  {
    question: "개발자 취업 준비는 무엇부터 시작하면 좋을까요?",
    answer: "관심 있는 기업과 직무의 채용 공고를 읽는 것부터 시작하세요. 공고에 반복해서 나오는 기술과 역할을 확인한 뒤, 기술 면접 질문과 프로젝트 경험을 연결하면 준비 우선순위가 선명해집니다.",
  },
  {
    question: "기술 면접은 어떻게 준비하면 좋을까요?",
    answer: "답을 외우기보다 질문마다 내가 만든 서비스나 프로젝트의 사례를 떠올려 보세요. 모르는 주제는 작은 예제로 직접 구현하거나 정리한 뒤 다시 답해보는 방식이 좋습니다.",
  },
  {
    question: "경험이 부족할 때 무엇을 하면 좋을까요?",
    answer: "관심 분야의 동아리, 밋업, 교육, 오픈소스 활동처럼 결과물을 남길 수 있는 경험부터 골라보세요. 무엇을 했는지보다 어떤 문제를 어떻게 풀었는지 기록하는 것이 중요합니다.",
  },
];

export default function DeveloperCareerPage() {
  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    inLanguage: "ko",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: steps.map((step, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: step.title,
        url: `${SITE_URL}${step.href}`,
      })),
    },
  };
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <DefaultLayout>
      <StructuredData id="structured-data-developer-career" data={collectionStructuredData} />
      <StructuredData id="structured-data-developer-career-faq" data={faqStructuredData} />
      <main className={styles.page}>
        <header className={styles.hero}>
          <p>개발자 커리어</p>
          <h1>다음 한 걸음이<br />분명해지는 준비.</h1>
          <span>공고를 보고, 부족한 곳을 채우고, 경험으로 증명하세요.</span>
        </header>

        <section className={styles.steps} aria-label="개발자 취업 준비 순서">
          {steps.map((step) => (
            <article key={step.number} className={styles.step}>
              <p>{step.number}</p>
              <h2>{step.title}</h2>
              <span>{step.description}</span>
              <Link href={step.href}>{step.action} <b aria-hidden="true">→</b></Link>
            </article>
          ))}
        </section>

        <section className={styles.faq} aria-labelledby="career-faq">
          <h2 id="career-faq">자주 묻는 질문</h2>
          <div>
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </DefaultLayout>
  );
}
