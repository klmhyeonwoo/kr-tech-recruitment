import Image from "next/image";
import React from "react";
import styles from "@/styles/components/question-banner.module.scss";
import cat_face from "../../../public/images/face/cat.gif";
import cow_face from "../../../public/images/face/cow.gif";
import dog_face from "../../../public/images/face/dog.gif";
import fox_face from "../../../public/images/face/fox.gif";
import frog_face from "../../../public/images/face/frog.gif";
import hamster_face from "../../../public/images/face/hamster.gif";

interface QuestionFaceGeneratorTypes {
  faceName: "cat" | "cow" | "dog" | "fox" | "frog" | "hamster";
}

function QuestionFaceGenerator({ faceName }: QuestionFaceGeneratorTypes) {
  const animalFaces = {
    cat: cat_face,
    cow: cow_face,
    dog: dog_face,
    fox: fox_face,
    frog: frog_face,
    hamster: hamster_face,
  } as const;
  return (
    <div className={styles.question__member__face__wrapper}>
      <Image
        src={animalFaces[faceName]}
        alt="동물 얼굴"
        className={styles.question__member__face}
        width={20}
        height={20}
      />
    </div>
  );
}

export default QuestionFaceGenerator;
