"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./scroll-floating-button.module.scss";

export default function ScrollFloationButton() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollIdleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleWindowScroll = () => {
      setIsScrolling(true);

      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }

      scrollIdleTimerRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 180);
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);

      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
    };
  }, []);

  /**
   * @description 뷰 포트의 상단으로 이동
   */
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  /**
   * @description 뷰 포트의 하위로 이동
   */
  const handleScrollBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "auto",
    });
  };

  return (
    <div
      className={`${styles["floating-wrapper"]} ${isScrolling ? styles["floating-wrapper-scrolling"] : ""}`}
    >
      <button
        type="button"
        className={styles["scroll-button"]}
        onClick={handleScrollTop}
        aria-label="페이지 상단으로 이동"
      >
        <Image
          src="/icon/arrow_black.svg"
          alt=""
          width={20}
          height={20}
          className={`${styles["arrow-icon"]} ${styles["arrow-up"]}`}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        className={styles["scroll-button"]}
        onClick={handleScrollBottom}
        aria-label="페이지 하단으로 이동"
      >
        <Image
          src="/icon/arrow_black.svg"
          alt=""
          width={20}
          height={20}
          className={`${styles["arrow-icon"]} ${styles["arrow-down"]}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
