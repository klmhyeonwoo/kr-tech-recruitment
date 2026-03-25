"use client";

import { useState } from "react";
import styles from "../page.module.scss";

export default function CriteriaAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.criteriaCard} ${open ? styles.criteriaCardOpen : ""}`}>
      <button
        type="button"
        className={styles.criteriaToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>점수 산정 기준이 무엇인가요?</span>
        <svg
          className={`${styles.criteriaChevron} ${open ? styles.criteriaChevronOpen : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={styles.criteriaBody}>
          <div className={styles.criteriaList}>
            <div className={styles.criteriaItem}>
              <strong>GitHub Stars</strong>
              <p>오픈소스에 대한 관심도 및 인지도를 나타내요</p>
            </div>
            <div className={styles.criteriaItem}>
              <strong>npm 다운로드 수</strong>
              <p>실제 프로젝트에서 얼마나 사용되는지 생태계 활성화 지수예요</p>
            </div>
            <div className={styles.criteriaItem}>
              <strong>Stack Overflow 질문 수</strong>
              <p>커뮤니티 활성도와 개발자들의 실사용 비율을 반영해요</p>
            </div>
          </div>
          <p className={styles.criteriaNote}>세 지표를 정규화하여 0 – 100점으로 환산한 종합 점수예요.</p>
        </div>
      )}
    </div>
  );
}
