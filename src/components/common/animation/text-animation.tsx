"use client";
import { ElementType, useEffect, useRef, useState } from "react";
import styles from "./TextAnimation.module.scss";

type AnimationUnit = "character" | "word" | "line";
type AnimationType = "fade" | "slide";

interface TextAnimationProps {
  as?: ElementType;
  text: string;
  unit?: AnimationUnit;
  type?: AnimationType;
  delay?: number;
}

export const TextAnimation = ({
  as: Component = "span",
  text,
  unit = "character",
  type = "fade",
  delay = 0,
}: TextAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const splitText = (text: string, unit: AnimationUnit) => {
    switch (unit) {
      case "character":
        return text.split("");
      case "word":
        return text.split(" ").filter(Boolean);
      case "line":
        return text.split("\n").filter(Boolean);
      default:
        return text.split("");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const segments = splitText(text, unit);

  return (
    <Component ref={containerRef} className={styles.container}>
      {segments.map((segment, index) => (
        <span
          key={index}
          className={`
            ${styles.segment} 
            ${styles[type]} 
            ${isVisible ? styles.visible : ""}
          `}
          style={{
            animationDelay: `${delay + index * 0.05}s`,
            marginRight: unit === "word" ? "0.3em" : undefined,
            display: unit === "line" ? "block" : "inline-block",
          }}
        >
          {segment}
        </span>
      ))}
    </Component>
  );
};
