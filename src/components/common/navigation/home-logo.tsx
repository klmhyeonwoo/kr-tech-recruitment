"use client";
import Image from "next/image";
import React from "react";
import logo from "@public/images/logo.svg";
import { useRouter } from "next/navigation";

function HomeLogo() {
  const route = useRouter();
  const handleNavigate = () => {
    route.push("/");
  };
  return (
    <Image
      className="nklcb__logo"
      src={logo}
      alt="네카라쿠배 공고 서비스 공식 로고"
      layout="responsive"
      onClick={handleNavigate}
    />
  );
}

export default HomeLogo;
