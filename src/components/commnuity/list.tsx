"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import ListItem from "./list-item";
import styles from "@/styles/components/list.module.scss";
import Button from "../common/button";
import Input from "../search/Input";
import HotListItem from "./hot-list-item";
import Board from "../common/modal/board";
import community from "@/api/domain/community";
import Loading from "@/app/loading";
import { debounce } from "es-toolkit";
import NotDataSwimming from "../common/not-data";
import { useRouter, useSearchParams } from "next/navigation";
import useUser from "@/hooks/common/useUser";

export interface ListProps {
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
  const router = useRouter();
  const params = useSearchParams();
  const paramsPage = params.get("page") as number | null;
  const [isShowModal, setShowModal] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(
    paramsPage ? paramsPage - 1 : 0,
  );
  const { isLogin } = useUser();
  const [loader, setLoader] = useState(true);
  const [pageBoardData, setPageBoardData] = useState<ListProps>(
    INITIAL_PAGE_BOARD_DATA,
  );
  const totalPageCount = Math.ceil(
    pageBoardData?.metadata?.totalElements / BOARD_PAGE_MAX_COUNT,
  );

  useEffect(() => {
    (async () => {
      await getPageBoardData({ page: currentPage, keyword });
    })();
  }, []);

  useEffect(() => {
    router.replace(`/community?page=${currentPage + 1}`);
  }, [currentPage]);

  const getPageBoardData = async ({
    page,
    keyword,
  }: {
    page: number;
    keyword: string;
  }) => {
    setLoader(true);
    const { status, data } = await community.standardList({
      page,
      pageSize: 10,
      searchWord: keyword,
    });
    if (status === 200) {
      setPageBoardData(data);
    } else {
      setPageBoardData(INITIAL_PAGE_BOARD_DATA);
    }
    setLoader(false);
  };

  const handleWriteBoard = () => {
    getPageBoardData({ page: currentPage, keyword });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  /**
   * @description 현재 페이지의 번호를 변경하는 함수입니다.
   * @param { number } page 변경할 페이지 번호
   */
  const handleChangePage = (page: number) => {
    setCurrentPage(page);
    getPageBoardData({ page, keyword });
  };

  /**
   * @description 키워드로 게시글 목록을 조회할 때 디바운드 함수입니다.
   */
  const debounceGetBoardDataForKeyword = useRef(
    debounce((keyword: string) => {
      getPageBoardData({ page: 0, keyword });
    }, 500),
  ).current;

  /**
   * @description 키워드로 게시글을 조회하는 함수입니다.
   * @param { string } keyword 검색할 키워드
   */
  const handleChangeKeyword = (keyword: string) => {
    setKeyword(keyword);
    setCurrentPage(0);
    debounceGetBoardDataForKeyword(keyword);
  };

  const renderBoardList = () => {
    if (loader) {
      return <Loading message="" />;
    }

    if (!loader && !pageBoardData?.list?.length) {
      return <NotDataSwimming description="아직 게시글이 존재하지 않아요" />;
    }

    return pageBoardData?.list?.map((item) => (
      <ListItem
        key={item.boardId}
        id={item.boardId}
        title={item.title}
        content={item.content}
        writer={item.nickname}
        writerId={item.userId}
        date={item.createdAt}
        commentCount={item.comments.length}
        likeCount={item.likes.length}
      />
    ));
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
            onChange={(e) => handleChangeKeyword(e.target.value)}
          />
          {isLogin && (
            <Button onClick={() => setShowModal(true)}>게시글 작성하기</Button>
          )}
        </div>
        <div className={styles.list__item__container}>{renderBoardList()}</div>
        <div className={styles.list__more}>
          {Array.from({ length: totalPageCount }, (_, index) => (
            <Button
              key={index}
              data-active={currentPage === index}
              onClick={() => handleChangePage(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
