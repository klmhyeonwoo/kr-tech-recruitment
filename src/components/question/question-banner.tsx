"use client";
import React from "react";
import styles from "@/styles/components/question-banner.module.scss";
import LetterFade from "../common/animation/letter-fade";
import Input from "../search/Input";

function QuestionBanner() {
  return (
    <div>
      <div className={styles.question__banner__container}>
        <div className={styles.question__banner__title__wrapper}>
          <LetterFade
            as="span"
            text="오늘의 질문이 도착했어요, 어떻게 생각하시나요?"
            options={{
              delay: 0.5,
            }}
          />
          <LetterFade
            as="h2"
            text="취준 또는 이직 기간 동안 나만의 멘탈 관리 방법은?"
            options={{
              delay: 1,
            }}
          />
        </div>
        <div className={styles.question__member__container}>
          <div className={styles.question__member__wrapper}>
            <span className={styles.question__member__name}>활기찬 호랑이</span>
            <span className={styles.question__member__description}>
              저는 취업 준비를 하면서 스트레스를 줄이기 위해 명상과 운동을
              병행했어요
            </span>
          </div>
          <div className={styles.question__member__wrapper}>
            <span className={styles.question__member__name}>활기찬 도마뱁</span>
            <span className={styles.question__member__description}>
              저는 취업 준비를 하면서 스트레스를 줄이기 위해 명상과 운동을
              병행했어요
            </span>
          </div>
          <div className={styles.question__member__wrapper}>
            <span className={styles.question__member__name}>활기찬 도마뱁</span>
            <span className={styles.question__member__description}>
              저는 취업 준비를 하면서 스트레스를 줄이기 위해 명상과 운동을
              병행했어요
            </span>
          </div>
          <div className={styles.question__member__wrapper}>
            <span className={styles.question__member__name}>활기찬 도마뱁</span>
            <span className={styles.question__member__description}>
              저는 취업 준비를 하면서 스트레스를 줄이기 위해 명상과 운동을
              병행했어요
            </span>
          </div>
        </div>
        <Input
          value={""}
          onChange={() => {}}
          placeholder="여러분들의 생각을 자유롭게 이야기해주세요"
          isIcon={false}
        />
      </div>
    </div>
  );
}

export default QuestionBanner;
