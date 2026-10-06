import type { Metadata } from "next";
import Link from "next/link";
import DefaultLayout from "@/components/layout/DefaultLayout";
import StructuredData from "@/lib/seo/structured-data";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { getTechArticles } from "@/lib/tech-articles";
import styles from "./page.module.scss";
import "@/styles/domain/web.scss";

type Props = { searchParams: Promise<{ page?: string }> };

const PAGE_TITLE = "개발자 테크 아티클 모음";
const PAGE_DESCRIPTION =
  "개발자가 읽을 만한 기술 이야기와 커리어 정보를 모았습니다. 최신 채용 공고, 기술 면접 질문, 개발자 대외활동도 함께 확인하세요.";

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 && page <= 1000 ? page : 1;
}

function pageUrl(page: number) {
  return `${SITE_URL}/tech-articles${page > 1 ? `?page=${page}` : ""}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  const suffix = page > 1 ? ` ${page}페이지` : "";
  const title = `${PAGE_TITLE}${suffix}`;
  const url = pageUrl(page);

  return {
    title,
    description: PAGE_DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: PAGE_DESCRIPTION,
      url,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: PAGE_TITLE }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description: PAGE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

function dateLabel(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  }).format(date);
}

const careerLinks = [
  { href: "/web", label: "채용 공고", description: "기업별 최신 공고 보기" },
  { href: "/interview-questions", label: "기술 면접", description: "질문으로 실전 준비하기" },
  { href: "/dev-activities", label: "대외활동", description: "성장을 위한 다음 경험 찾기" },
];

export default async function TechArticlesPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  const { articles, hasNext, unavailable } = await getTechArticles(page);
  const url = pageUrl(page);
  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${PAGE_TITLE}${page > 1 ? ` ${page}페이지` : ""}`,
    description: PAGE_DESCRIPTION,
    url,
    inLanguage: "ko",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: article.url,
      })),
    },
  };
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: PAGE_TITLE, item: `${SITE_URL}/tech-articles` },
      ...(page > 1 ? [{ "@type": "ListItem", position: 3, name: `${page}페이지`, item: url }] : []),
    ],
  };

  return (
    <DefaultLayout>
      <StructuredData id="structured-data-tech-articles" data={collectionStructuredData} />
      <StructuredData id="structured-data-tech-articles-breadcrumb" data={breadcrumbStructuredData} />
      <main className={styles.page}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>읽고, 준비하고, 지원하기</p>
          <h1>테크 아티클</h1>
          <p>개발자가 지금 읽을 만한 이야기를 모았습니다.</p>
        </header>

        <section className={styles.careerLinks} aria-label="개발자 커리어 도구">
          {careerLinks.map((item) => (
            <Link key={item.href} href={item.href} className={styles.careerLink}>
              <span>{item.label}</span>
              <small>{item.description}</small>
              <b aria-hidden="true">→</b>
            </Link>
          ))}
        </section>

        {unavailable ? (
          <p className={styles.empty} role="status">글을 불러오지 못했어요.</p>
        ) : articles.length ? (
          <ul className={styles.list}>
            {articles.map((article) => (
              <li key={article.id}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className={styles.row}>
                  <div className={styles.rowContent}>
                    <h2>{article.title}</h2>
                    <span className={styles.meta}>
                      {article.source}{article.author && ` · ${article.author}`}
                      {dateLabel(article.publishedAt) && ` · ${dateLabel(article.publishedAt)}`}
                    </span>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>표시할 글이 없어요.</p>
        )}

        {!unavailable && (page > 1 || hasNext) && (
          <nav className={styles.pagination} aria-label="아티클 페이지">
            {page > 1 && <Link href={`/tech-articles?page=${page - 1}`}>← 이전</Link>}
            <span>{page} 페이지</span>
            {hasNext && <Link href={`/tech-articles?page=${page + 1}`}>다음 →</Link>}
          </nav>
        )}

        <Link href="/developer-career" className={styles.careerHubLink}>
          개발자 커리어 준비, 한 번에 시작하기 <span aria-hidden="true">→</span>
        </Link>
      </main>
    </DefaultLayout>
  );
}
