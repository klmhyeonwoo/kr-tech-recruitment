"use client";

import { Fragment, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import styles from "./global-search.module.scss";
import { companyLogo } from "@/utils/company-logo";
import { companyLabel, hueOf, jobHref, deadlineOf } from "@/utils/jobs";
import type { RecruitData } from "@/components/card/Section";

export type SearchMenuItem = { title: string; target: string; group: string; keywords?: string; external?: boolean };

type Props = { open: boolean; onClose: () => void; menu: readonly SearchMenuItem[] };

type Result = {
  key: string;
  section: string;
  title: string;
  sub?: string;
  href: string;
  external?: boolean;
  logo?: string | null;
  initial?: string;
  hue?: number;
  badge?: string;
};

type Sources = {
  jobs: RecruitData[];
  remote: { id: string; companyName: string; remoteCategory?: string; links: { label: string; url: string }[] }[];
  activities: { id: string; name: string; description: string }[];
  questions: { id: string; title: string; label: string; tab: "frontend" | "backend" }[];
};

const RECENT_KEY = "sdc-recent-search";
const LIMITS = { menu: 4, company: 4, job: 6, remote: 3, activity: 3, question: 4 } as const;

let sourcePromise: Promise<Sources> | null = null;

// 처음 열 때 한 번만 불러옵니다. (데이터 파일은 이때 따로 내려받아서 첫 화면이 가벼워요)
function loadSources(): Promise<Sources> {
  if (sourcePromise) return sourcePromise;
  sourcePromise = (async () => {
    const [jobsRes, remote, activities, questions] = await Promise.all([
      fetch("/api/jobs").then((res) => (res.ok ? res.json() : { list: [] })).catch(() => ({ list: [] })),
      import("@/data/remote-work-companies.kr.json"),
      import("@/data/dev-activities.json"),
      import("@/data/interview-questions.json"),
    ]);
    const flatQuestions: Sources["questions"] = [];
    for (const tab of ["frontend", "backend"] as const) {
      for (const category of questions.default[tab].categories) {
        for (const question of category.questions) flatQuestions.push({ id: question.id, title: question.title, label: category.label, tab });
      }
    }
    return {
      jobs: (jobsRes.list ?? []) as RecruitData[],
      remote: remote.default.companies as Sources["remote"],
      activities: activities.default.activities as Sources["activities"],
      questions: flatQuestions,
    };
  })();
  sourcePromise.catch(() => { sourcePromise = null; });
  return sourcePromise;
}

const tokensOf = (query: string) => query.trim().toLowerCase().split(/\s+/).filter(Boolean);
const matches = (haystack: string, tokens: string[]) => {
  const lower = haystack.toLowerCase();
  return tokens.every((token) => lower.includes(token));
};

function Mark({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return <>{text}</>;
  const escaped = tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? <mark key={index}>{part}</mark> : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  );
}

export default function GlobalSearch({ open, onClose, menu }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [sources, setSources] = useState<Sources | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const deferred = useDeferredValue(query);

  useEffect(() => setMounted(true), []);

  // 열릴 때: 최근 검색어 읽기, 데이터 불러오기, 입력창 포커스, 뒷 화면 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      setRecent(Array.isArray(saved) ? saved.filter((item) => typeof item === "string").slice(0, 6) : []);
    } catch { setRecent([]); }
    loadSources().then(setSources).catch(() => setFailed(true));
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // 페이지를 옮기면 닫습니다.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (open) onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const tokens = useMemo(() => tokensOf(deferred), [deferred]);
  const hasQuery = tokens.length > 0;

  const { results, jobTotal } = useMemo(() => {
    const out: Result[] = [];
    let jobTotal = 0;
    if (!hasQuery) return { results: out, jobTotal };

    const menuHits = menu.filter((item) => matches(`${item.title} ${item.group} ${item.keywords ?? ""}`, tokens)).slice(0, LIMITS.menu);
    for (const item of menuHits) {
      out.push({ key: `m-${item.target}`, section: "메뉴", title: item.title, sub: item.group, href: item.target, external: item.external, badge: "이동" });
    }

    if (sources) {
      // 기업: 채용 공고에 나온 기업 중 이름이 맞는 곳
      // 회사 이름은 대표 계열사(코드가 같은 곳)의 한글 이름을 쓰고, 다른 계열사 이름으로도 찾을 수 있어요.
      const companies = new Map<string, { name: string; alias: Set<string>; count: number }>();
      for (const job of sources.jobs) {
        const code = job.companyCode;
        if (!code) continue;
        const main = job.corporates?.find((item) => item.corporateCode === code)?.corporateName;
        const entry = companies.get(code) ?? { name: main ?? job.corporates?.[0]?.corporateName ?? job.companyName, alias: new Set<string>([job.companyName]), count: 0 };
        if (main) entry.name = main;
        for (const item of job.corporates ?? []) entry.alias.add(item.corporateName);
        entry.count += 1;
        companies.set(code, entry);
      }
      const companyHits = [...companies.entries()]
        .filter(([code, entry]) => matches(`${entry.name} ${[...entry.alias].join(" ")} ${code}`, tokens))
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, LIMITS.company);
      for (const [code, entry] of companyHits) {
        out.push({
          key: `c-${code}`, section: "기업", title: entry.name, sub: `채용 중 ${entry.count}건`,
          href: `/web?${new URLSearchParams({ company: code })}`, logo: companyLogo(code), initial: entry.name.slice(0, 1), hue: hueOf(entry.name),
        });
      }

      const jobHits = sources.jobs.filter((job) =>
        matches([job.jobOfferTitle, job.companyName, ...(job.corporates ?? []).map((item) => item.corporateName), job.standardCategory, ...(job.categories ?? [])].join(" "), tokens));
      jobTotal = jobHits.length;
      for (const job of jobHits.slice(0, LIMITS.job)) {
        const label = companyLabel(job);
        out.push({
          key: `j-${job.recruitmentNoticeId}`, section: "채용 공고", title: job.jobOfferTitle, sub: label,
          href: jobHref(job), logo: companyLogo(job.companyCode), initial: label.slice(0, 1), hue: hueOf(label), badge: deadlineOf(job.endAt).label,
        });
      }

      for (const item of sources.remote.filter((company) => matches(company.companyName, tokens)).slice(0, LIMITS.remote)) {
        out.push({
          key: `r-${item.id}`, section: "원격근무 회사", title: item.companyName,
          sub: item.remoteCategory === "full" ? "완전 원격" : "부분 원격",
          href: `/remote-work-companies?${new URLSearchParams({ q: item.companyName })}`, initial: item.companyName.slice(0, 1), hue: hueOf(item.companyName),
        });
      }

      for (const item of sources.activities.filter((activity) => matches(`${activity.name} ${activity.description}`, tokens)).slice(0, LIMITS.activity)) {
        out.push({
          key: `a-${item.id}`, section: "개발자 대외활동", title: item.name, sub: item.description,
          href: `/dev-activities?${new URLSearchParams({ q: item.name })}`, initial: item.name.slice(0, 1), hue: hueOf(item.name),
        });
      }

      for (const item of sources.questions.filter((question) => matches(question.title, tokens)).slice(0, LIMITS.question)) {
        out.push({
          key: `q-${item.id}`, section: "면접 질문", title: item.title, sub: item.label,
          href: `/interview-questions?${new URLSearchParams({ q: item.title, tab: item.tab })}`,
        });
      }
    }
    return { results: out, jobTotal };
  }, [hasQuery, tokens, menu, sources]);

  // 채용 공고 전체 보기 (맨 아래 고정 항목)
  const allJobsHref = hasQuery ? `/?${new URLSearchParams({ q: deferred.trim() })}#jobs` : "/";
  const items: Result[] = hasQuery
    ? [...results, { key: "all-jobs", section: "", title: `‘${deferred.trim()}’ 채용 공고 전체 검색`, sub: sources ? (jobTotal ? `공고 ${jobTotal}건` : undefined) : undefined, href: allJobsHref, badge: "검색" }]
    : [];

  useEffect(() => { setActive(0); }, [deferred]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const remember = useCallback((value: string) => {
    const text = value.trim();
    if (!text) return;
    const next = [text, ...recent.filter((item) => item !== text)].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* 저장 공간이 막혀 있어도 검색은 됩니다 */ }
  }, [recent]);

  const go = useCallback((item: Result) => {
    if (item.section !== "메뉴") remember(query);
    onClose();
    if (item.external) { window.open(item.href, "_blank", "noopener,noreferrer"); return; }
    // 홈에서 채용 공고를 검색하면 페이지를 새로 열지 않고 지금 목록에 바로 적용합니다.
    if (pathname === "/" && item.href.startsWith("/?") ) {
      window.history.pushState(null, "", item.href);
      window.dispatchEvent(new Event("sdc:restore-filters"));
      document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    router.push(item.href);
  }, [onClose, pathname, query, remember, router]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
    if (event.nativeEvent.isComposing) return;
    if (!items.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => (value + 1) % items.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => (value - 1 + items.length) % items.length); }
    else if (event.key === "Enter") { event.preventDefault(); go(items[Math.min(active, items.length - 1)]); }
  };

  if (!mounted || !open) return null;

  const grouped: { section: string; entries: { item: Result; index: number }[] }[] = [];
  items.forEach((item, index) => {
    const last = grouped[grouped.length - 1];
    if (last && last.section === item.section) last.entries.push({ item, index });
    else grouped.push({ section: item.section, entries: [{ item, index }] });
  });

  const menuByGroup = menu.reduce<Record<string, SearchMenuItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  return createPortal(
    <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="통합 검색" onKeyDown={onKeyDown}>
        <div className={styles.bar}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
          {/* 입력창에 커서가 있을 때는 기본 placeholder 가 "…" 없이 잘려서, 직접 그려 줍니다. */}
          <div className={styles.field}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="통합 검색어"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
            />
            {!query && <span className={styles.placeholder} aria-hidden="true">공고, 기업, 면접 질문, 메뉴를 검색해보세요</span>}
          </div>
          {query && (
            <button type="button" className={styles.clear} onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="입력 지우기">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 7l10 10M17 7 7 17" /></svg>
            </button>
          )}
          <button type="button" className={styles.close} onClick={onClose}>닫기</button>
        </div>

        <div className={styles.body} ref={listRef} data-lenis-prevent>
          {!hasQuery ? (
            <>
              {recent.length > 0 && (
                <section className={styles.block}>
                  <div className={styles.blockHead}>
                    <h2>최근 검색어</h2>
                    <button type="button" onClick={() => { setRecent([]); try { localStorage.removeItem(RECENT_KEY); } catch { /* noop */ } }}>모두 지우기</button>
                  </div>
                  <ul className={styles.chips}>
                    {recent.map((word) => (
                      <li key={word}><button type="button" onClick={() => { setQuery(word); inputRef.current?.focus(); }}>{word}</button></li>
                    ))}
                  </ul>
                </section>
              )}
              <section className={styles.block}>
                <div className={styles.blockHead}><h2>바로가기</h2></div>
                <div className={styles.shortcuts}>
                  {Object.entries(menuByGroup).map(([group, entries]) => (
                    <div key={group}>
                      <p>{group}</p>
                      <ul>
                        {entries.map((entry) => (
                          <li key={entry.target}>
                            <a href={entry.target} onClick={(event) => { event.preventDefault(); go({ key: entry.target, section: "메뉴", title: entry.title, href: entry.target, external: entry.external }); }}>
                              {entry.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div role="listbox" aria-label="검색 결과">
              {!sources && !failed && <p className={styles.note}>검색 데이터를 불러오는 중이에요.</p>}
              {failed && <p className={styles.note}>일부 데이터를 불러오지 못했어요. 메뉴 검색만 가능해요.</p>}
              {grouped.map((group) => (
                <section key={group.section || "all"} className={styles.block}>
                  {group.section && <div className={styles.blockHead}><h2>{group.section}</h2></div>}
                  <ul className={styles.results}>
                    {group.entries.map(({ item, index }) => (
                      <li key={item.key}>
                        <a
                          href={item.href}
                          role="option"
                          aria-selected={index === active}
                          data-active={index === active}
                          data-all={item.key === "all-jobs"}
                          onMouseMove={() => setActive(index)}
                          onClick={(event) => { event.preventDefault(); go(item); }}
                        >
                          {item.key === "all-jobs" ? (
                            <svg className={styles.allIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
                          ) : item.logo ? (
                            <span className={styles.logo}><img src={item.logo} alt="" /></span>
                          ) : item.initial ? (
                            <span className={styles.avatar} style={{ background: `hsl(${item.hue ?? 0} 32% 92%)`, color: `hsl(${item.hue ?? 0} 40% 32%)` }}>{item.initial}</span>
                          ) : (
                            <span className={styles.dot} aria-hidden="true" />
                          )}
                          <span className={styles.text}>
                            <strong>{item.key === "all-jobs" ? item.title : <Mark text={item.title} tokens={tokens} />}</strong>
                            {item.sub && <small>{item.key === "all-jobs" ? item.sub : <Mark text={item.sub} tokens={tokens} />}</small>}
                          </span>
                          {item.badge && <em>{item.badge}</em>}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {sources && results.length === 0 && <p className={styles.note}>일치하는 결과가 없어요. 다른 검색어로 찾아보세요.</p>}
            </div>
          )}
        </div>

        <div className={styles.hint} aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
          <span><kbd>Enter</kbd> 열기</span>
          <span><kbd>Esc</kbd> 닫기</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
