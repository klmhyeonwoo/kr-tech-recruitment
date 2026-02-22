import React from "react";
import styles from "@/styles/components/title.module.scss";

interface titleProps {
  title: string;
  description: string;
}

export default function Title({ title, description }: titleProps) {
  return (
    <div className={styles.title__container}>
      <span className={styles.title}>{title}</span>
      <span className={styles.description}>{description}</span>
    </div>
  );
}
