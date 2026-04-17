import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";
import StructuredData from "@/lib/seo/structured-data";
import activitiesData from "@/data/dev-activities.json";
import UserAds from "@/components/ads/user-ads";
import SearchInput from "./_components/SearchInput";
import styles from "./page.module.scss";
import tabStyles from "@/styles/components/tab.module.scss";
import "@/styles/domain/web.scss";

type ActivityCategory = "all" | "club" | "education" | "meetup" | "conference";

type PageSearchParams = {
  category?: string;
  q?: string;
};

type PageProps = {
  searchParams: Promise<PageSearchParams>;
};

const CATEGORY_LABEL: Record<Exclude<ActivityCategory, "all">, string> = {
  club: "동아리",
  education: "교육 · 부트캠프",
  meetup: "모임 · 밋업",
  conference: "행사 · 컨퍼런스",
};

const normalizeCategory = (category?: string): ActivityCategory => {
  if (
    category === "club" ||
    category === "education" ||
    category === "meetup" ||
    category === "conference"
  ) {
    return category;
  }
  return "all";
};

const normalizeQuery = (query?: string) => query?.trim() ?? "";

const buildFilterHref = (category: ActivityCategory, query: string) => {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (query) params.set("q", query);
  const search = params.toString();
  return `/dev-activities${search ? `?${search}` : ""}`;
};

export const metadata: Metadata = {
  title: "개발자 대외활동 모음",
  description:
    "개발자 동아리, 교육/부트캠프, 모임/밋업, 행사/컨퍼런스를 한 곳에서 확인하세요.",
  keywords: [
    "개발자 대외활동",
    "개발자 동아리",
    "개발자 부트캠프",
    "개발자 교육",
    "IT 부트캠프",
    "개발자 모임",
    "개발자 밋업",
    "IT 컨퍼런스",
    "개발자 행사",
    "개발자 커뮤니티",
    "IT 동아리",
    "코딩 부트캠프",
    "개발자 네트워킹",
    "프로그래밍 교육",
    "IT 세미나",
  ],
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
  openGraph: {
    title: "개발자 대외활동 모음",
    description:
      "개발자 동아리, 교육/부트캠프, 모임/밋업, 행사/컨퍼런스를 한 곳에서 확인하세요.",
    type: "website",
    url: "https://nklcb.kr/dev-activities",
    siteName: "네카라쿠배 채용",
    locale: "ko_KR",
    images: [
      {
        url: "https://raw.githubusercontent.com/klmhyeonwoo/Asset-Archieve./main/nklcb.png",
        width: 1200,
        height: 630,
        alt: "개발자 대외활동 모음 - 네카라쿠배 채용",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "개발자 대외활동 모음",
    description:
      "개발자 동아리, 교육/부트캠프, 모임/밋업, 행사/컨퍼런스를 한 곳에서 확인하세요.",
    images: ["https://raw.githubusercontent.com/klmhyeonwoo/Asset-Archieve./main/nklcb.png"],
  },
  alternates: {
    canonical: "https://nklcb.kr/dev-activities",
  },
};

export const revalidate = 86400;

export default async function DevActivitiesPage({ searchParams }: PageProps) {
  const { category, q } = await searchParams;
  const filterCategory = normalizeCategory(category);
  const query = normalizeQuery(q);
  const normalizedQuery = query.toLowerCase();

  const allActivities = activitiesData.activities;

  const filteredActivities = allActivities.filter((activity) => {
    const categoryMatched =
      filterCategory === "all" ? true : activity.category === filterCategory;

    if (!categoryMatched) return false;

    if (!normalizedQuery) return true;

    return [activity.name, activity.description ?? ""].some((field) =>
      field.toLowerCase().includes(normalizedQuery),
    );
  });

  const summary = {
    total: allActivities.length,
    club: allActivities.filter((a) => a.category === "club").length,
    education: allActivities.filter((a) => a.category === "education").length,
    meetup: allActivities.filter((a) => a.category === "meetup").length,
    conference: allActivities.filter((a) => a.category === "conference").length,
  };

  const tabs: Array<{ key: ActivityCategory; label: string }> = [
    { key: "all", label: `전체 (${summary.total})` },
    { key: "club", label: `동아리 (${summary.club})` },
    { key: "education", label: `교육 · 부트캠프 (${summary.education})` },
    { key: "meetup", label: `모임 · 밋업 (${summary.meetup})` },
    { key: "conference", label: `행사 · 컨퍼런스 (${summary.conference})` },
  ];

  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "개발자 대외활동 모음",
    description:
      "개발자 동아리, 교육/부트캠프, 모임/밋업, 행사/컨퍼런스 정보를 모아둔 컬렉션 페이지",
    url: "https://nklcb.kr/dev-activities",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: filteredActivities.length,
      itemListElement: filteredActivities
        .slice(0, 50)
        .map((activity, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: activity.name,
          url: activity.links[0]?.url ?? "https://nklcb.kr/dev-activities",
        })),
    },
  };

  return (
    <DefaultLayout>
      <StructuredData
        id="structured-data-dev-activities"
        data={collectionStructuredData}
      />
      <main className={styles.page}>
        <UserAds />

        <section className={styles.intro}>
          <div>
            <h1 className="title">개발자 대외활동 모음</h1>
            <p className="description">
              개발자 동아리, 교육/부트캠프, 모임/밋업, 행사/컨퍼런스를 한 곳에서
              확인하세요.
            </p>
          </div>
        </section>

        <section className={styles.controls}>
          <div className={tabStyles.tab__container}>
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={buildFilterHref(tab.key, query)}
                className={tabStyles.tab}
                aria-selected={filterCategory === tab.key}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className={styles.searchForm}>
            <Suspense>
              <SearchInput initialQuery={query} />
            </Suspense>
          </div>
        </section>

        {filteredActivities.length ? (
          <ul className={styles.activityGrid}>
            {filteredActivities.map((activity) => (
              <li key={activity.id} className={styles.activityCard}>
                <div className={styles.cardHeader}>
                  <h2>{activity.name}</h2>
                  <span className={styles.categoryBadge}>
                    {
                      CATEGORY_LABEL[
                        activity.category as Exclude<ActivityCategory, "all">
                      ]
                    }
                  </span>
                </div>

                {activity.description && (
                  <p className={styles.cardDescription}>
                    {activity.description}
                  </p>
                )}

                {activity.links.length > 0 && (
                  <div className={styles.linkList}>
                    {activity.links.map((link) => (
                      <a
                        key={`${activity.id}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>
            조건에 맞는 항목이 없습니다. 검색어 또는 필터를 변경해보세요.
          </p>
        )}

        <footer className={styles.sourceNotice}>
          <a
            href="https://github.com/brave-people/Dev-Event"
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
            brave-people/Dev-Event
          </a>
          <span>최신화된 정보가 아닐 수 있어 참고용으로 확인해주세요.</span>
        </footer>
      </main>
    </DefaultLayout>
  );
}
