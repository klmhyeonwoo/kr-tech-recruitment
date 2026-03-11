import Image from "next/image";
import Link from "next/link";
import icon_hands_pushing from "@public/icon/hands_pushing.gif";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <section className={styles.notFoundPage}>
      <div className={styles.card}>
        <span className={styles.code}>404</span>
        <h1>요청하신 페이지를 찾을 수 없어요</h1>
        <p>
          주소가 변경되었거나 삭제된 페이지일 수 있어요.
          <br />
          아래 메뉴로 이동해 필요한 정보를 바로 확인해보세요.
        </p>
        <Image
          src={icon_hands_pushing}
          width={90}
          height={90}
          alt="페이지를 찾을 수 없음"
        />
        <div className={styles.actions}>
          <Link href="/" className={`${styles.action} ${styles.primary}`}>
            메인으로 이동
          </Link>
          <Link href="/web" className={styles.action}>
            채용 공고 보기
          </Link>
          <Link href="/community" className={styles.action}>
            커뮤니티 가기
          </Link>
          <Link href="/remote-work-companies" className={styles.action}>
            원격 근무 회사 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
