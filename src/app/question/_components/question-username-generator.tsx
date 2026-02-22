import React, { useEffect, useState } from "react";
import QuestionFaceGenerator from "./question-face-generator";
import styles from "@/styles/components/question-banner.module.scss";
import { handleScaledAnimalName } from "./question-banner";

type QuestionUsernameGeneratorTypes = {
  handleChange: (event: { target: { value: string } }) => void;
};

function QuestionUsernameGenerator({
  handleChange,
}: QuestionUsernameGeneratorTypes) {
  const [userNameObject, setUserNameObject] = useState({
    adjective: "",
    animal: "",
  });

  const adjectiveList = [
    "기분좋은",
    "수줍은",
    "엉뚱한",
    "용감한",
    "조용한",
    "활기찬",
    "섬세한",
    "웃기는",
    "엉성한",
    "느긋한",
    "새침한",
    "반짝이는",
    "따뜻한",
    "재빠른",
    "어색한",
    "귀여운",
    "사려깊은",
    "긍정적인",
    "차분한",
    "명랑한",
    "화끈한",
    "잔잔한",
    "진지한",
    "낭만적인",
    "단단한",
  ];
  const animalList = ["고양이", "소", "개", "여우", "개구리", "햄스터"];

  const handleChangeUsername = () => {
    const randomAdjective =
      adjectiveList[Math.floor(Math.random() * adjectiveList.length)];
    const randomAnimal =
      animalList[Math.floor(Math.random() * animalList.length)];
    setUserNameObject({
      adjective: randomAdjective,
      animal: randomAnimal,
    });
    handleChange({
      target: {
        value: `${randomAdjective} ${randomAnimal}`,
      },
    });
  };

  useEffect(() => {
    handleChangeUsername();
  }, []);

  return (
    <div className={styles.question__username__generator__container}>
      <div className={styles.question__username__generator__title}>
        <QuestionFaceGenerator
          faceName={handleScaledAnimalName({ name: userNameObject.animal })}
        />
        <div className={styles.question__member__name}>
          {userNameObject.adjective} {userNameObject.animal}
        </div>
      </div>
      <button onClick={handleChangeUsername}>닉네임 변경</button>
    </div>
  );
}

export default QuestionUsernameGenerator;
