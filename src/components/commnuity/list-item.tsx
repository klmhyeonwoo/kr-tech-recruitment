"use client";
import React from "react";
import styles from "@/styles/components/list.module.scss";
import BoardInfo from "./board-info";
import Link from "next/link";
import Cookies from "js-cookie";
import dateUtil from "@/utils/dateUtil";
interface listItemProps {
  id: number;
  title: string;
  content: string;
  writer: string;
  writerId: number;
  date: string;
  commentCount: number;
  likeCount: number;
}

export default function ListItem({
  id,
  title,
  content,
  writer,
  writerId,
  date,
  commentCount,
  likeCount,
}: listItemProps) {
  const userId = Cookies.get("nklcb__un");
  const isMyPost = userId === writerId.toString();

  return (
    <Link className={styles.item__container} href={`/community/detail/${id}`}>
      <div className={styles.title__wrapper}>
        <span className={styles.title}>{title}</span>
        {isMyPost && (
          <span className={styles.my__post__flag}>
            내가 작성한 글이 여기있어요!
          </span>
        )}
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
