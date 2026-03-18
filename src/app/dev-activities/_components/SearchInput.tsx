"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import inputStyles from "@/styles/components/input.module.scss";

const SEARCH_DEBOUNCE_MS = 300;

type SearchInputProps = {
  initialQuery: string;
};

export default function SearchInput({ initialQuery }: SearchInputProps) {
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
          placeholder="ex. SOPT, 부트캠프, 모임"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          aria-label="동아리, 교육, 모임 검색"
        />
      </div>
    </div>
  );
}
