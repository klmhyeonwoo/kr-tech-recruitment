import hotIssue from "@/api/domain/hotIssue";
import QuestionCommentPost from "@/components/question/question-comment-post";
import QuestionTitle from "@/components/question/question-title";
import { Fragment } from "react";
import type { Metadata } from "next";
import { BASE_URL } from "@/utils/const";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hot Issue 질문",
  description:
    "IT 업계 핫이슈에 대한 질문과 답변. 개발자들의 생생한 의견을 확인하고 함께 토론해보세요.",
  keywords: [
    "IT 핫이슈",
    "개발자 질문",
    "기술 토론",
    "IT 업계 이슈",
    "개발 트렌드",
    "네카라쿠배 질문",
  ],
  openGraph: {
    title: "Hot Issue 질문 | 네카라쿠배 채용",
    description:
      "IT 업계 핫이슈에 대한 질문과 답변. 개발자들의 생생한 의견을 확인하고 함께 토론해보세요.",
    url: `${BASE_URL}/question`,
    type: "website",
  },
  alternates: {
    canonical: `${BASE_URL}/question`,
  },
};

async function getHotIssueQuestionData() {
  try {
    const { data } = await hotIssue.getActivatedList();
    return data;
  } catch (error) {
    return { data: [], error };
  }
}

async function getCommentList({ questionId }: { questionId: number }) {
  try {
    const { data } = await hotIssue.getCommentsList({ questionId });
    return data;
  } catch (error) {
    return { data: [], error };
  }
}

export default async function page() {
  const { list } = await getHotIssueQuestionData();
  const { comments } = await getCommentList({
    questionId: list[0]?.hotIssueId,
  });

  return (
    <Fragment>
      <QuestionTitle title={list[0]?.title} />
      <QuestionCommentPost questionData={list[0]} comments={comments} />
    </Fragment>
  );
}
