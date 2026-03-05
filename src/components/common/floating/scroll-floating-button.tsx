"use client";

import React from "react";
import Image from "next/image";
import styles from "./scroll-floating-button.module.scss";

export default function ScrollFloationButton() {
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
    <div className={styles["floating-wrapper"]}>
      <button
        type="button"
        className={styles["scroll-button"]}
        onClick={handleScrollTop}
        aria-label="페이지 상단으로 이동"
      >
        <Image
          src="/icon/arrow_black.svg"
          alt=""
          width={18}
          height={18}
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
          width={18}
          height={18}
          className={`${styles["arrow-icon"]} ${styles["arrow-down"]}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
