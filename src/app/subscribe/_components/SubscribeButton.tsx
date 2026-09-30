"use client";

import { useSetAtom } from "jotai";
import { PORTAL_STORE } from "@/store";
import styles from "../page.module.scss";

export default function SubscribeButton() {
  const setIsShowPopup = useSetAtom(PORTAL_STORE);
  return (
    <button className={styles.cta} type="button" onClick={() => setIsShowPopup(true)}>
      구독하기
    </button>
  );
}
