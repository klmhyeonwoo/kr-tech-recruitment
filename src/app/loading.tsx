import React from "react";
import styles from "@/styles/components/loading.module.scss";
import EyesLoading from "@/components/loading/eyes-loading";

function Loading() {
  return (
    <div className={styles.loading__container}>
      <EyesLoading />
      <span> 데이터를 가져오고 있어요 </span>
    </div>
  );
}

export default Loading;
