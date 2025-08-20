import React from "react";
import ellipsis_icon from "../../../public/icon/commnuity/ellipsis.svg";
import heart from "../../../public/icon/commnuity/heart.svg";
import Image from "next/image";
import styles from "@/styles/components/list.module.scss";

interface listItemProps {
  title: string;
  content: string;
  writer: string;
  date: string;
  commentCount: number;
  likeCount: number;
}

export default function ListItem({
  title,
  content,
  writer,
  date,
  commentCount,
  likeCount,
}: listItemProps) {
  return (
    <div className={styles.item__container}>
      <span className={styles.title}>{title}</span>
      <span className={styles.content}>{content}</span>
      <div className={styles.util__container}>
        <span>
          {writer} · {date}
        </span>
        <div className={styles.util__wrapper}>
          <Image
            src={ellipsis_icon}
            alt="ellipsis icon"
            width={20}
            height={20}
          />
          <span>{commentCount}</span>
        </div>
        <div className={styles.util__wrapper}>
          <Image src={heart} alt="heart icon" width={25} height={25} />
          <span>{likeCount}</span>
        </div>
      </div>
    </div>
  );
}
