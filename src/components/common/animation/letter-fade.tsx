import { motion, easeInOut } from "motion/react";
import { ElementType } from "react";

type MotionTextProps = {
  as?: ElementType;
  text: string;
  options?: {
    delay?: number;
  };
};

export default function LetterFade({
  as = "span",
  text,
  options = {},
}: MotionTextProps) {
  const MotionTag = motion(as);
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: options.delay || 0,
        staggerChildren: 0.03,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      x: 0,
      y: 3,
      transition: {
        type: "tween" as const,
        ease: easeInOut,
        duration: 0.3,
      },
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "tween" as const,
        ease: easeInOut,
        duration: 0.3,
      },
    },
  };

  return (
    <MotionTag
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ display: "inline-flex", flexWrap: "wrap" }}
    >
      {text.split("").map((char, i) => {
        return (
          <motion.span key={i} variants={item}>
            {char === " " ? "\u00A0" : char}
          </motion.span>
        );
      })}
    </MotionTag>
  );
}
