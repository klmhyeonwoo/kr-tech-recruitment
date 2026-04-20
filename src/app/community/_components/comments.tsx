"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import heart_default_icon from "@public/icon/commnuity/comment/heart.default.svg";
import heart_active_icon from "@public/icon/commnuity/comment/heart.fill.svg";
import "@/styles/domain/community-detail.scss";
import Input from "@/components/search/Input";
import Button from "@/components/common/button";
import community from "@/api/domain/community";
import user from "@/api/domain/user";
import { useParams } from "next/navigation";
import NotDataSwimming from "@/components/common/feedback/not-data";
import CommentItem from "./comment-item";
import BoardInfo from "./board-info";
import useUser from "@/hooks/common/useUser";
import { debounce } from "es-toolkit";
import UserStatusBlock from "./user-status-block";

export interface CommentsProps {
  comments: {
    boardCommentId: number;
    userId: number;
    nickname: string;
    content: string;
    createdAt: string;
  }[];
  commentsCount: number;
  likesCount: number;
  isLiked: boolean;
  likeUserIds: number[];
}

export default function Comments({
  comments: serverComments,
  commentsCount: serverCommentsCount,
  likesCount: serverLikesCount,
  isLiked: serverIsLiked,
  likeUserIds: serverLikeUserIds,
}: CommentsProps) {
  const params = useParams();
  const [isLiked, setIsLiked] = useState(serverIsLiked);
  const [userComment, setUserComment] = useState("");
  const [comments, setComments] =
    useState<CommentsProps["comments"]>(serverComments);
  const [commentsCount, setCommentsCount] = useState(serverCommentsCount);
  const [likesCount, setLikesCount] = useState(serverLikesCount);
  const [likeUserIds, setLikeUserIds] = useState(serverLikeUserIds);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loader, setLoader] = useState(false);
  const { isLogin } = useUser();

  useEffect(() => {
    if (!isLogin) {
      setCurrentUserId(null);
      setIsLiked(false);
      return;
    }

    (async () => {
      try {
        const { status, data } = await user.userInfo();
        if (status === 200) {
          setCurrentUserId(data.id);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    })();
  }, [isLogin]);

  useEffect(() => {
    if (!isLogin || !currentUserId) {
      return;
    }

    setIsLiked(likeUserIds.includes(currentUserId));
  }, [currentUserId, isLogin, likeUserIds]);

  const handleSubmitComment = async () => {
    const { detailId } = params;
    if (!detailId) return console.error("No detailId found in params");
    if (userComment.trim()) {
      setLoader(true);
      const { status } = await community.submitComment({
        boardId: detailId as string,
        content: userComment,
      });
      // 서버에서 성공 상태 값을 204로 내려줌
      if (status === 204) {
        await handleRefreshData();
        setUserComment("");
      }
      setLoader(false);
    }
  };

  const handleRefreshData = async () => {
    const { data, status } = await community.viewBoard(
      params.detailId as string,
    );
    if (status === 200) {
      setComments(data.comments);
      setCommentsCount(data.comments.length);
      setLikesCount(data.likes.length);
      setLikeUserIds(data.likes.map((like: { userId: number }) => like.userId));
    } else {
      console.error("Failed to refresh data");
    }
  };

  const debounceToggleLike = useRef(
    debounce(async () => {
      setIsLiked((prev) => !prev);
      const { status } = await community.toggleLike({
        boardId: params.detailId as string,
      });
      if (status !== 204) {
        setIsLiked((prev) => !prev);
      }
      await handleRefreshData();
    }, 300),
  ).current;

  const handleToggleLike = async () => {
    debounceToggleLike();
  };

  return (
    <div className="comment__container">
      <BoardInfo commentCount={commentsCount} likeCount={likesCount} />
      {isLogin ? (
        <div className="comment__input">
          <button
            type="button"
            onClick={handleToggleLike}
            className="comment__like"
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          >
            {isLiked ? (
              <Image
                src={heart_active_icon}
                alt=""
                aria-hidden="true"
                width={23}
                height={23}
              />
            ) : (
              <Image
                src={heart_default_icon}
                alt=""
                aria-hidden="true"
                width={23}
                height={23}
              />
            )}
          </button>
          <div className="comment__field">
            <Input
              isIcon={false}
              placeholder="댓글을 입력하세요"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
          </div>
          <Button
            className="comment__submit"
            disabled={!userComment.trim()}
            onClick={handleSubmitComment}
            loader={loader}
          >
            작성
          </Button>
        </div>
      ) : (
        <div className="comment__auth">
          <div className="comment__auth__content">
            <strong>댓글 작성은 로그인 후 이용할 수 있어요</strong>
            <p>카카오 로그인으로 5초만에 댓글을 작성해보세요</p>
          </div>
          <UserStatusBlock
            showWhenLoggedIn={false}
            compact
            loginMessage="카카오 로그인 후 댓글 작성하기"
          />
        </div>
      )}
      <div className="comment__list">
        {comments?.length ? (
          comments.map((item) => {
            return (
              <CommentItem
                key={item.boardCommentId}
                comment={item.content}
                writer={item.nickname}
                createAt={item.createdAt}
              />
            );
          })
        ) : (
          <NotDataSwimming description="아직 댓글이 존재하지 않아요" />
        )}
      </div>
    </div>
  );
}
