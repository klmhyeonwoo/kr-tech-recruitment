"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import community from "@/api/domain/community";
import useUser from "@/hooks/common/useUser";
import styles from "@/styles/components/list.module.scss";
import BoardPostModal from "./board-post-modal";
import HotListItem from "./hot-list-item";
import ListItem from "./list-item";
import UserStatusBlock from "./user-status-block";

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

type FeedState = {
  key: string;
  status: "loading" | "success" | "error";
  data: ListProps | null;
};

const PAGE_SIZE = 10;
const VISIBLE_PAGE_COUNT = 5;

function parsePage(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function buildFeedHref(keyword: string, page = 1): string {
  const params = new URLSearchParams();
  if (keyword) params.set("q", keyword);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/community${query ? `?${query}` : ""}`;
}

function useCommunityFeed(keyword: string, page: number) {
  const requestKey = JSON.stringify([keyword, page]);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [state, setState] = useState<FeedState>({
    key: requestKey,
    status: "loading",
    data: null,
  });

  useEffect(() => {
    let isActive = true;
    setState({ key: requestKey, status: "loading", data: null });

    const loadArticles = async () => {
      try {
        const { status, data } = await community.standardList({
          page: page - 1,
          pageSize: PAGE_SIZE,
          searchWord: keyword,
        });
        if (
          status !== 200 ||
          !Array.isArray(data?.list) ||
          !Number.isSafeInteger(data?.metadata?.totalElements) ||
          data.metadata.totalElements < 0
        ) {
          throw new Error("Invalid community list response");
        }
        if (isActive) {
          setState({ key: requestKey, status: "success", data });
        }
      } catch {
        if (isActive) {
          setState({ key: requestKey, status: "error", data: null });
        }
      }
    };

    void loadArticles();
    return () => {
      isActive = false;
    };
  }, [keyword, page, reloadVersion, requestKey]);

  const currentState: FeedState =
    state.key === requestKey
      ? state
      : { key: requestKey, status: "loading", data: null };

  return {
    ...currentState,
    reload: () => setReloadVersion((version) => version + 1),
  };
}

export default function List() {
  const router = useRouter();
  const params = useSearchParams();
  const keyword = params.get("q")?.trim() ?? "";
  const currentPage = parsePage(params.get("page"));
  const [isShowModal, setShowModal] = useState(false);
  const { isLogin } = useUser();
  const { status, data, reload } = useCommunityFeed(keyword, currentPage);
  const totalElements = data?.metadata.totalElements ?? 0;
  const totalPageCount = Math.ceil(totalElements / PAGE_SIZE);
  const lastPage = Math.max(1, totalPageCount);
  const firstVisiblePage = Math.max(
    1,
    Math.min(currentPage - 2, totalPageCount - VISIBLE_PAGE_COUNT + 1),
  );
  const visiblePages = Array.from(
    { length: Math.min(VISIBLE_PAGE_COUNT, totalPageCount) },
    (_, index) => firstVisiblePage + index,
  );

  useEffect(() => {
    if (status === "success" && currentPage > lastPage) {
      router.replace(buildFeedHref(keyword, lastPage), { scroll: false });
    }
  }, [currentPage, keyword, lastPage, router, status]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextKeyword = String(formData.get("q") ?? "").trim();
    router.push(buildFeedHref(nextKeyword), { scroll: false });
  };

  return (
    <>
      {isShowModal && (
        <BoardPostModal
          refreshData={reload}
          closeModal={() => setShowModal(false)}
        />
      )}
      <div className={styles.feed}>
        <div className={styles.toolbar}>
          <form
            key={keyword}
            className={styles.search}
            role="search"
            aria-label="커뮤니티 게시글 검색"
            onSubmit={handleSearch}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              id="community-query"
              name="q"
              type="search"
              aria-label="게시글 검색어"
              placeholder="개발·커리어 이야기 검색"
              defaultValue={keyword}
              maxLength={120}
            />
            <button type="submit">검색</button>
          </form>
          <div className={styles.writeAction}>
            {isLogin ? (
              <button
                type="button"
                className={styles.writeButton}
                onClick={() => setShowModal(true)}
              >
                글쓰기
              </button>
            ) : (
              <UserStatusBlock
                className={styles.loginAction}
                showWhenLoggedIn={false}
                compact
                loginMessage="로그인하고 글쓰기"
              />
            )}
          </div>
        </div>

        {!keyword && <HotListItem />}

        <section className={styles.results} aria-labelledby="community-results-title">
          <div className={styles.resultsHeader}>
            <div className={styles.resultsTitle}>
              <h2 id="community-results-title">{keyword ? "검색 결과" : "전체 글"}</h2>
              {status === "success" && (
                <span aria-label={`${totalElements.toLocaleString("ko-KR")}개의 글`}>
                  {totalElements.toLocaleString("ko-KR")}
                </span>
              )}
            </div>
            {keyword && (
              <Link className={styles.clearSearch} href="/community" scroll={false}>
                검색 초기화
              </Link>
            )}
          </div>
          {keyword && <p className={styles.querySummary}>‘{keyword}’에 관한 이야기</p>}

          <div className={styles.resultBody} aria-busy={status === "loading"}>
            {status === "loading" && (
              <div className={styles.loading} role="status">
                글을 불러오고 있어요.
              </div>
            )}
            {status === "error" && (
              <div className={styles.empty} role="alert">
                <strong>글을 불러오지 못했어요</strong>
                <p>잠시 후 다시 시도해주세요.</p>
                <button type="button" onClick={reload}>다시 불러오기</button>
              </div>
            )}
            {status === "success" && !data?.list.length && (
              <div className={styles.empty} role="status">
                <strong>{keyword ? "검색 결과가 없어요" : "첫 이야기를 기다리고 있어요"}</strong>
                <p>
                  {keyword
                    ? "다른 검색어로 찾아보거나 전체 글을 확인해보세요."
                    : "개발하며 배운 점이나 커리어 고민을 나눠보세요."}
                </p>
                {keyword && <Link href="/community" scroll={false}>전체 글 보기</Link>}
              </div>
            )}
            {status === "success" && !!data?.list.length && (
              <ul className={styles.articleList}>
                {data.list.map((item) => (
                  <li key={item.boardId}>
                    <ListItem
                      id={item.boardId}
                      title={item.title}
                      content={item.content}
                      writer={item.nickname}
                      date={item.createdAt}
                      commentCount={item.comments?.length ?? 0}
                      likeCount={item.likes?.length ?? 0}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {status === "success" && totalPageCount > 1 && (
          <nav className={styles.pagination} aria-label="게시글 페이지">
            {currentPage > 1 ? (
              <Link href={buildFeedHref(keyword, currentPage - 1)} scroll={false} aria-label="이전 페이지">
                <span aria-hidden="true">‹</span>
              </Link>
            ) : (
              <span className={styles.disabledPage} aria-hidden="true">‹</span>
            )}
            {visiblePages.map((page) => (
              <Link
                key={page}
                href={buildFeedHref(keyword, page)}
                scroll={false}
                aria-label={`${page}페이지`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </Link>
            ))}
            {currentPage < totalPageCount ? (
              <Link href={buildFeedHref(keyword, currentPage + 1)} scroll={false} aria-label="다음 페이지">
                <span aria-hidden="true">›</span>
              </Link>
            ) : (
              <span className={styles.disabledPage} aria-hidden="true">›</span>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
