"use client";

import { Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import JobCard from "@/components/jobs/job-card";
import AdSlot from "@/components/ads/ad-slot";
import Input from "@/components/search/Input";
import Select from "@/components/search/Select";
import { scaledPositionName } from "@/utils/common";
import { LOGO_COMPANY_CODES, companyLogo } from "@/utils/company-logo";
import { companyLabel, deadlineOf, isOpenEnded, type JobItem } from "@/utils/jobs";
import useBookmarks from "@/utils/use-bookmarks";
import styles from "./job-board.module.scss";

type Category = { code: string; name: string };
type Company = { companyCode: string; name: string };
type Sort = "latest" | "popular" | "deadline";
type Period = "" | "open" | "soon";

type Props = {
  initial: JobItem[];
  total: number;
  categories: Category[];
  companies: Company[];
};

const PAGE = 20;
const AD_FIRST = 8; // 첫 광고는 8번째 공고 뒤(4열 기준 두 줄 아래)
const AD_EVERY = 16; // 이후 16개마다
const AD_MAX = 4;

const adAfter = (position: number) =>
  position >= AD_FIRST && (position - AD_FIRST) % AD_EVERY === 0 && (position - AD_FIRST) / AD_EVERY < AD_MAX;
const SORTS: { code: Sort; name: string }[] = [
  { code: "latest", name: "최신순" },
  { code: "popular", name: "인기순" },
  { code: "deadline", name: "마감 임박순" },
];
const PERIODS: { code: Exclude<Period, "">; name: string }[] = [
  { code: "soon", name: "7일 내 마감" },
  { code: "open", name: "상시 채용" },
];

async function fetchAllJobs(signal: AbortSignal): Promise<JobItem[]> {
  const response = await fetch("/api/jobs", { signal });
  if (!response.ok) throw new Error("Failed to load jobs");
  const data = (await response.json()) as { list?: JobItem[] };
  if (!Array.isArray(data.list) || data.list.length === 0) throw new Error("Invalid recruitment response");
  return data.list;
}

function matches(item: JobItem, tokens: string[]) {
  if (!tokens.length) return true;
  const haystack = [
    item.jobOfferTitle, item.companyName, companyLabel(item),
    ...(item.corporates ?? []).map((corporate) => corporate.corporateName),
    ...(item.categories ?? []),
    item.standardCategory, scaledPositionName(item.standardCategory),
  ].join(" ").toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function ListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={styles.list} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={styles.skeleton}><i /><b /><b /></li>
      ))}
    </ul>
  );
}

