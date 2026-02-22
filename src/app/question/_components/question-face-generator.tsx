import Image from "next/image";
import React from "react";
import styles from "@/styles/components/question-banner.module.scss";
import cat_face from "@public/images/face/cat.png";
import cow_face from "@public/images/face/cow.png";
import dog_face from "@public/images/face/dog.png";
import fox_face from "@public/images/face/fox.png";
import frog_face from "@public/images/face/frog.png";
import hamster_face from "@public/images/face/hamster.png";
import bug_face from "@public/images/face/bug.png";

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
    bug: bug_face,
  } as const;
  return (
    <div className={styles.question__member__face__wrapper}>
      <Image
        src={
          animalFaces[faceName as keyof typeof animalFaces] ||
          animalFaces["bug"]
        }
        alt="동물 얼굴"
        className={styles.question__member__face}
        width={20}
        height={20}
      />
    </div>
  );
}

export default QuestionFaceGenerator;
