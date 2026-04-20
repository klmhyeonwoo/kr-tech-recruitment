import Image from "next/image";
import React from "react";
import Button from "../button";
import Link from "next/link";
import icon_hands_pushing from "@public/icon/hands_pushing.gif";

interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <section className="error__section">
      <div className="error__content__container">
        <span> {message || "페이지를 찾을 수 없어요"} </span>
        <Image
          src={icon_hands_pushing}
          width={90}
          height={90}
          alt=""
          aria-hidden="true"
        />
        <Link href={"/"}>
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </section>
  );
}
