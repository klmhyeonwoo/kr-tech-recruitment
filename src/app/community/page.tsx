import React, { Suspense } from "react";
import Title from "./_components/title";
import List from "./_components/list";
import styles from "@/styles/components/list.module.scss";

export default async function Page() {
  return (
    <main className={styles.page}>
      <Title
        title="아티클 · 커뮤니티"
        description="개발하며 겪은 일과 커리어 고민을 나눠 보세요."
      />
      <Suspense fallback={<p className={styles.loading}>글을 불러오고 있어요.</p>}>
        <List />
      </Suspense>
    </main>
  );
}
