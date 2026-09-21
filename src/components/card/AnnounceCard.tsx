import Link from "next/link";
import type { RecruitData } from "./Section";
import styles from "@/styles/components/announce-card.module.scss";

type AnnounceCardProps = {
  items: RecruitData[];
  showRank?: boolean;
};

export default function AnnounceCard({
  items,
  showRank = false,
}: AnnounceCardProps) {
  const List = showRank ? "ol" : "ul";

  return (
    <div className={styles.wrapper}>
      {items.length ? (
        <List className={styles.list}>
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
                {showRank && (
                  <span className={styles.index} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
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
        </List>
      ) : (
        <p className={styles.empty}>
          지금은 보여드릴 공고가 없어요. 전체 공고에서 찾아보세요.
        </p>
      )}
      <Link href="/web" className={styles.more}>
        전체 채용 공고 보기 <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
