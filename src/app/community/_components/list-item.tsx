import styles from "@/styles/components/list.module.scss";
import Link from "next/link";

const dateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

interface ListItemProps {
  id: number;
  title: string;
  content: string;
  writer: string;
  date: string;
  commentCount: number;
  likeCount: number;
}

export default function ListItem({
  id,
  title,
  content,
  writer,
  date,
  commentCount,
  likeCount,
}: ListItemProps) {
  const createdAt = new Date(date);

  return (
    <Link className={styles.item} href={`/community/detail/${id}`}>
      <h3 className={styles.itemTitle}>{title}</h3>
      {content && <p className={styles.itemExcerpt}>{content}</p>}
      <div className={styles.itemMeta}>
        <span className={styles.itemAuthor}>
          {writer} <span aria-hidden="true">·</span>{" "}
          <time
            dateTime={date}
            title={createdAt.toLocaleString("ko-KR", {
              ...dateOptions,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          >
            {createdAt.toLocaleDateString("ko-KR", dateOptions)}
          </time>
        </span>
        <span className={styles.itemReactions}>
          <span>댓글 {commentCount}</span>
          <span>좋아요 {likeCount}</span>
        </span>
      </div>
    </Link>
  );
}
