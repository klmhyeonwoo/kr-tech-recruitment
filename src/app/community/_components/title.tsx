import React from "react";
import styles from "@/styles/components/title.module.scss";

interface titleProps {
  title: string;
  description: string;
}

export default function Title({ title, description }: titleProps) {
  return (
    <div className={styles.title__container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
