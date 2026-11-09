"use client";

import { useState } from "react";
import Image from "next/image";
import { scaledPositionName } from "@/utils/common";
import { companyLogo } from "@/utils/company-logo";
import { careerTag, companyLabel, deadlineOf, jobHref, periodLabel, type JobItem } from "@/utils/jobs";
import styles from "./job-card.module.scss";

type Props = {
  item: JobItem;
  bookmarked: boolean;
  onToggleBookmark: (id: number) => void;
};

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V4M8 8l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" />
    </svg>
  );
}

/** 공고 한 건. KREAM 상품 카드처럼 위에는 회사 로고 썸네일, 아래에는 회사명·제목·기간을 보여줘요. */
export default function JobCard({ item, bookmarked, onToggleBookmark }: Props) {
  const [copied, setCopied] = useState(false);
  const company = companyLabel(item);
  const logo = companyLogo(item.companyCode);
  const deadline = deadlineOf(item.endAt);
  const period = periodLabel(item.startAt, item.endAt);
  const position = item.standardCategory ? scaledPositionName(item.standardCategory) : "";
  const career = careerTag(item.jobOfferTitle);
  const meta = [career, position].filter(Boolean).join(" · ");
  const href = jobHref(item);
  const footnote = [period, item.clickCount > 0 ? `조회 ${item.clickCount.toLocaleString("ko-KR")}` : ""].filter(Boolean).join(" · ");

  async function share() {
    const url = `${window.location.origin}${href}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: `${company} 채용 공고`, text: item.jobOfferTitle, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      window.prompt("링크를 복사해 주세요.", url);
    }
  }

  return (
    <article className={styles.card} data-closed={deadline.tone === "closed"}>
      <div className={styles.thumb}>
        {logo ? (
          <Image src={logo} alt="" width={112} height={40} className={styles.logo} unoptimized />
        ) : (
          <span className={styles.initial} aria-hidden="true">{company.slice(0, 1)}</span>
        )}
        <span className={styles.deadline} data-tone={deadline.tone} suppressHydrationWarning>{deadline.label}</span>
        <div className={styles.actions}>
          <button type="button" className={styles.iconButton} onClick={share}
            aria-label={`${company} 공고 링크 공유하기`} title="링크 공유">
            <ShareIcon />
          </button>
          <button type="button" className={styles.iconButton} data-on={bookmarked}
            aria-pressed={bookmarked} onClick={() => onToggleBookmark(item.recruitmentNoticeId)}
            aria-label={`${company} 공고 북마크`} title={bookmarked ? "북마크 해제" : "북마크"}>
            <BookmarkIcon filled={bookmarked} />
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <p className={styles.company}>{company}</p>
        <h3 className={styles.title}>
          <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {item.jobOfferTitle}
            <span className="sr-only"> (새 탭에서 열림)</span>
          </a>
        </h3>
        {meta && <p className={styles.meta}>{meta}</p>}
        {footnote && <p className={styles.period}>{footnote}</p>}
      </div>
      <span className={styles.toast} role="status">{copied ? "링크를 복사했어요" : ""}</span>
    </article>
  );
}
