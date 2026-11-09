import React from "react";
import styles from "@/styles/components/loading.module.scss";
import EyesLoading from "@/components/loading/eyes-loading";

interface LoadingProps {
  message?: string;
}

function Loading({
  message = "",
}: LoadingProps) {
  return (
    <div className={styles.loading__container}>
      <EyesLoading />
      {message && <span> {message} </span>}
    </div>
  );
}

export default Loading;
