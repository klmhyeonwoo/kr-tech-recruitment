"use client";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import greeting_image_eyes from "@public/images/eyes.gif";
import greeting_image_waving from "@public/images/waving.gif";
import greeting_image_rocket from "@public/images/rocket.gif";
import greeting_image_popper from "@public/images/popper.gif";
import greeting_image_earth from "@public/images/earth.png";
import greeting_image_swimming from "@public/icon/swimming.gif";
import greeting_image_clapping from "@public/icon/clapping.gif";
import greeting_image_star from "@public/icon/star.gif";
import greeting_image_volt from "@public/images/volt.gif";
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
    description: "네카라쿠배 등의 빅테크 공고를 빠르게 확인할 수 있어요",
    href: "/web",
    icon: greeting_image_eyes,
  },
  {
    title: "재택 · 원격 회사",
    description: "재택 근무 가능 회사를 빠르게 모아볼 수 있어요",
    href: "/remote-work-companies",
    icon: greeting_image_swimming,
  },
  {
    title: "개발자 대외활동",
    description: "개발자를 위한 대외활동을 빠르게 확인해보세요",
    href: "/dev-activities",
    icon: greeting_image_clapping,
  },
  {
    title: "오늘의 개발 트렌드",
    description: "카테고리별 기술 스택 트렌드를 확인해보세요",
    href: "/tech-trends",
    icon: greeting_image_volt,
  },
  {
    title: "이번 주 질문에 답변하기",
    description: "다른 사람들은 어떤 생각들을 가지고 있을까요?",
    href: "/question",
    icon: greeting_image_popper,
  },
  {
    title: "커뮤니티",
    description: "나만의 정보들을 자유롭게 커뮤니티에서 나눠보세요",
    href: "/community",
    icon: greeting_image_earth,
  },
  {
    title: "서비스 문의",
    description: "서비스 피드백 · 문의는 언제나 환영해요",
    href: "https://6oo1v.channel.io/home",
    icon: greeting_image_waving,
    external: true,
  },
  {
    title: "릴리즈 노트",
    description: "최근 업데이트된 내용을 확인할 수 있어요",
    href: "https://github.com/klmhyeonwoo/awesome-dori/releases/",
    icon: greeting_image_rocket,
    external: true,
  },
  {
    title: "깃허브 스타 누르기",
    description: "스타는 개발자의 큰 힘이 되어요",
    href: "https://github.com/klmhyeonwoo/kr-tech-recruitment",
    icon: greeting_image_star,
    external: true,
  },
];

const MOBILE_VISIBLE_COUNT = 4;

function GreetingSwiper() {
  const [expanded, setExpanded] = useState(false);

  const renderMenuContent = (menu: QuickMenuItem) => (
    <>
      <div className={styles.menuText}>
        <span className={styles.menuTitle}>{menu.title}</span>
        <span className={styles.menuDescription}>{menu.description}</span>
      </div>
      <Image src={menu.icon} alt="" aria-hidden width={28} height={28} />
    </>
  );

  return (
    <section className={styles.quickMenu} aria-labelledby="quick-menu-title">
      <div className={styles.quickMenuHeader}>
        <h2 id="quick-menu-title">자주 찾는 기능</h2>
        <p>자주 찾는 기능으로 빠르게 서비스를 이용해보세요</p>
      </div>

      <ul
        className={`${styles.quickMenuList} ${!expanded ? styles.collapsed : ""}`}
      >
        {QUICK_MENUS.map((menu) => (
          <li key={menu.href}>
            {menu.external ? (
              <a href={menu.href} target="_blank" rel="noreferrer noopener">
                {renderMenuContent(menu)}
              </a>
            ) : (
              <Link href={menu.href}>{renderMenuContent(menu)}</Link>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        {expanded
          ? "접기"
          : `${QUICK_MENUS.length - MOBILE_VISIBLE_COUNT}개 더 보기`}
      </button>
    </section>
  );
}

export default GreetingSwiper;
