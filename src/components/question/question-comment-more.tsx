"use client";
import styles from "@/styles/components/question-banner.module.scss";
import Image from "next/image";
import icon_arrow from "../../../public/icon/arrow_white.svg";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function QuestionCommentMore() {
  const moreContainerRef = useRef<HTMLAnchorElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (moreContainerRef.current) {
        const containerTop =
          moreContainerRef.current.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        const isVisible = containerTop < windowHeight && containerTop > 0;
        setIsVisible(isVisible);

        if (circleRef.current && isVisible) {
          const scrollProgress = Math.max(0, windowHeight - containerTop);
          const normalizedProgress = scrollProgress / 100;
          const scale = 0.5 + normalizedProgress * 1.5;
          const opacity = 0.3 + normalizedProgress * 0.7;
          circleRef.current.style.transform = `scale(${scale})`;
          circleRef.current.style.opacity = `${opacity}`;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      moreContainerRef.current?.setAttribute("data-visible", "true");
    } else {
      moreContainerRef.current?.setAttribute("data-visible", "false");
    }
  }, [isVisible]);

  return (
    <Link
      href={"/question"}
      className={styles.question__comment__more__container}
      ref={moreContainerRef}
    >
      <div className={styles.question__comment__circle} ref={circleRef} />
      <span>다른 사람들은 어떤 고민들을 하고 있을까요?</span>
      <span>여러분들의 고민도 함께 나눠주세요</span>
      <div className={styles.question__comment__more__link}>
        <span> 나도 5초만에 답변 남기러가기 </span>
        <Image
          src={icon_arrow}
          width={14}
          height={14}
          alt="더 많은 답변 보러가기"
        />
      </div>
    </Link>
  );
}
