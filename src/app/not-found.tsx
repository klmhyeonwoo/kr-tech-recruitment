"use client";
import Button from "@/components/common/button";
import icon_hands_pushing from "../../public/icon/hands_pushing.gif";
import Image from "next/image";
import React from "react";

function NotFound() {
  const handleNavigate = () => {
    window.location.href = "/";
  };

  return (
    <body>
      <section className="error__section">
        <Image
          src={icon_hands_pushing}
          width={90}
          height={90}
          alt="잘못된 요청을 했어요"
        />
        <div className="error__content__container">
          <span> 웁스, 잘못된 페이지로 접근했어요 </span>
          <Button onClick={handleNavigate}> 돌아가기 </Button>
        </div>
      </section>
    </body>
  );
}

export default NotFound;
