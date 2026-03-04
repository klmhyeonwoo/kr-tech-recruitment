import hotIssue from "@/api/domain/hotIssue";
import QuestionCommentPost from "./_components/question-comment-post";
import QuestionTitle from "./_components/question-title";
import type { QuestionTypes } from "./_components/question-banner";
import { Fragment, cache } from "react";
import type { Metadata } from "next";
import StructuredData from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";
const BASE_URL = "https://nklcb.kr/question";

type HotIssueQuestion = QuestionTypes["questionData"];
type HotIssueComment = HotIssueQuestion["comments"][number];

const toMetaDescription = (content?: string | null) => {
  if (!content) {
    return "이번 주 질문에 대한 다양한 답변을 확인하고 익명으로 의견을 남겨보세요.";
  }

  return content.replace(/\s+/g, " ").trim().slice(0, 160);
};

const getHotIssueQuestionData = cache(async () => {
  try {
    const { data } = await hotIssue.getActivatedList();
    return data as { list: HotIssueQuestion[] };
  } catch (error) {
    return { list: [] as HotIssueQuestion[], error };
  }
});

const getCommentList = cache(async (questionId: number) => {
  try {
    const { data } = await hotIssue.getCommentsList({ questionId });
    return data as { comments: HotIssueComment[] };
  } catch (error) {
    return { comments: [] as HotIssueComment[], error };
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const { list } = await getHotIssueQuestionData();
  const latestQuestion = list[0];

  if (!latestQuestion) {
    return {
      title: "이번 주 질문",
      description: "IT 업계와 커리어에 대한 다양한 질문에 익명으로 참여해보세요.",
      alternates: {
        canonical: BASE_URL,
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return {
    title: `${latestQuestion.title} | 이번 주 질문`,
    description: toMetaDescription(latestQuestion.content ?? latestQuestion.title),
    alternates: {
      canonical: BASE_URL,
    },
    openGraph: {
      title: latestQuestion.title,
      description: toMetaDescription(latestQuestion.content ?? latestQuestion.title),
      url: BASE_URL,
      type: "article",
      siteName: "네카라쿠배 채용",
      locale: "ko_KR",
      publishedTime: latestQuestion.createdAt,
      modifiedTime: latestQuestion.modifiedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: latestQuestion.title,
      description: toMetaDescription(latestQuestion.content ?? latestQuestion.title),
    },
  };
}

export default async function page() {
  const { list } = await getHotIssueQuestionData();
  const latestQuestion = list[0];

  if (!latestQuestion) {
    return (
      <Fragment>
        <QuestionTitle title="이번 주 질문이 아직 준비 중이에요" />
      </Fragment>
    );
  }

  const { comments } = await getCommentList(latestQuestion.hotIssueId);

  const qaStructuredData = latestQuestion
    ? {
        "@context": "https://schema.org",
        "@type": "QAPage",
        mainEntity: {
          "@type": "Question",
          name: latestQuestion.title,
          text: latestQuestion.content ?? latestQuestion.title,
          dateCreated: latestQuestion.createdAt,
          answerCount: comments.length,
          author: {
            "@type": "Organization",
            name: "네카라쿠배 채용",
          },
          suggestedAnswer: comments.slice(0, 20).map((comment) => ({
            "@type": "Answer",
            text: comment.content,
            dateCreated: comment.createdAt,
            author: {
              "@type": "Person",
              name: comment.anonymousName,
            },
          })),
        },
      }
    : null;

  return (
    <Fragment>
      {qaStructuredData && (
        <StructuredData id="structured-data-question" data={qaStructuredData} />
      )}
      <QuestionTitle title={latestQuestion.title} />
      <QuestionCommentPost questionData={latestQuestion} comments={comments} />
    </Fragment>
  );
}
