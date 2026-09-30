export type TechArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: "인프런";
  category?: string;
  author?: string;
  publishedAt?: string;
};

export type ArticlePage = {
  articles: TechArticle[];
  hasNext: boolean;
};

const PAGE_SIZE = 24;
const ORIGIN = "https://www.inflearn.com";
const TECH_TERMS = /개발|프로그래밍|코딩|코드|오픈소스|소프트웨어|\bapi\b|\bai\b|\bllm\b|클라우드|블록체인|데이터|머신러닝|딥러닝|엔지니어|서버|프론트엔드|백엔드|리액트|파이썬|자동화|기술|인공지능|컴퓨터|보안|인프라/i;
const ANNOUNCEMENT_TERMS = /모집|신청|이벤트|밋업|컨퍼런스|세미나|부트캠프|특강|강연|체험권|설명회|참가|교육|과정|국비지원|공모전|캠프|아카데미|열립니다|개최/i;
const PROMOTIONAL_BODY = /모집\s*(중|open)|프로그램 소개|신청\s*링크|신청하러/i;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function string(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function entries(value: unknown, depth = 0): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (depth > 3) return null;
  const object = record(value);
  if (!object) return null;
  for (const key of ["items", "blogs", "list", "results", "content", "data"]) {
    const found = entries(object[key], depth + 1);
    if (found) return found;
  }
  return null;
}

function plainText(value: unknown, maxLength = 220): string {
  return (string(value) ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#(?:x[0-9a-f]+|\d+)|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity: string) => {
      const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
      if (!entity.startsWith("#")) return named[entity.toLowerCase()] ?? "";
      const code = entity[1]?.toLowerCase() === "x"
        ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code) : "";
    })
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeBlog(value: unknown): TechArticle | null {
  const blog = record(value);
  if (!blog) return null;
  const title = plainText(blog.title, 300);
  const id = blog.id ?? blog.blogId;
  if (!title || (typeof id !== "string" && typeof id !== "number")) return null;

  const relations = record(blog._);
  const author = record(relations?.user) ?? record(blog.user) ?? record(blog.author) ?? record(blog.writer);
  const categories = relations?.childCategories;
  const category = Array.isArray(categories) ? record(categories[0]) : null;
  const path = string(blog.url) ?? string(blog.link) ?? `/blogs/${id}`;
  let url: URL;
  try {
    url = new URL(path, ORIGIN);
  } catch {
    return null;
  }
  if (url.hostname !== "www.inflearn.com" && url.hostname !== "inflearn.com") return null;

  return {
    id: `inflearn:${id}`,
    title,
    description: plainText(blog.summary ?? blog.description ?? blog.preview ?? blog.content ?? blog.body),
    url: url.toString(),
    source: "인프런",
    category: string(category?.title),
    author: string(author?.name) ?? string(author?.nickname) ?? string(blog.authorName),
    publishedAt: string(blog.published_at) ?? string(blog.publishedAt)
      ?? string(blog.created_at) ?? string(blog.createdAt),
  };
}

function isTechRelatedBlog(value: unknown): boolean {
  const blog = record(value);
  if (!blog) return false;
  const title = plainText(blog.title, 300);
  const excerpt = plainText(blog.body ?? blog.content, 400);
  if (ANNOUNCEMENT_TERMS.test(title) || PROMOTIONAL_BODY.test(excerpt)) return false;
  const relations = record(blog._);
  const categories = relations?.childCategories;
  const categoryText = Array.isArray(categories)
    ? categories.map((category) => string(record(category)?.title) ?? "").join(" ") : "";
  return TECH_TERMS.test([
    categoryText,
    title,
    excerpt,
  ].join(" "));
}

function totalPages(value: unknown): number | undefined {
  const root = record(value);
  const data = record(root?.data);
  const pagination = record(root?.pagination) ?? record(data?.pagination);
  const metadata = record(root?.metadata) ?? record(data?.metadata);
  const pages = pagination?.totalPages ?? metadata?.totalPages ?? root?.totalPages ?? data?.totalPages;
  if (typeof pages === "number") return pages;
  const total = pagination?.total ?? metadata?.totalElements ?? root?.total ?? data?.total;
  return typeof total === "number" ? Math.ceil(total / PAGE_SIZE) : undefined;
}

export async function fetchInflearnArticles(page: number): Promise<ArticlePage> {
  const url = new URL("/api/blogs", ORIGIN);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(PAGE_SIZE));

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`인프런 응답 오류: ${response.status}`);

  const payload: unknown = await response.json();
  const raw = entries(payload);
  if (!raw) throw new Error("인프런 응답 형식을 확인할 수 없습니다.");

  const articles = raw.filter(isTechRelatedBlog)
    .map(normalizeBlog).filter((article): article is TechArticle => article !== null);
  const pages = totalPages(payload);
  return { articles, hasNext: pages === undefined ? raw.length === PAGE_SIZE : page < pages };
}
