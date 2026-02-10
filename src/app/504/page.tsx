"use client";
import Image from "next/image";
import Button from "@/components/common/button";
import Link from "next/link";
import icon_swimming from "../../../public/icon/swimming.gif";

export default function Page504() {
  return (
    <section className="error__section">
      <div className="error__content__container">
        <span>서버 점검 중입니다</span>
        <span>
          서버 이전 작업으로 인해 일시적으로 서비스를 이용할 수 없습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </span>
        <Image
          src={icon_swimming}
          width={90}
          height={90}
          alt="서버 점검 중"
        />
        <Link href={"/"}>
          <Button>메인 화면으로 돌아가기</Button>
        </Link>
      </div>
    </section>
  );
}
