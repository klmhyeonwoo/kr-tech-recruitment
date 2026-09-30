"use client";
import React, { Fragment, useRef, useState } from "react";
import styles from "@/styles/components/headers.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Menu {
  title: string;
  target: string;
}

const menu = [
  {
    title: "네카라쿠배",
    target: "/web",
  },
  {
    title: "커뮤니티",
    target: "/community",
  },
  {
    title: "테크 아티클",
    target: "/tech-articles",
  },
  {
    title: "대외활동",
    target: "/dev-activities",
  },
  {
    title: "구독하기",
    target: "/subscribe",
  },
] as const satisfies Menu[];

function Header({ wide = false }: { wide?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Fragment>
      <header className={styles.header__container}>
        <div className={styles.header__wrapper} data-wide={wide}>
          <Link href="/" prefetch={true} className={styles.header__logo} onClick={() => setMenuOpen(false)}>
            seoul dev club
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          <nav
            id="primary-navigation"
            className={styles.header__nav}
            data-open={menuOpen}
            aria-label="주요 메뉴"
            onKeyDown={(event) => {
              if (event.key === "Escape" && menuOpen) {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
              }
            }}
          >
            {menu.map((item) => {
              return (
                <Link
                  key={item.target}
                  href={item.target}
                  prefetch={true}
                  className={styles.navigate__announcement_button}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={pathname === item.target ? styles.active : ""}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className={styles.header__overlay} />
    </Fragment>
  );
}

export default Header;
