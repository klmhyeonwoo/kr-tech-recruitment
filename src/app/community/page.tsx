import React, { Suspense } from "react";
import Title from "./_components/title";
import List from "./_components/list";
import styles from "@/styles/components/list.module.scss";

export default async function Page() {
  return (
    <main className={styles.page}>
      <Title
        title="개발 이야기를 나누는 곳"
        description="막힌 문제, 커리어의 선택, 프로젝트에서 배운 것을 편하게 남겨보세요."
      />
      <Suspense fallback={<p className={styles.loading}>글을 불러오고 있어요.</p>}>
        <List />
      </Suspense>
    </main>
  );
}
