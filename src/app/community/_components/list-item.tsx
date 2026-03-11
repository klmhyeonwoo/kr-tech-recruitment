"use client";
import React from "react";
import styles from "@/styles/components/list.module.scss";
import BoardInfo from "./board-info";
import Link from "next/link";
import dateUtil from "@/utils/dateUtil";
interface listItemProps {
  id: number;
  title: string;
  content: string;
  writer: string;
  date: string;
  commentCount: number;
  likeCount: number;
}

export default function ListItem({
  id,
  title,
  content,
  writer,
  date,
  commentCount,
  likeCount,
}: listItemProps) {
  return (
    <Link className={styles.item__container} href={`/community/detail/${id}`}>
      <div className={styles.title__wrapper}>
        <span className={styles.title}>{title}</span>
      </div>
      <span className={styles.content}>{content}</span>
      <div className={styles.util__container}>
        <span>
          {writer} · {dateUtil.formattedDate(date)}
        </span>
        <BoardInfo commentCount={commentCount} likeCount={likeCount} />
      </div>
    </Link>
  );
}
