import React from "react";
import styles from "@/styles/components/comment-item.module.scss";
import UserAvatar from "./user-avatar";

interface CommentItemProps {
  comment: string;
  writer: string;
  createAt: string;
}

export default function CommentItem({
  comment,
  writer,
  createAt,
}: CommentItemProps) {
  const createdDate = new Date(createAt);
  const formattedDate = Number.isNaN(createdDate.getTime())
    ? createAt
    : createdDate.toLocaleDateString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

  return (
    <article
      className={styles.comment__item__container}
      aria-label={`${writer}님의 댓글`}
    >
      <header className={styles.comment__info__wrapper}>
        <span aria-hidden="true"><UserAvatar size={20} /></span>
        <span className={styles.comment__writer}>{writer}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={createAt} title={createAt}>{formattedDate}</time>
      </header>
      <p className={styles.comment__content}>{comment}</p>
    </article>
  );
}
