import React, { useState } from "react";
import styles from "@/styles/components/question-banner.module.scss";
import QuestionUsernameGenerator from "./question-username-generator";
import Input from "../search/Input";
import Button from "../common/button";

type QuestionCommentGeneratorTypes = {
  refresh: () => void;
  updateUserData: ({
    nickname,
    comment,
  }: {
    nickname: string;
    comment: string;
  }) => void;
  submitComment: () => void;
  loader: boolean;
};

function QuestionCommentGenerator({
  updateUserData,
  submitComment,
  refresh,
  loader,
}: QuestionCommentGeneratorTypes) {
  const [nickName, setNickName] = useState("");
  const [userComment, setUserComment] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } },
    { type }: { type: "nickName" | "userComment" }
  ) => {
    if (type === "nickName") {
      setNickName(e.target.value);
    } else if (type === "userComment") {
      setUserComment(e.target.value);
    }
  };

  const handleSubmit = async () => {
    try {
      await updateUserData({
        nickname: nickName,
        comment: userComment,
      });
      await submitComment();
      await refresh();
      setNickName("");
      setUserComment("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.question__input__container}>
      <QuestionUsernameGenerator
        handleChange={(e) => handleChange(e, { type: "nickName" })}
      />
      <Input
        value={userComment}
        onChange={(e) => handleChange(e, { type: "userComment" })}
        placeholder="비방 · 허위· 욕설 등의 코멘트는 통보없이 삭제될 수 있어요"
        isIcon={false}
      />
      <Button
        className={styles.question__submit__button}
        disabled={userComment.trim().length === 0}
        onClick={handleSubmit}
        loader={loader}
      >
        내 생각을 남겨볼게요
      </Button>
    </div>
  );
}

export default QuestionCommentGenerator;
