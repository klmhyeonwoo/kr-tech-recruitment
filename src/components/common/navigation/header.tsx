import React, { Fragment } from "react";
import styles from "@/styles/components/headers.module.scss";
import logo from "@public/images/logo.svg";
import Image from "next/image";
import Link from "next/link";

function Header() {
  return (
    <Fragment>
      <header className={styles.header__container}>
        <div className={styles.header__wrapper}>
          <Link href="/" prefetch={true}>
            <Image
              src={logo}
              alt="로고"
              className={styles.header__logo}
              layout="responsive"
            />
          </Link>
          <nav className={styles.header__nav}>
            <Link
              href="/web"
              prefetch={true}
              className={styles.navigate__announcement_button}
              role="button"
            >
              빅테크 공고 확인하기
            </Link>
          </nav>
        </div>
      </header>
      <div className={styles.header__overlay} />
    </Fragment>
  );
}

export default Header;
