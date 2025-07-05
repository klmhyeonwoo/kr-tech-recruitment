import hotIssue from "@/api/domain/hotIssue";
import QuestionCommentPost from "@/components/question/question-comment-post";
import QuestionTitle from "@/components/question/question-title";
import { Fragment } from "react";

export const dynamic = "force-dynamic";

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
