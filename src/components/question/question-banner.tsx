"use client";
import React, { useRef, useState } from "react";
import styles from "@/styles/components/question-banner.module.scss";
import LetterFade from "../common/animation/letter-fade";
import QuestionFaceGenerator from "./question-face-generator";
import QuestionCommentGenerator from "./question-comment-generator";
import hotIssue from "@/api/domain/hotIssue";
import NotDataSwimming from "../common/not-data";

type QuestionTypes = {
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
  const [localQuestionData, setLocalQuestionData] = useState({
    ...questionData,
  });
  const userData = useRef({
    anonymousName: "",
    content: "",
  });
  const [loader, setLoader] = useState({
    refresh: false,
    comments: false,
  });
  const handleUpdateUserData = ({
    nickname,
    comment,
  }: {
    nickname: string;
    comment: string;
  }) => {
    userData.current = {
      ...userData.current,
      anonymousName: nickname,
      content: comment,
    };
  };

  const handleUpdateCommentList = async () => {
    try {
      setLoader({
        ...loader,
        refresh: true,
      });
      const { data, status } = await hotIssue.getActivatedList();
      if (status === 200) {
        setLocalQuestionData(data?.list?.[0] ?? []);
      }
      setLoader({
        ...loader,
        refresh: false,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoader({
        ...loader,
        refresh: false,
      });
    }
  };

  const handleComments = async () => {
    try {
      setLoader({
        ...loader,
        comments: true,
      });
      await hotIssue.comments({
        id: localQuestionData.hotIssueId,
        anonymousName: userData.current.anonymousName,
        content: userData.current.content,
      });
      setLoader({
        ...loader,
        comments: false,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoader({
        ...loader,
        comments: false,
      });
    }
  };

  return (
    <div>
      <div className={styles.question__banner__container}>
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
            text={
              localQuestionData?.title ??
              "취업 준비를 하면서 스트레스를 어떻게 해소하나요?"
            }
            options={{
              delay: 1,
            }}
          />
        </div>
        <div className={styles.question__banner__wrapper}>
          <div className={styles.question__question__container}>
            {localQuestionData.comments.length > 0 ? (
              localQuestionData.comments.slice(0, 5).map((item) => {
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
          <QuestionCommentGenerator
            refresh={handleUpdateCommentList}
            updateUserData={handleUpdateUserData}
            submitComment={handleComments}
            loader={loader.comments || loader.refresh}
          />
        </div>
      </div>
    </div>
  );
}

export default QuestionBanner;
