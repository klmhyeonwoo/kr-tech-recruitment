"use client";
import React, { Fragment } from "react";
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
    title: "아티클",
    target: "/community",
  },
  {
    title: "대외활동",
    target: "/dev-activities",
  },
] as const satisfies Menu[];

function Header() {
  const pathname = usePathname();

  return (
    <Fragment>
      <header className={styles.header__container}>
        <div className={styles.header__wrapper}>
          <Link href="/" prefetch={true} className={styles.header__logo}>
            seoul dev club
          </Link>
          <nav className={styles.header__nav}>
            {menu.map((item, idx) => {
              return (
                <Link
                  key={idx}
                  href={item.target}
                  prefetch={true}
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
