import type { Metadata } from "next";
import Link from "next/link";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { getTechArticles } from "@/lib/tech-articles";
import styles from "./page.module.scss";
import "@/styles/domain/web.scss";

type Props = { searchParams: Promise<{ page?: string }> };

export const metadata: Metadata = {
  title: "테크 아티클",
  description: "인프런에서 발행된 개발 이야기와 기술 글을 한곳에서 살펴보세요.",
  alternates: { canonical: "https://nklcb.kr/tech-articles" },
};

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 && page <= 1000 ? page : 1;
}

function dateLabel(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  }).format(date);
}

export default async function TechArticlesPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  const { articles, hasNext, unavailable } = await getTechArticles(page);

  return (
    <DefaultLayout>
      <main className={styles.page}>
        <header className={styles.intro}>
          <h1>테크 아티클</h1>
        </header>

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
      </main>
    </DefaultLayout>
  );
}
