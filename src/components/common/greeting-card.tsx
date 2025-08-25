"use client";
import styles from "@/styles/components/greeting-apple-style-card.module.scss";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type GreetingCardProps = {
  title: string;
  subTitle: string;
  description: string;
  navigate?:
    | "web"
    | "channel-talk"
    | "community"
    | "not-yet"
    | "release-notes"
    | "question"
    | string;
  colorSet?: string[];
  image?: StaticImageData;
};

function GreetingCard({
  title,
  subTitle,
  description,
  navigate,
  colorSet = ["#FC466B", "#3F5EFB"],
  image,
}: GreetingCardProps) {
  const router = useRouter();
  const [firstColor, secondColor] = colorSet;

  const handleNavigate = () => {
    if (["web", "question"].includes(navigate!)) {
      router.replace(navigate!);
    } else if (navigate === "channel-talk") {
      window.open("https://6oo1v.channel.io/home", "_blank");
    } else if (navigate === "not-yet") {
      alert("아직 준비 중인 기능이에요.\n조금만 기다려 주세요.");
    } else if (navigate === "community") {
      router.replace("/community");
    } else if (navigate === "release-notes") {
      window.open(
        "https://github.com/klmhyeonwoo/awesome-dori/releases/",
        "_blank"
      );
    } else if (navigate) {
      window.open(navigate, "_blank");
    }
  };

  useEffect(() => {
    if (navigate && ["web", "question", "community"].includes(navigate)) {
      router.prefetch(`/${navigate}`);
    }
  }, [navigate, router]);

  return (
    <div
      className={styles.container}
      onClick={handleNavigate}
      style={{
        background: `linear-gradient(135deg, ${firstColor}, ${secondColor})`,
        cursor: `${navigate ? "pointer" : "default"}`,
      }}
    >
      <div className={styles.wave__background} />
      <Image
        src={image ?? ""}
        alt={title ? `${title} 이미지` : ""}
        className={styles.image__background}
        width={30}
        height={30}
      />
      <div className={styles.title__wrapper}>
        <span className={styles.greeting_sub_title}>{subTitle}</span>
        <span className={styles.greeting__title}>{title}</span>
      </div>
      <div className={styles.description__wrapper}>
        <span className={styles.greeting__description}>{description}</span>
      </div>
    </div>
  );
}

export default GreetingCard;
