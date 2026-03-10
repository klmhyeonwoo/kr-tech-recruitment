import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import greeting_image_eyes from "@public/images/eyes.gif";
import greeting_image_waving from "@public/images/waving.gif";
import greeting_image_rocket from "@public/images/rocket.gif";
import greeting_image_popper from "@public/images/popper.gif";
import greeting_image_earth from "@public/images/earth.png";
import greeting_image_swimming from "@public/icon/swimming.gif";
import styles from "./greeting-swiper.module.scss";

type QuickMenuItem = {
  title: string;
  description: string;
  href: string;
  icon: StaticImageData;
  external?: boolean;
};

const QUICK_MENUS: QuickMenuItem[] = [
  {
    title: "빅테크 공고",
    description: "기업별 채용 공고 확인",
    href: "/web",
    icon: greeting_image_eyes,
  },
  {
    title: "재택·원격 회사",
    description: "원격 근무 가능 회사 모음",
    href: "/remote-work-companies",
    icon: greeting_image_swimming,
  },
  {
    title: "취준 질문",
    description: "이번 주 질문 참여하기",
    href: "/question",
    icon: greeting_image_popper,
  },
  {
    title: "커뮤니티",
    description: "취업·이직 정보 나누기",
    href: "/community",
    icon: greeting_image_earth,
  },
  {
    title: "서비스 문의",
    description: "불편 사항 전달하기",
    href: "https://6oo1v.channel.io/home",
    icon: greeting_image_waving,
    external: true,
  },
  {
    title: "릴리즈 노트",
    description: "최근 업데이트 확인",
    href: "https://github.com/klmhyeonwoo/awesome-dori/releases/",
    icon: greeting_image_rocket,
    external: true,
  },
];

function GreetingSwiper() {
  return (
    <section className={styles.quickMenu} aria-labelledby="quick-menu-title">
      <div className={styles.quickMenuHeader}>
        <h2 id="quick-menu-title">퀵메뉴</h2>
        <p>자주 찾는 기능을 바로 이동해보세요.</p>
      </div>

      <ul className={styles.quickMenuList}>
        {QUICK_MENUS.map((menu) => (
          <li key={menu.href}>
            {menu.external ? (
              <a href={menu.href} target="_blank" rel="noreferrer noopener">
                <div className={styles.menuText}>
                  <span className={styles.menuTitle}>{menu.title}</span>
                  <span className={styles.menuDescription}>{menu.description}</span>
                </div>
                <Image src={menu.icon} alt="" aria-hidden width={28} height={28} />
              </a>
            ) : (
              <Link href={menu.href}>
                <div className={styles.menuText}>
                  <span className={styles.menuTitle}>{menu.title}</span>
                  <span className={styles.menuDescription}>{menu.description}</span>
                </div>
                <Image src={menu.icon} alt="" aria-hidden width={28} height={28} />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default GreetingSwiper;
