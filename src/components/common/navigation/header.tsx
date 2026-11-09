"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./header.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { SearchMenuItem } from "../global-search/global-search";

// 통합 검색은 처음 열 때 내려받습니다.
const GlobalSearch = dynamic(() => import("../global-search/global-search"), { ssr: false });

type NavItem = { title: string; target: string; keywords?: string };
type Group = { key: string; title: string; items: readonly NavItem[] };

// 큰 메뉴 3개, 그 아래 줄에는 지금 보고 있는 메뉴의 하위 탭이 나옵니다.
const GROUPS: readonly Group[] = [
  {
    key: "jobs",
    title: "채용",
    items: [
      { title: "채용 공고", target: "/", keywords: "공고 채용 개발자 job recruit 지원" },
      { title: "기업별 채용", target: "/web", keywords: "회사 기업 company" },
      { title: "원격근무 회사", target: "/remote-work-companies", keywords: "재택 리모트 remote 유연근무" },
      { title: "개발자 대외활동", target: "/dev-activities", keywords: "동아리 부트캠프 컨퍼런스 해커톤 밋업 모임" },
    ],
  },
  {
    key: "learn",
    title: "학습",
    items: [
      { title: "면접 준비", target: "/interview-questions", keywords: "기술면접 인터뷰 질문 interview" },
      { title: "테크 아티클", target: "/tech-articles", keywords: "블로그 기술 글 article 뉴스" },
      { title: "개발 트렌드", target: "/tech-trends", keywords: "trend 스택 기술 순위" },
    ],
  },
  {
    key: "community",
    title: "커뮤니티",
    items: [
      { title: "커뮤니티", target: "/community", keywords: "게시판 글 community" },
      { title: "이번 주 질문", target: "/question", keywords: "question 주간 질문" },
    ],
  },
];

const UTILITY = [
  { title: "구독하기", target: "/subscribe", external: false },
  { title: "서비스 문의", target: "https://6oo1v.channel.io/home", external: true },
  { title: "업데이트", target: "https://github.com/klmhyeonwoo/kr-tech-recruitment/releases", external: true },
] as const;

// 통합 검색에서 바로 갈 수 있는 메뉴 목록
const SEARCH_MENU: readonly SearchMenuItem[] = [
  ...GROUPS.flatMap((group) => group.items.map((item) => ({ title: item.title, target: item.target, group: group.title, keywords: item.keywords }))),
  { title: "북마크한 공고", target: "/?bookmark=1", group: "내 활동", keywords: "저장 찜 bookmark" },
  { title: "구독하기", target: "/subscribe", group: "서비스", keywords: "메일 뉴스레터 알림 subscribe" },
  { title: "서비스 문의", target: "https://6oo1v.channel.io/home", group: "서비스", keywords: "문의 채팅 contact 도움", external: true },
  { title: "업데이트", target: "https://github.com/klmhyeonwoo/kr-tech-recruitment/releases", group: "서비스", keywords: "릴리즈 변경 update release", external: true },
];

type HeaderProps = { wide?: boolean; floating?: boolean };

// wide / floating 은 예전 레이아웃 호환용 props 입니다.
function Header(_props: HeaderProps) {
  void _props;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);

  const openSearch = () => { setMenuOpen(false); setSearchLoaded(true); setSearchOpen(true); };
  const closeSearch = () => { setSearchOpen(false); searchButtonRef.current?.focus({ preventScroll: true }); };

  // Ctrl/Cmd + K, 입력창 밖에서 / 로도 열 수 있어요.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey)) {
        event.preventDefault();
        setMenuOpen(false); setSearchLoaded(true); setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isCurrent = (target: string) =>
    target === "/"
      ? pathname === "/" || pathname.startsWith("/recruitment-notices")
      : pathname === target || pathname.startsWith(`${target}/`);

  const activeGroup = GROUPS.find((group) => group.items.some((item) => isCurrent(item.target))) ?? (pathname.startsWith("/subscribe") ? GROUPS[2] : GROUPS[0]);
  const closeMenu = () => setMenuOpen(false);

  // 페이지가 바뀌면 열려 있던 메뉴를 닫습니다.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className={styles.header__container}
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) { setMenuOpen(false); menuButtonRef.current?.focus(); }
      }}>
      <div className={styles.utility}>
        <ul>
          {UTILITY.map((item) => (
            <li key={item.target}>
              {item.external
                ? <a href={item.target} target="_blank" rel="noopener noreferrer">{item.title}</a>
                : <Link href={item.target}>{item.title}</Link>}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.main}>
        <Link href="/" prefetch className={styles.header__logo} onClick={closeMenu} aria-label="서울데브클럽 홈">seoul dev club</Link>

        <nav className={styles.groups} aria-label="주요 메뉴">
          {GROUPS.map((group) => (
            <Link key={group.key} href={group.items[0].target} className={styles.group}
              aria-current={group.key === activeGroup.key ? "true" : undefined}>
              {group.title}
            </Link>
          ))}
        </nav>

        <div className={styles.icons}>
          <button ref={searchButtonRef} type="button" className={styles.iconLink} aria-label="통합 검색 열기" aria-haspopup="dialog" onClick={openSearch}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
          </button>
          <Link href="/?bookmark=1#jobs" className={styles.iconLink} aria-label="북마크한 공고 보기">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" /></svg>
          </Link>
          <button ref={menuButtonRef} type="button" className={styles.menuButton}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen}
            aria-controls="all-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <nav className={styles.tabs} aria-label={`${activeGroup.title} 하위 메뉴`}>
        <ul>
          {activeGroup.items.map((item) => (
            <li key={item.target}>
              <Link href={item.target} aria-current={isCurrent(item.target) ? "page" : undefined}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav id="all-navigation" className={styles.drawer} data-open={menuOpen} aria-label="전체 메뉴">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <p>{group.title}</p>
            <ul>
              {group.items.map((item) => (
                <li key={item.target}>
                  <Link href={item.target} onClick={closeMenu} aria-current={isCurrent(item.target) ? "page" : undefined}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {searchLoaded && <GlobalSearch open={searchOpen} onClose={closeSearch} menu={SEARCH_MENU} />}
    </header>
  );
}

export default Header;
