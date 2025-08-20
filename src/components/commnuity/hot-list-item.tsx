import React from "react";
import mock from "@/mock/hot-community.json";
import ListItem from "./list-item";
import styles from "@/styles/components/list.module.scss";
import volt_gif from "../../../public/images/volt.gif";
import Image from "next/image";

export default function HotListItem() {
  console.log("HotListItem data:", mock);
  const { data } = mock;

  console.log(data);

  return (
    <div className={styles.hot__list__container}>
      <div className={styles.container__title}>
        <Image src={volt_gif} alt="전기" width={25} height={25} />
        <span>현재 가장 인기있는 게시글이에요</span>
      </div>
      {data.map((item) => {
        return (
          <ListItem
            key={item.boardId}
            title={item.title}
            content={item.content}
            writer={item.nickname}
            date={item.createdAt}
            commentCount={item.comments.length}
            likeCount={item.likes.length}
          />
        );
      })}
    </div>
  );
}
