"use client";

import { useRouter } from "next/navigation";
import styles from "../page.module.scss";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

type Props = {
  pageSize: number;
  source?: string;
};

export default function PageSizeSelect({ pageSize, source }: Props) {
  const router = useRouter();

  return (
    <label className={styles.pageSizeLabel}>
      <span>페이지당 글 수</span>
      <select
        className={styles.pageSizeSelect}
        value={pageSize}
        onChange={(event) => {
          const params = new URLSearchParams();
          const nextPageSize = Number(event.target.value);
          if (nextPageSize !== 20) params.set("pageSize", String(nextPageSize));
          if (source) params.set("source", source);
          const query = params.toString();
          router.push(`/tech-articles${query ? `?${query}` : ""}`, {
            scroll: false,
          });
        }}
      >
        {PAGE_SIZE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}개
          </option>
        ))}
      </select>
    </label>
  );
}
