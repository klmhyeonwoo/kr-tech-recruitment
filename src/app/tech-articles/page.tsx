import type { Metadata } from "next";
import Link from "next/link";
import DefaultLayout from "@/components/layout/DefaultLayout";
import styles from "./page.module.scss";
import "@/styles/domain/web.scss";
import { api } from "@/api";
import PageSizeSelect from "./_components/PageSizeSelect";

type PageSearchParams = {
  page?: string;
  pageSize?: string;
  source?: string;
};

type Props = { searchParams: Promise<PageSearchParams> };

type TechArticle = {
  techArticleId: number;
  title: string;
  description: string;
  link: string;
  source: string;
  writer: string;
  createdAt: string;
};

type TechArticlesResponse = {
  list: TechArticle[];
  metadata: { totalElements: number };
};

type TechArticleSource = {
  code: string;
  korean: string;
};

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const VISIBLE_PAGE_COUNT = 5;
const PAGE_URL = "https://nklcb.kr/tech-articles";

export const metadata: Metadata = {
  title: "테크 아티클",
  description:
    "여러 수집처에서 발행된 개발 이야기와 기술 글을 한곳에서 살펴보세요.",
  keywords: ["테크 아티클", "개발 블로그", "기술 블로그", "개발 뉴스"],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "테크 아티클 | 넥스트코드",
    description: "여러 수집처의 개발 이야기와 기술 글을 한곳에서 살펴보세요.",
    url: PAGE_URL,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "테크 아티클 | 넥스트코드",
    description: "여러 수집처의 개발 이야기와 기술 글을 한곳에서 살펴보세요.",
  },
  robots: { index: true, follow: true },
};

async function getTechArticles({ page, pageSize, source }: PageSearchParams) {
  const { data } = await api.get<TechArticlesResponse>("/tech-articles", {
    params: {
      page,
      pageSize,
      ...(source ? { source } : {}),
    },
  });
  return data;
}

async function getTechArticlesCollection() {
  const { data } = await api.get<TechArticleSource[]>("/tech-articles/sources");
  return data;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function parsePageSize(value: string | undefined) {
  const pageSize = parsePositiveInteger(value, DEFAULT_PAGE_SIZE);
  return PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE;
}

function dateLabel(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
}

function decodeHtml(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
  };

  return value.replace(
    /&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/gi,
    (_, entity: string) => {
      if (!entity.startsWith("#")) return entities[entity.toLowerCase()];
      const code =
        entity[1].toLowerCase() === "x"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return Number.isSafeInteger(code) && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : "";
    },
  );
}

function buildHref({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  source,
}: {
  page?: number;
  pageSize?: number;
  source?: string;
}) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(pageSize));
  if (source) params.set("source", source);
  const query = params.toString();
  return `/tech-articles${query ? `?${query}` : ""}`;
}

export default async function TechArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parsePositiveInteger(params.page, 1);
  const pageSize = parsePageSize(params.pageSize);
  const source = params.source?.trim() || undefined;
  const [techArticlesData, techArticlesCollection] = await Promise.all([
    getTechArticles({
      page: String(page),
      pageSize: String(pageSize),
      source,
    }),
    getTechArticlesCollection(),
  ]);
  const totalPageCount =
    techArticlesData.list.length < pageSize
      ? page
      : Math.max(
          1,
          Math.ceil(techArticlesData.metadata.totalElements / pageSize),
        );
  const firstVisiblePage = Math.max(
    1,
    Math.min(page - 2, totalPageCount - VISIBLE_PAGE_COUNT + 1),
  );
  const visiblePages = Array.from(
    { length: Math.min(VISIBLE_PAGE_COUNT, totalPageCount) },
    (_, index) => firstVisiblePage + index,
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "테크 아티클",
    description: metadata.description,
    url: PAGE_URL,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: techArticlesData.metadata.totalElements,
      itemListElement: techArticlesData.list.map((article, index) => ({
        "@type": "ListItem",
        position: (page - 1) * pageSize + index + 1,
        item: {
          "@type": "Article",
          headline: decodeHtml(article.title),
          description: decodeHtml(article.description),
          url: article.link,
          datePublished: article.createdAt,
          author: { "@type": "Person", name: article.writer },
          publisher: { "@type": "Organization", name: article.source },
        },
      })),
    },
  };

  return (
    <DefaultLayout>
      <main className={styles.page}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <header className={styles.intro}>
          <h1>테크 아티클</h1>
          <p>관심 있는 수집처의 개발 이야기와 기술 글을 모아볼 수 있어요.</p>
        </header>

        <section className={styles.toolbar} aria-label="테크 아티클 필터">
          <div className={styles.sourceFilters} aria-label="수집처 선택">
            <Link
              href={buildHref({ pageSize })}
              className={!source ? styles.activeSource : undefined}
              aria-current={!source ? "page" : undefined}
            >
              전체
            </Link>
            {techArticlesCollection.map(({ code, korean }) => (
              <Link
                key={code}
                href={buildHref({ pageSize, source: code })}
                className={source === code ? styles.activeSource : undefined}
                aria-current={source === code ? "page" : undefined}
              >
                {korean}
              </Link>
            ))}
          </div>
          <PageSizeSelect pageSize={pageSize} source={source} />
        </section>

        {techArticlesData.list.length ? (
          <ul className={styles.list}>
            {techArticlesData.list.map((article) => (
              <li key={article.techArticleId}>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.row}
                >
                  <div className={styles.rowContent}>
                    <h2>{decodeHtml(article.title)}</h2>
                    <p className={styles.description}>
                      {decodeHtml(article.description)}
                    </p>
                    <span className={styles.meta}>
                      {[
                        article.source,
                        article.writer,
                        dateLabel(article.createdAt),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty} role="status">
            표시할 글이 없어요.
          </p>
        )}

        {totalPageCount > 1 && (
          <nav className={styles.pagination} aria-label="아티클 페이지">
            {page > 1 ? (
              <Link
                href={buildHref({ page: page - 1, pageSize, source })}
                aria-label="이전 페이지"
              >
                ‹
              </Link>
            ) : (
              <span className={styles.disabledPage} aria-hidden="true">
                ‹
              </span>
            )}
            {visiblePages.map((visiblePage) => (
              <Link
                key={visiblePage}
                href={buildHref({ page: visiblePage, pageSize, source })}
                aria-current={page === visiblePage ? "page" : undefined}
                className={
                  page === visiblePage ? styles.currentPage : undefined
                }
              >
                {visiblePage}
              </Link>
            ))}
            {page < totalPageCount ? (
              <Link
                href={buildHref({ page: page + 1, pageSize, source })}
                aria-label="다음 페이지"
              >
                ›
              </Link>
            ) : (
              <span className={styles.disabledPage} aria-hidden="true">
                ›
              </span>
            )}
          </nav>
        )}
      </main>
    </DefaultLayout>
  );
}
