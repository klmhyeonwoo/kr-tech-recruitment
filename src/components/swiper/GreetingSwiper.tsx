import Link from "next/link";
import styles from "./greeting-swiper.module.scss";

const CAREER_DESTINATIONS = [
  {
    title: "재택·원격 회사",
    description: "유연한 근무 환경",
    href: "/remote-work-companies",
  },
  {
    title: "개발자 대외활동",
    description: "함께 성장하는 경험",
    href: "/dev-activities",
  },
  {
    title: "기술 면접 준비",
    description: "질문으로 다지는 실력",
    href: "/interview-questions",
  },
  {
    title: "개발 트렌드",
    description: "지금 주목받는 기술",
    href: "/tech-trends",
  },
];

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.5 8h9m-4-4 4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function GreetingSwiper() {
  return (
    <section className={styles.hero} aria-labelledby="quick-menu-title">
      <div className={styles.introduction}>
        <p className={styles.eyebrow}>개발자를 위한 커리어 가이드</p>
        <h1 id="quick-menu-title">다음 기회를 찾는 곳</h1>
        <p className={styles.description}>
          채용 공고부터 기술 질문까지, 필요한 정보를 한곳에서.
        </p>
        <Link href="/web" className={styles.primaryLink}>
          채용 공고 둘러보기
          <ArrowIcon />
        </Link>
      </div>

      <nav aria-label="커리어 탐색">
        <ul className={styles.destinations}>
          {CAREER_DESTINATIONS.map((destination) => (
            <li key={destination.href}>
              <Link href={destination.href} className={styles.destinationLink}>
                <span className={styles.destinationHeading}>
                  <span className={styles.destinationTitle}>
                    {destination.title}
                  </span>
                  <ArrowIcon />
                </span>
                <span className={styles.destinationDescription}>
                  {destination.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
