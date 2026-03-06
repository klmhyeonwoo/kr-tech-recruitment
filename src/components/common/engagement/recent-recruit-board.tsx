"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/components/recent-recruit-board.module.scss";
import {
  clearRecentRecruitItems,
  getRecentRecruitItems,
  RecentRecruitItem,
  saveRecentRecruitItem,
} from "@/utils/recentRecruit";

const MAX_RENDER_COUNT = 6;

const formatViewedAt = (viewedAt: string) => {
  const viewedDate = new Date(viewedAt);

  if (Number.isNaN(viewedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(viewedDate);
};

export default function RecentRecruitBoard() {
  const [items, setItems] = useState<RecentRecruitItem[]>([]);

  useEffect(() => {
    setItems(getRecentRecruitItems());
  }, []);

  const visibleItems = useMemo(() => items.slice(0, MAX_RENDER_COUNT), [items]);

  const handleOpenRecruit = (item: RecentRecruitItem) => {
    saveRecentRecruitItem({
      recruitmentNoticeId: item.recruitmentNoticeId,
      path: item.path,
      title: item.title,
      companyName: item.companyName,
      position: item.position,
    });

    setItems(getRecentRecruitItems());
    window.open(
      `/recruitment-notices?id=${item.recruitmentNoticeId}&path=${item.path}`,
      "_blank",
    );
  };

  const handleClearItems = () => {
    clearRecentRecruitItems();
    setItems([]);
  };

  if (!visibleItems.length) {
    return null;
  }

  return (
    <section className={styles.container} aria-labelledby="recent-recruit-title">
      <div className={styles.header}>
        <div>
          <h2 id="recent-recruit-title">최근 본 공고</h2>
          <p>이전에 확인한 공고를 빠르게 다시 열어볼 수 있어요.</p>
        </div>
        <button type="button" className={styles.clearButton} onClick={handleClearItems}>
          기록 지우기
        </button>
      </div>

      <div className={styles.list}>
        {visibleItems.map((item) => (
          <button
            key={`${item.recruitmentNoticeId}-${item.viewedAt}`}
            type="button"
            className={styles.item}
            onClick={() => handleOpenRecruit(item)}
          >
            <div className={styles.company}>{item.companyName}</div>
            <div className={styles.title}>{item.title}</div>
            <div className={styles.meta}>
              <span>{item.position ? `${item.position} · ` : ""}최근 확인 {formatViewedAt(item.viewedAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