export default function JobBoard({ initial, total, categories, companies }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [company, setCompany] = useState("");
  const [period, setPeriod] = useState<Period>("");
  const [sort, setSort] = useState<Sort>("latest");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [visible, setVisible] = useState(PAGE);
  const [wantAll, setWantAll] = useState(false);
  const [restored, setRestored] = useState(false);
  const boardRef = useRef<HTMLElement>(null);
  const bookmarks = useBookmarks();
  const deferredQuery = useDeferredValue(query);

  // 주소의 검색 조건을 복원합니다. (공유한 링크로 들어와도 같은 목록이 보여요)
  useEffect(() => {
    const restore = () => {
    const params = new URLSearchParams(window.location.search);
    const sortParam = params.get("sort");
    const periodParam = params.get("period");
    setQuery(params.get("q") ?? "");
    setCategory(params.get("category") ?? "");
    setCompany(params.get("company") ?? "");
    setPeriod(periodParam === "open" || periodParam === "soon" ? periodParam : "");
    setSort(sortParam === "popular" || sortParam === "deadline" ? sortParam : "latest");
    setOnlyBookmarked(params.get("bookmark") === "1");
    setRestored(true);
    };
    restore();
    // 통합 검색이나 뒤로가기로 주소가 바뀌면 같은 조건을 다시 적용합니다.
    window.addEventListener("sdc:restore-filters", restore);
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("sdc:restore-filters", restore);
      window.removeEventListener("popstate", restore);
    };
  }, []);

  useEffect(() => {
    if (!restored) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    if (company) params.set("company", company);
    if (period) params.set("period", period);
    if (sort !== "latest") params.set("sort", sort);
    if (onlyBookmarked) params.set("bookmark", "1");
    const search = params.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [restored, query, category, company, period, sort, onlyBookmarked]);

  const filtering = !!query.trim() || !!category || !!company || !!period || onlyBookmarked;

  // 전체 공고는 화면이 한가해졌을 때(또는 조건을 바꾸는 순간) 한 번만 불러옵니다.
  useEffect(() => {
    if (wantAll) return;
    if (filtering) { setWantAll(true); return; }
    const hasIdle = "requestIdleCallback" in window;
    const idle = hasIdle
      ? window.requestIdleCallback(() => setWantAll(true), { timeout: 2500 })
      : window.setTimeout(() => setWantAll(true), 1200);
    return () => {
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [wantAll, filtering]);

  const all = useQuery({
    queryKey: ["home-all-jobs"],
    queryFn: ({ signal }) => fetchAllJobs(signal),
    enabled: wantAll,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const source = all.data ?? initial;
  const ready = !!all.data;

  const results = useMemo(() => {
    const tokens = deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const now = Date.now();
    const list = source.filter((item) => {
      if (deadlineOf(item.endAt, now).tone === "closed") return false;
      if (category && item.standardCategory !== category) return false;
      if (company && item.companyCode !== company) return false;
      if (onlyBookmarked && !bookmarks.ids.includes(item.recruitmentNoticeId)) return false;
      if (period === "open" && !isOpenEnded(item.endAt)) return false;
      if (period === "soon") {
        const { days } = deadlineOf(item.endAt, now);
        if (days === null || days < 0 || days > 7) return false;
      }
      return matches(item, tokens);
    });
    const time = (value?: string | null) => (value ? new Date(value).getTime() : 0);
    if (sort === "popular") {
      list.sort((a, b) => b.clickCount - a.clickCount || time(b.startAt) - time(a.startAt));
    } else if (sort === "deadline") {
      const end = (item: JobItem) => (isOpenEnded(item.endAt) ? Infinity : time(item.endAt));
      list.sort((a, b) => end(a) - end(b));
    } else {
      list.sort((a, b) => time(b.startAt) - time(a.startAt) || b.recruitmentNoticeId - a.recruitmentNoticeId);
    }
    return list;
  }, [source, category, company, period, sort, onlyBookmarked, deferredQuery, bookmarks.ids]);

  // 조건이 바뀌면 처음부터 다시 보여줍니다.
  useEffect(() => { setVisible(PAGE); }, [deferredQuery, category, company, period, sort, onlyBookmarked]);

  const shown = results.slice(0, visible);
  const loadingFilter = filtering && !ready && !all.isError;
  const count = filtering || ready ? results.length : total;
  const emptyBookmarks = onlyBookmarked && bookmarks.ids.length === 0;

  const reset = useCallback(() => {
    setQuery(""); setCategory(""); setCompany(""); setPeriod(""); setOnlyBookmarked(false);
  }, []);

  const scrollToBoard = () => boardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  function submit(event: FormEvent) {
    event.preventDefault();
    setWantAll(true);
    scrollToBoard();
  }

  function pickCompany(code: string) {
    setCompany((current) => (current === code ? "" : code));
    setWantAll(true);
    scrollToBoard();
  }

  const logoCompanies = LOGO_COMPANY_CODES
    .map((code) => companies.find((item) => item.companyCode === code))
    .filter((item): item is Company => !!item);
  const companyOptions = companies.map((item) => ({ code: item.companyCode, name: item.name }));

  return (
    <>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroInner}>
          <h1 id="home-title">개발자 채용,<br />한곳에서 찾아보세요</h1>
          <form className={styles.search} role="search" onSubmit={submit}>
            <Input id="job-search" type="search" value={query} isIcon autoComplete="off" enterKeyHint="search"
              aria-label="직무, 회사, 기술 키워드로 채용 공고 검색"
              placeholder="직무, 회사, 기술 키워드로 검색"
              onFocus={() => setWantAll(true)}
              onChange={(event) => setQuery(event.target.value)} />
            <button type="submit">검색</button>
          </form>
        </div>
      </section>

      <section className={styles.tiles} aria-label="기업별 채용 바로가기">
        <ul>
          {logoCompanies.map((item) => (
            <li key={item.companyCode}>
              <Link href={`/web?company=${item.companyCode}`} className={styles.tile}
                data-active={company === item.companyCode}
                aria-current={company === item.companyCode ? "true" : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                  event.preventDefault();
                  pickCompany(item.companyCode);
                }}>
                <span className={styles.tileLogo}>
                  <Image src={companyLogo(item.companyCode) as string} alt="" width={104} height={36} unoptimized />
                </span>
                <span className={styles.tileName}>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="jobs" ref={boardRef} className={styles.board} aria-labelledby="jobs-title">
        <h2 id="jobs-title" className="sr-only">채용 공고 목록</h2>

        <Suspense fallback={<div className={styles.filtersPlaceholder} aria-hidden="true" />}>
          <div className={styles.filters}>
            <div className={styles.field}>
              <Select data={categories} placeholder="직무" label="직무" isIcon={false} value={category || null}
                onSelect={(code) => { setCategory(code ?? ""); setWantAll(true); }} />
            </div>
            <div className={styles.field}>
              <Select data={companyOptions} placeholder="기업" label="기업" isIcon={false} value={company || null}
                onSelect={(code) => { setCompany(code ?? ""); setWantAll(true); }} />
            </div>
            <div className={styles.field}>
              <Select data={PERIODS} placeholder="모집 기간" label="모집 기간" isIcon={false} value={period || null}
                onSelect={(code) => { setPeriod((code as Period | null) ?? ""); setWantAll(true); }} />
            </div>
            <button type="button" className={styles.bookmarkToggle} aria-pressed={onlyBookmarked}
              onClick={() => { setOnlyBookmarked(!onlyBookmarked); setWantAll(true); }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={onlyBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" /></svg>
              북마크{bookmarks.ids.length > 0 && <b>{bookmarks.ids.length}</b>}
            </button>
            <div className={`${styles.field} ${styles.sortField}`}>
              <Select data={SORTS} placeholder="최신순" label="정렬" isIcon={false} clearable={false} value={sort}
                onSelect={(code) => { setSort((code as Sort | null) ?? "latest"); setWantAll(true); }} />
            </div>
          </div>
        </Suspense>

        <div className={styles.bar}>
          <p role="status" aria-live="polite">
            공고 <strong>{loadingFilter ? "…" : count.toLocaleString("ko-KR")}</strong>개
          </p>
          {filtering && <button type="button" onClick={reset}>조건 초기화</button>}
        </div>

        <div className={styles.results}>
          {loadingFilter ? (
            <ListSkeleton />
          ) : shown.length > 0 ? (
            <ul className={styles.list} aria-busy={all.isFetching && !ready}>
              {shown.flatMap((item, index) => {
                const row = (
                  <li key={item.recruitmentNoticeId}>
                    <JobCard item={item} bookmarked={bookmarks.ids.includes(item.recruitmentNoticeId)}
                      onToggleBookmark={bookmarks.toggle} />
                  </li>
                );
                return adAfter(index + 1) && index < shown.length - 1
                  ? [row, <li key={`ad-${index}`} className={styles.adRow}><AdSlot variant="infeed" placement="home-feed" /></li>]
                  : [row];
              })}
            </ul>
          ) : (
            <div className={styles.empty}>
              <strong>{emptyBookmarks ? "북마크한 공고가 없어요" : "조건에 맞는 공고가 없어요"}</strong>
              {filtering && <button type="button" onClick={reset}>조건 초기화</button>}
            </div>
          )}

          {all.isError && !ready && (
            <p className={styles.feedback} role="alert">
              전체 공고를 불러오지 못했어요.{" "}
              <button type="button" className={styles.inline} onClick={() => void all.refetch()}>다시 시도</button>
            </p>
          )}
        </div>

        {results.length > visible && (
          <div className={styles.more}>
            <button type="button" onClick={() => setVisible((current) => current + PAGE)}>더보기</button>
          </div>
        )}

        {shown.length > 0 && <AdSlot variant="multiplex" placement="home-bottom" />}
      </section>
    </>
  );
}
