import Link from "next/link";
import type { RecruitData } from "./Section";
import styles from "@/styles/components/announce-card.module.scss";

export default function AnnounceCard({ items }: { items: RecruitData[] }) {
  return (
    <div className={styles.wrapper}>
      {items.length ? (
        <ol className={styles.list}>
          {items.map((item, index) => (
            <li key={item.recruitmentNoticeId}>
              <Link
                href={`/recruitment-notices?${new URLSearchParams({
                  id: String(item.recruitmentNoticeId),
                  path: item.url,
                })}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.item}
              >
                <span className={styles.index} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.copy}>
                  <span className={styles.company}>
                    {item.corporates[0]?.corporateName ?? item.companyName}
                  </span>
                  <span className={styles.title}>{item.jobOfferTitle}</span>
                </span>
                <span className={styles.arrow} aria-hidden="true">
                  ↗
                </span>
                <span className={styles.srOnly}>새 탭에서 공고 보기</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>
          아직 표시할 공고가 없어요. 전체 공고에서 다른 기회를 찾아보세요.
        </p>
      )}
      <Link href="/web" className={styles.more}>
        전체 채용 공고 보기 <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
