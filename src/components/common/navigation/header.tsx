"use client";
import React, { Fragment } from "react";
import styles from "@/styles/components/headers.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Menu {
  title: string;
  target: string;
  newTab?: boolean;
}

const menu: Menu[] = [
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
    newTab: true,
  },
  {
    title: "대외활동",
    target: "/dev-activities",
  },
  {
    title: "구독하기",
    target: "/subscribe",
  },
];

function Header({ wide = false }: { wide?: boolean }) {
  const pathname = usePathname();

  return (
    <Fragment>
      <header className={styles.header__container}>
        <div className={styles.header__wrapper} data-wide={wide}>
          <Link href="/" prefetch={true} className={styles.header__logo}>
            seoul dev club
          </Link>
          <nav className={styles.header__nav} aria-label="주요 메뉴">
            {menu.map((item) => {
              return (
                <Link
                  key={item.target}
                  href={item.target}
                  prefetch={true}
                  target={item.newTab ? "_blank" : undefined}
                  rel={item.newTab ? "noopener noreferrer" : undefined}
                  className={styles.navigate__announcement_button}
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
