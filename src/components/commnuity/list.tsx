"use client";
import React, { Fragment, useEffect, useState } from "react";
import ListItem from "./list-item";
import styles from "@/styles/components/list.module.scss";
import Button from "../common/button";
import Input from "../search/Input";
import HotListItem from "./hot-list-item";
import Board from "../common/modal/board";
import community from "@/api/domain/community";

interface ListProps {
  list: {
    boardId: number;
    userId: number;
    nickname: string;
    comments: Array<{
      boardCommentId: number;
      userId: number;
      nickname: string;
      content: string;
      createdAt: string;
      modifiedAt: string;
    }>;
    likes: Array<{
      boardLikeId: number;
      userId: number;
      nickname: string;
      createdAt: string;
      modifiedAt: string;
    }>;
    title: string;
    content: string;
    createdAt: string;
    modifiedAt: string;
  }[];
  metadata: {
    totalElements: number;
  };
}

const BOARD_PAGE_MAX_COUNT = 10;
const INITIAL_PAGE_BOARD_DATA = {
  list: [],
  metadata: {
    totalElements: 0,
  },
};

export default function List() {
  const [isShowModal, setShowModal] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageBoardData, setPageBoardData] = useState<ListProps>(
    INITIAL_PAGE_BOARD_DATA
  );
  const totalPageCount = Math.ceil(
    pageBoardData?.metadata?.totalElements / BOARD_PAGE_MAX_COUNT
  );

  useEffect(() => {
    (async () => {
      await getPageBoardData(currentPage);
    })();
  }, []);

  const getPageBoardData = async (page: number) => {
    const { status, data } = await community.standardList({
      page,
      pageSize: 10,
    });
    if (status === 200) {
      setPageBoardData(data);
    } else {
      setPageBoardData(INITIAL_PAGE_BOARD_DATA);
    }
  };

  const handleWriteBoard = () => {
    getPageBoardData(currentPage);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Fragment>
      {isShowModal && (
        <Board refreshData={handleWriteBoard} closeModal={handleCloseModal} />
      )}
      <div className={styles.list__container}>
        <HotListItem />
        <div className={styles.list__util}>
          <Input
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button onClick={() => setShowModal(true)}> 게시글 작성하기 </Button>
        </div>
        {pageBoardData?.list?.map((item) => (
          <ListItem
            key={item.boardId}
            title={item.title}
            content={item.content}
            writer={item.nickname}
            date={item.createdAt}
            commentCount={item.comments.length}
            likeCount={item.likes.length}
          />
        ))}
        <div className={styles.list__more}>
          {Array.from({ length: totalPageCount }, (_, index) => (
            <Button
              key={index}
              data-active={currentPage === index + 1}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
