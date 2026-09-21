import Link from "next/link";
import styles from "./main-community-list-item.module.scss";

interface MainCommunityListItemProps {
  id: number;
  title: string;
  writer: string;
  date: string;
}

export default function MainCommunityListItem({
  id,
  title,
  writer,
  date,
}: MainCommunityListItemProps) {
  return (
    <Link className={styles.item} href={`/community/detail/${id}`}>
      <div className={styles.text__wrapper}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>
          {writer} · <time dateTime={date}>
            {new Date(date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "Asia/Seoul",
            })}
          </time>
        </span>
      </div>
    </Link>
  );
}
