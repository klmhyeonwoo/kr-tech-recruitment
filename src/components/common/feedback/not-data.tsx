import React from "react";
import Image from "next/image";
import icon_swimming from "@public/icon/swimming.gif";
import "@/styles/common.scss";

function NotDataSwimming({
  description = "웁스, 해당 기업의 공고가 존재하지 않아요",
}: {
  description?: string;
}) {
  return (
    <div className="not__data">
      <Image
        src={icon_swimming}
        width={120}
        height={120}
        alt="해딩 기업의 공고가 존재하지 않아요"
      />
      <span> {description} </span>
    </div>
  );
}

export default NotDataSwimming;
