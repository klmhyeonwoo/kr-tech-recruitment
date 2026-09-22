"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { RecruitData } from "@/components/card/Section";
import AnnounceCard from "@/components/card/AnnounceCard";
import styles from "./home-recruitments.module.scss";

type Props = {
  recent: RecruitData[];
  recentTotal?: number;
  recentFailed?: boolean;
  popular: RecruitData[];
  className?: string;
};

const PAGE_SIZE = 5;
type RecruitPage = { list: RecruitData[]; metadata?: { totalElements: number } };

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

async function fetchRecentPage(page: number, signal: AbortSignal): Promise<RecruitPage> {
  const { data } = await api.get<RecruitPage>("/recruitment-notices/redirections", {
    params: { page, pageSize: PAGE_SIZE },
    signal,
  });
  if (!Array.isArray(data.list)) throw new Error("Invalid recruitment response");
  return {
    ...data,
    list: data.list.map((item) => ({ ...item, url: btoa(item.url) })),
  };
}

export default function HomeRecruitments({
  recent,
  recentTotal,
  recentFailed = false,
  popular,
  className,
}: Props) {
  const [view, setView] = useState<"recent" | "popular">("recent");
  const [popularCount, setPopularCount] = useState(PAGE_SIZE);
  const latest = useInfiniteQuery({
    queryKey: ["home-recent-recruitments", PAGE_SIZE],
    queryFn: ({ pageParam, signal }) => fetchRecentPage(pageParam, signal),
    initialPageParam: 0,
    initialData: recentFailed ? undefined : {
      pages: [{ list: recent, metadata: recentTotal === undefined ? undefined : { totalElements: recentTotal } }],
      pageParams: [0],
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const loadedCount = (lastPageParam + 1) * PAGE_SIZE;
      const total = lastPage.metadata?.totalElements;
      if (lastPage.list.length < PAGE_SIZE || (total !== undefined && loadedCount >= total)) return undefined;
      return lastPageParam + 1;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const recentItems = Array.from(new Map(
    (latest.data?.pages.flatMap((page) => page.list) ?? [])
      .map((item) => [item.recruitmentNoticeId, item]),
  ).values());
  const items = view === "recent" ? recentItems : popular.slice(0, popularCount);
  const pending = view === "recent" && latest.isPending;
  const loadingMore = view === "recent" && latest.isFetchingNextPage;
  const error = view === "recent" && latest.isError;
  const hasMore = view === "recent" ? latest.hasNextPage : popularCount < popular.length;

  function loadMore() {
    if (view === "popular") setPopularCount((count) => count + PAGE_SIZE);
    else if (latest.isError && !latest.data) void latest.refetch();
    else if (!latest.isFetching) void latest.fetchNextPage();
  }

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-labelledby="home-recruitments-title"
    >
      <div className={styles.heading}>
        <h1 id="home-recruitments-title">채용</h1>
      </div>
      <div
        className={styles.switcher}
        role="group"
        aria-label="채용 공고 보기 방식"
      >
        <button
          type="button"
          aria-pressed={view === "recent"}
          onClick={() => setView("recent")}
        >
          최신 공고
        </button>
        <button
          type="button"
          aria-pressed={view === "popular"}
          onClick={() => setView("popular")}
        >
          많이 본 공고
        </button>
      </div>
      <div id="home-recruitments-list" aria-busy={pending || loadingMore}>
        {pending ? <p className={styles.feedback} role="status">공고를 불러오고 있어요.</p>
          : items.length > 0 || !error ? <AnnounceCard items={items} showAllLink={false} /> : null}
      </div>
      <div className={styles.moreArea}>
        {error && <p className={styles.feedback} role="alert">공고를 불러오지 못했어요. 다시 시도해 주세요.</p>}
        {(hasMore || error) && <button type="button" className={styles.moreButton}
          aria-controls="home-recruitments-list"
          disabled={loadingMore || (view === "recent" && latest.isFetching)}
          onClick={loadMore}>
          {loadingMore ? "불러오는 중…" : error ? "다시 불러오기" : "공고 더보기"}
          {!loadingMore && !error && <ChevronDownIcon />}
        </button>}
        {!pending && !error && !hasMore && items.length > 0 &&
          <p className={styles.feedback}>공고를 모두 확인했어요.</p>}
      </div>
      <p className={styles.srOnly} role="status">
        {pending ? "" : `${view === "recent" ? "최신" : "많이 본"} 공고 ${items.length}개 표시 중`}
      </p>
    </section>
  );
}
