import Link from "next/link";
import BoardInfo from "@/app/community/_components/board-info";
import dateUtil from "@/utils/dateUtil";
import styles from "./main-community-list-item.module.scss";

interface MainCommunityListItemProps {
  id: number;
  title: string;
  writer: string;
  date: string;
  commentCount: number;
  likeCount: number;
}

export default function MainCommunityListItem({
  id,
  title,
  writer,
  date,
  commentCount,
  likeCount,
}: MainCommunityListItemProps) {
  return (
    <Link className={styles.item} href={`/community/detail/${id}`}>
      <div className={styles.text__wrapper}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>
          {writer} · {dateUtil.formattedDate(date)}
        </span>
      </div>
      <BoardInfo commentCount={commentCount} likeCount={likeCount} />
    </Link>
  );
}

