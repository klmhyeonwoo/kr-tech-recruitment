"use client";
import React from "react";
import styles from "@/styles/components/question-banner.module.scss";
import QuestionCommentList from "./question-comment-list";
import QuestionTitle from "./question-title";
import QuestionCommentMore from "./question-comment-more";

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
  return (
    <div>
      <div className={styles.question__banner__container}>
        <QuestionTitle title={questionData?.title} />
        <div className={styles.question__banner__wrapper}>
          <QuestionCommentList comments={questionData.comments} />
          <QuestionCommentMore />
        </div>
      </div>
    </div>
  );
}

export default QuestionBanner;
