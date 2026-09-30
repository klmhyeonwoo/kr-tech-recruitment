import { fetchInflearnArticles, type TechArticle } from "./sources/inflearn";

export type { TechArticle };

const sources = [fetchInflearnArticles];

export async function getTechArticles(page: number) {
  const results = await Promise.allSettled(sources.map((source) => source(page)));
  const successful = results.filter((result) => result.status === "fulfilled");
  for (const result of results) {
    if (result.status === "rejected") console.error("테크 아티클 수집 실패:", result.reason);
  }
  return {
    articles: successful.flatMap((result) => result.value.articles)
      .sort((a, b) => Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? "") || 0),
    hasNext: successful.some((result) => result.value.hasNext),
    unavailable: successful.length === 0,
  };
}
