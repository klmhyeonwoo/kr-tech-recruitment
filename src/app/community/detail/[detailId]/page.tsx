import community from "@/api/domain/community";
import React from "react";
import "@/styles/domain/community-detail.scss";
import Comments from "@/app/community/_components/comments";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import arrow_icon from "@public/icon/arrow_black.svg";
import Image from "next/image";
import dateUtil from "@/utils/dateUtil";
import StructuredData from "@/lib/seo/structured-data";

type ParamsType = Promise<{
  detailId: string;
}>;

type BoardComment = {
  boardCommentId: number;
  userId: number;
  nickname: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
};

type BoardLike = {
  boardLikeId: number;
  userId: number;
  nickname: string;
  createdAt: string;
  modifiedAt: string;
};

type BoardDetailData = {
  boardId: number;
  userId: number;
  nickname: string;
  title: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
  comments: BoardComment[];
  likes: BoardLike[];
};

const BASE_URL = "https://nklcb.kr";

const toMetaDescription = (content?: string) => {
  if (!content) return "네카라쿠배 커뮤니티 게시글 상세 내용을 확인해보세요.";

  return content.replace(/\s+/g, " ").trim().slice(0, 160);
};

const getDetailBoardData = async (
  detailId: string,
): Promise<BoardDetailData | null> => {
  try {
    const { data, status } = await community.viewBoard(detailId);

    if (status !== 200) {
      return null;
    }

    const parsedData = data as Partial<BoardDetailData>;

    if (
      typeof parsedData?.boardId !== "number" ||
      typeof parsedData?.title !== "string"
    ) {
      return null;
    }

    return {
      boardId: parsedData.boardId,
      userId: parsedData.userId ?? 0,
      nickname: parsedData.nickname ?? "익명",
      title: parsedData.title,
      content: parsedData.content ?? "",
      createdAt: parsedData.createdAt ?? new Date().toISOString(),
      modifiedAt: parsedData.modifiedAt ?? parsedData.createdAt ?? new Date().toISOString(),
      comments: Array.isArray(parsedData.comments) ? parsedData.comments : [],
      likes: Array.isArray(parsedData.likes) ? parsedData.likes : [],
    };
  } catch (error) {
    console.error("Error fetching board details:", error);
    return null;
  }
};

export async function generateMetadata({
  params,
}: {
  params: ParamsType;
}): Promise<Metadata> {
  const { detailId } = await params;
  const data = await getDetailBoardData(detailId);

  if (!data) {
    return {
      title: "게시글을 찾을 수 없습니다",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical = `${BASE_URL}/community/detail/${detailId}`;

  return {
    title: `${data.title} | 네카라쿠배 커뮤니티`,
    description: toMetaDescription(data.content),
    alternates: {
      canonical,
    },
    openGraph: {
      title: data.title,
      description: toMetaDescription(data.content),
      type: "article",
      url: canonical,
      siteName: "네카라쿠배 채용",
      locale: "ko_KR",
      publishedTime: data.createdAt,
      modifiedTime: data.modifiedAt,
      authors: [data.nickname],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: toMetaDescription(data.content),
    },
  };
}

export default async function Page({ params }: { params: ParamsType }) {
  const { detailId } = await params;
  const data = await getDetailBoardData(detailId);

  if (!data) {
    notFound();
  }

  const canonical = `${BASE_URL}/community/detail/${detailId}`;
  const discussionStructuredData = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: data.title,
    articleBody: data.content,
    datePublished: data.createdAt,
    dateModified: data.modifiedAt,
    author: {
      "@type": "Person",
      name: data.nickname,
    },
    mainEntityOfPage: canonical,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: data.likes.length,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: data.comments.length,
      },
    ],
    comment: data.comments.slice(0, 20).map((comment) => ({
      "@type": "Comment",
      text: comment.content,
      dateCreated: comment.createdAt,
      author: {
        "@type": "Person",
        name: comment.nickname,
      },
    })),
  };

  return (
    <>
      <StructuredData
        id={`structured-data-community-${detailId}`}
        data={discussionStructuredData}
      />
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
          isLiked={false}
          likeUserIds={data.likes.map((like) => like.userId)}
        />
      </div>
    </>
  );
}
