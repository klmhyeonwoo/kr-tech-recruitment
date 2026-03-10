"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import inputStyles from "@/styles/components/input.module.scss";

const SEARCH_DEBOUNCE_MS = 300;

type RemoteWorkSearchInputProps = {
  initialQuery: string;
};

export default function RemoteWorkSearchInput({
  initialQuery,
}: RemoteWorkSearchInputProps) {
  const [keyword, setKeyword] = useState(initialQuery);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setKeyword(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const trimmedKeyword = keyword.trim();
      const params = new URLSearchParams(searchParams.toString());

      if (trimmedKeyword) {
        params.set("q", trimmedKeyword);
      } else {
        params.delete("q");
      }

      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentQuery = searchParams.toString();
      const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

      if (nextUrl === currentUrl) {
        return;
      }

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [keyword, pathname, router, searchParams, startTransition]);

  return (
    <div className={inputStyles.input__section}>
      <div className={inputStyles.input__box}>
        <input
          type="search"
          name="q"
          placeholder="회사명/근무조건 검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          aria-label="회사명 또는 근무 조건 검색"
        />
      </div>
    </div>
  );
}
