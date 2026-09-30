import type { Metadata } from "next";
import DefaultLayout from "@/components/layout/DefaultLayout";
import SubscribeButton from "./_components/SubscribeButton";
import styles from "./page.module.scss";
import "@/styles/domain/web.scss";

export const metadata: Metadata = {
  title: "서울데브클럽 구독하기",
  description: "네카라쿠배 채용 소식과 서울데브클럽의 새 소식을 이메일로 받아보세요.",
  alternates: { canonical: "https://nklcb.kr/subscribe" },
};

export default function SubscribePage() {
  return (
    <DefaultLayout>
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="subscribe-title">
          <h1 id="subscribe-title">관심 있는 채용 소식만,<br />메일로 받아보세요.</h1>
          <p className={styles.lead}>
            네카라쿠배 채용 공고와 서울데브클럽 소식을 전해드려요.
          </p>
          <SubscribeButton />
        </section>
      </main>
    </DefaultLayout>
  );
}
