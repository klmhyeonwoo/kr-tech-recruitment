"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";
import heart_default_icon from "@public/icon/commnuity/comment/heart.default.svg";
import heart_active_icon from "@public/icon/commnuity/comment/heart.fill.svg";
import "@/styles/domain/community-detail.scss";
import Input from "@/components/search/Input";
import Button from "@/components/common/button";
import community from "@/api/domain/community";
import { useParams } from "next/navigation";
import NotDataSwimming from "@/components/common/feedback/not-data";
import CommentItem from "./comment-item";
import BoardInfo from "./board-info";
import useUser from "@/hooks/common/useUser";
import { debounce } from "es-toolkit";

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
}

export default function Comments({
  comments: serverComments,
  commentsCount: serverCommentsCount,
  likesCount: serverLikesCount,
  isLiked: serverIsLiked,
}: CommentsProps) {
  const params = useParams();
  const [isLiked, setIsLiked] = useState(serverIsLiked);
  const [userComment, setUserComment] = useState("");
  const [comments, setComments] =
    useState<CommentsProps["comments"]>(serverComments);
  const [commentsCount, setCommentsCount] = useState(serverCommentsCount);
  const [likesCount, setLikesCount] = useState(serverLikesCount);
  const [loader, setLoader] = useState(false);
  const { isLogin } = useUser();

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

  const handleToggleList = async () => {
    debounceToggleLike();
  };

  return (
    <div className="comment__container">
      <BoardInfo commentCount={commentsCount} likeCount={likesCount} />
      {isLogin && (
        <div className="comment__input">
          <div onClick={handleToggleList} className="comment__like">
            {isLiked ? (
              <Image
                src={heart_active_icon}
                alt="좋아요 아이콘"
                width={25}
                height={25}
              />
            ) : (
              <Image
                src={heart_default_icon}
                alt="좋아요 아이콘"
                width={25}
                height={25}
              />
            )}
          </div>
          <Input
            isIcon={false}
            placeholder="게시글에 댓글을 자유롭게 입력해보세요"
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
          />
          <Button
            disabled={!userComment}
            onClick={handleSubmitComment}
            loader={loader}
          >
            댓글 작성하기
          </Button>
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
