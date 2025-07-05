"use client";
import React, { Fragment, useRef, useState } from "react";
import QuestionCommentGenerator from "./question-comment-generator";
import hotIssue from "@/api/domain/hotIssue";
import { QuestionTypes } from "./question-banner";
import QuestionCommentList from "./question-comment-list";

export default function QuestionCommentPost({
  questionData,
  comments,
}: {
  questionData: QuestionTypes["questionData"];
  comments: QuestionTypes["questionData"]["comments"];
}) {
  const [localQuestionData] = useState({
    ...questionData,
  });
  const [localComments, setLocalComments] = useState([...(comments ?? [])]);
  const [loader, setLoader] = useState({
    refresh: false,
    comments: false,
  });

  const userData = useRef({
    anonymousName: "",
    content: "",
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
      const { data, status } = await hotIssue.getCommentsList({
        questionId: localQuestionData.hotIssueId,
      });
      if (status === 200) {
        setLocalComments(data?.comments ?? []);
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
    <Fragment>
      <QuestionCommentGenerator
        refresh={handleUpdateCommentList}
        updateUserData={handleUpdateUserData}
        submitComment={handleComments}
        loader={loader.comments || loader.refresh}
      />
      <QuestionCommentList comments={localComments} />
    </Fragment>
  );
}
