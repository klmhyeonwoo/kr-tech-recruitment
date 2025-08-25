import React, { useEffect, useState } from "react";
import ListItem from "./list-item";
import styles from "@/styles/components/list.module.scss";
import volt_gif from "../../../public/images/volt.gif";
import Image from "next/image";
import community from "@/api/domain/community";
import { ListProps } from "./list";
import NotDataSwimming from "../common/not-data";

export default function HotListItem() {
  const [hotList, setHotList] = useState<ListProps["list"][number] | null>(
    null
  );

  useEffect(() => {
    (async () => {
      const { status, data } = await community.bestList();
      if (status === 200) {
        setHotList(data);
      } else {
        setHotList(null);
      }
    })();
  }, []);

  return (
    <div className={styles.hot__list__container}>
      <div className={styles.container__title}>
        <Image src={volt_gif} alt="전기" width={25} height={25} />
        <span>현재 가장 인기있는 게시글이에요</span>
      </div>
      {hotList ? (
        <ListItem
          id={hotList.boardId}
          key={hotList.boardId}
          title={hotList.title}
          content={hotList.content}
          writer={hotList.nickname}
          writerId={hotList.userId}
          date={hotList.createdAt}
          commentCount={hotList.comments?.length}
          likeCount={hotList.likes?.length}
        />
      ) : (
        <NotDataSwimming description="아직 인기 게시글이 존재하지 않아요" />
      )}
    </div>
  );
}
