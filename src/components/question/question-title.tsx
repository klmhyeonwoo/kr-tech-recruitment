"use client";
import React from "react";
import LetterFade from "../common/animation/letter-fade";
import styles from "@/styles/components/question-banner.module.scss";

export default function QuestionTitle({ title } = { title: "" }) {
  return (
    <div className={styles.question__banner__title__wrapper}>
      <LetterFade
        as="span"
        text="이번 주 질문이 도착했어요, 어떻게 생각하세요?"
        options={{
          delay: 0.5,
        }}
      />
      <LetterFade
        as="h2"
        text={title}
        options={{
          delay: 1,
        }}
      />
    </div>
  );
}
