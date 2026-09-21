import Link from "next/link";
import type { RecruitData } from "./Section";
import styles from "@/styles/components/announce-card.module.scss";

type AnnounceCardProps = {
  items: RecruitData[];
};

export default function AnnounceCard({
  items,
}: AnnounceCardProps) {

  return (
    <div className={styles.wrapper}>
      {items.length ? (
        <ul className={styles.list}>
          {items.map((item) => (
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
                <span className={styles.copy}>
                  <span className={styles.company}>
                    {item.corporates[0]?.corporateName ?? item.companyName}
                  </span>
                  <span className={styles.title}>{item.jobOfferTitle}</span>
                </span>
                <span className={styles.srOnly}>새 탭에서 공고 보기</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          지금은 보여드릴 공고가 없어요. 전체 공고에서 찾아보세요.
        </p>
      )}
      <Link href="/web" className={styles.more}>
        전체 공고 보기 <span aria-hidden="true">›</span>
      </Link>
    </div>
  );
}
