import React from "react";
import styles from "@/styles/components/loading.module.scss";
import EyesLoading from "@/components/loading/eyes-loading";

interface LoadingProps {
  message?: string;
}

function Loading({
  message = "정보들을 열심히 가져오고 있어요",
}: LoadingProps) {
  return (
    <div className={styles.loading__container}>
      <EyesLoading />
      {message && <span> {message} </span>}
    </div>
  );
}

export default Loading;
