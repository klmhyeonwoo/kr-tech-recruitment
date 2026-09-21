"use client";

import { useState } from "react";
import type { RecruitData } from "@/components/card/Section";
import AnnounceCard from "@/components/card/AnnounceCard";
import styles from "./home-recruitments.module.scss";

type Props = {
  recent: RecruitData[];
  popular: RecruitData[];
  className?: string;
};

export default function HomeRecruitments({
  recent,
  popular,
  className,
}: Props) {
  const [view, setView] = useState<"recent" | "popular">("recent");

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-labelledby="home-recruitments-title"
    >
      <div className={styles.heading}>
        <h1 id="home-recruitments-title">채용</h1>
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
          최신 공고
        </button>
        <button
          type="button"
          aria-pressed={view === "popular"}
          onClick={() => setView("popular")}
        >
          많이 본 공고
        </button>
      </div>
      <AnnounceCard items={view === "recent" ? recent : popular} />
    </section>
  );
}
