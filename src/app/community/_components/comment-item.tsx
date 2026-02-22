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
  return (
    <div className={styles.comment__item__container}>
      <span className={styles.comment__content}>{comment}</span>
      <div className={styles.comment__info__wrapper}>
        <UserAvatar size={17} />
        <span>{writer}</span>
        <span> · </span>
        <span>{createAt}</span>
      </div>
    </div>
  );
}
