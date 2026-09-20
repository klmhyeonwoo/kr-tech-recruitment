"use client";

import { useSetAtom } from "jotai";
import { PORTAL_STORE } from "@/store";
import styles from "./invitation.module.scss";

export default function SubscriptionInvitation() {
  const setIsShowPopup = useSetAtom(PORTAL_STORE);

  return (
    <section className={styles.invitation} aria-label="채용 소식 구독 안내">
      <div className={styles.copy}>
        <p className={styles.title}>채용 소식, 메일로 받아보세요</p>
        <p className={styles.description}>
          관심 있는 직무의 새 공고를 모아 보내드려요.
        </p>
      </div>
      <button
        className={styles.subscribe}
        type="button"
        onClick={() => setIsShowPopup(true)}
      >
        구독하기
      </button>
    </section>
  );
}
