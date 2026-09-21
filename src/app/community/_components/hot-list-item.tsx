"use client";

import { useEffect, useState } from "react";
import ListItem from "./list-item";
import styles from "@/styles/components/list.module.scss";
import community from "@/api/domain/community";
import type { ListProps } from "./list";

export default function HotListItem() {
  const [hotList, setHotList] = useState<ListProps["list"][number] | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadPopularArticle = async () => {
      try {
        const { status, data } = await community.bestList();
        if (isActive && status === 200 && typeof data?.boardId === "number") {
          setHotList(data);
        }
      } catch {
        // 인기글을 불러오지 못해도 전체 목록은 계속 이용할 수 있어요.
      }
    };

    void loadPopularArticle();
    return () => {
      isActive = false;
    };
  }, []);

  if (!hotList) return null;

  return (
    <section className={styles.featured} aria-labelledby="popular-article-title">
      <h2 id="popular-article-title" className={styles.featuredHeading}>
        지금 인기 있는 글
      </h2>
      <ListItem
        id={hotList.boardId}
        title={hotList.title}
        content={hotList.content}
        writer={hotList.nickname}
        date={hotList.createdAt}
        commentCount={hotList.comments?.length ?? 0}
        likeCount={hotList.likes?.length ?? 0}
      />
    </section>
  );
}
