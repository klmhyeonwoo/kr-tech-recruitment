"use client";
import React from "react";
import { handleScaledAnimalName, QuestionTypes } from "./question-banner";
import styles from "@/styles/components/question-banner.module.scss";
import QuestionFaceGenerator from "./question-face-generator";
import NotDataSwimming from "../common/not-data";

export default function QuestionCommentList({
  comments,
}: {
  comments: QuestionTypes["questionData"]["comments"];
}) {
  return (
    <div className={styles.question__question__container}>
      {comments.length > 0 ? (
        comments.map((item) => {
          return (
            <div
              className={styles.question__member__container}
              key={item.hotIssueCommentId}
            >
              <div className={styles.question__member__wrapper}>
                <div className={styles.question__member__face__container}>
                  <QuestionFaceGenerator
                    faceName={handleScaledAnimalName({
                      name: item.anonymousName.split(" ")[1],
                    })}
                  />
                  <span className={styles.question__member__name}>
                    {item.anonymousName}
                  </span>
                </div>
                <span className={styles.question__member__description}>
                  {item.content}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <NotDataSwimming description="아직 등록된 댓글이 없어요" />
      )}
    </div>
  );
}
