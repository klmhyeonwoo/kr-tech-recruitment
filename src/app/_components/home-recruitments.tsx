"use client";

import { useState } from "react";
import type { RecruitData } from "@/components/card/Section";
import AnnounceCard from "@/components/card/AnnounceCard";
import styles from "./home-recruitments.module.scss";

type Props = {
  recent: RecruitData[];
  popular: RecruitData[];
};

export default function HomeRecruitments({ recent, popular }: Props) {
  const [view, setView] = useState<"recent" | "popular">("recent");

  return (
    <section className={styles.section} aria-labelledby="home-recruitments-title">
      <div className={styles.heading}>
        <div>
          <h2 id="home-recruitments-title">지금 살펴볼 채용</h2>
          <p>새로운 공고와 관심이 모인 기회를 확인하세요.</p>
        </div>
        <div
          className={styles.switcher}
          role="group"
          aria-label="채용 공고 보기 방식"
        >
          <button
            type="button"
            aria-pressed={view === "recent"}
            onClick={() => setView("recent")}
          >
            새 공고
          </button>
          <button
            type="button"
            aria-pressed={view === "popular"}
            onClick={() => setView("popular")}
          >
            많이 본 공고
          </button>
        </div>
      </div>
      <AnnounceCard items={view === "recent" ? recent : popular} />
    </section>
  );
}
