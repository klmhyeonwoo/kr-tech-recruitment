"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "nklcb:bookmarks";
const EVENT = "nklcb-bookmarks-change";
const EMPTY: number[] = [];
let cache: { raw: string | null; value: number[] } = { raw: null, value: EMPTY };

function read(): number[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    const parsed = raw ? JSON.parse(raw) : [];
    const value = Array.isArray(parsed) ? parsed.filter((id) => typeof id === "number") : EMPTY;
    cache = { raw, value };
    return value;
  } catch {
    return EMPTY;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

/** 북마크한 공고 id 를 브라우저(localStorage)에 저장합니다. 로그인 없이 쓸 수 있어요. */
export default function useBookmarks() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((id: number) => {
    const current = read();
    const next = current.includes(id) ? current.filter((value) => value !== id) : [id, ...current];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 저장소를 못 쓰는 환경에서는 조용히 넘어갑니다 */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { ids, toggle };
}
