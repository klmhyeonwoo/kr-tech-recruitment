import community from "@/api/domain/community";
import React from "react";
import "@/styles/domain/community-detail.scss";
import Comments, { CommentsProps } from "@/app/community/_components/comments";
import { cookies } from "next/headers";
import Link from "next/link";
import arrow_icon from "@public/icon/arrow_black.svg";
import Image from "next/image";
import dateUtil from "@/utils/dateUtil";

type paramsType = Promise<{
  detailId: string;
}>;

const getDetailBoardData = async (params: paramsType) => {
  const { detailId } = await params;
  try {
    const { data, status } = await community.viewBoard(detailId);
    if (status === 200) {
      return data;
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error fetching board details:", error);
    return {};
  }
};

export async function generateMetadata({ params }: { params: paramsType }) {
  const data = await getDetailBoardData(params);
  return {
    title: data.title,
    description: data.content,
  };
}

export default async function Page({ params }: { params: paramsType }) {
  const data = await getDetailBoardData(params);
  const cookie = await cookies();
  const userId = cookie.get("nklcb__un");

  return (
    <div className="board__container">
      <Link href="/community" className="board__back__link">
        <Image src={arrow_icon} width={17} height={17} alt="뒤로가기 아이콘" />
        <span> 리스트로 돌아가기</span>
      </Link>
      <div className="board__title__section">
        <span> {data.title} </span>
        <div className="board__info__section">
          <span> {data.nickname} </span>
          <span> {dateUtil.formattedDate(data.createdAt)} </span>
        </div>
      </div>
      <div className="spacer__line" />
      <div className="board__content__section">
        <div className="board__content">{data.content}</div>
      </div>
      <Comments
        comments={data.comments}
        commentsCount={data.comments.length}
        likesCount={data.likes.length}
        isLiked={
          userId
            ? (data.likes as CommentsProps["comments"]).some(
                (like) => like.userId === Number(userId.value)
              )
            : false
        }
      />
    </div>
  );
}
