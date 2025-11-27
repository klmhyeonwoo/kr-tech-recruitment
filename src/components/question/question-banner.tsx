"use client";
import React from "react";
import styles from "@/styles/components/question-banner.module.scss";
import QuestionCommentList from "./question-comment-list";
import QuestionTitle from "./question-title";
import Anchor from "../common/anchor";

export type QuestionTypes = {
  questionData: {
    hotIssueId: number;
    recruitmentNoticeId: null;
    title: string;
    content: null;
    comments: {
      hotIssueCommentId: number;
      maskedIp: string;
      anonymousName: string;
      content: string;
      createdAt: string;
      modifiedAt: string;
    }[];
    startAt: string;
    endAt: string;
    createdAt: string;
    modifiedAt: string;
  };
};

export const handleScaledAnimalName = ({ name }: { name: string }) => {
  return (
    ({
      고양이: "cat",
      소: "cow",
      개: "dog",
      여우: "fox",
      개구리: "frog",
      햄스터: "hamster",
    }[name] as "cat" | "cow" | "dog" | "fox" | "frog" | "hamster") ?? "cat"
  );
};

function QuestionBanner({ questionData }: QuestionTypes) {
  if (!questionData) return null;
  return (
    <div>
      <div className={styles.question__banner__container}>
        <QuestionTitle title={questionData?.title} />
        <div className={styles.question__banner__wrapper}>
          <QuestionCommentList comments={questionData.comments} />
          {/* <QuestionCommentMore /> */}
        </div>
        <Anchor href="/question" text="질문에 답변하러가기" />
      </div>
    </div>
  );
}

export default QuestionBanner;
