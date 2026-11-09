import Link from "next/link";
import styles from "./site-footer.module.scss";

const LINKS = [
  { href: "/", label: "채용 공고" },
  { href: "/web", label: "기업별 채용" },
  { href: "/remote-work-companies", label: "원격근무 회사" },
  { href: "/dev-activities", label: "개발자 대외활동" },
  { href: "/interview-questions", label: "면접 준비" },
  { href: "/tech-articles", label: "테크 아티클" },
  { href: "/tech-trends", label: "개발 트렌드" },
  { href: "/community", label: "커뮤니티" },
  { href: "/question", label: "이번 주 질문" },
  { href: "/subscribe", label: "구독하기" },
] as const;

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.logo}>seoul dev club</span>
        <nav aria-label="전체 메뉴">
          <ul>
            {LINKS.map((link) => (
              <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
            ))}
          </ul>
        </nav>
        <p>공고 정보는 각 기업 채용 페이지 기준입니다.</p>
      </div>
    </footer>
  );
}
