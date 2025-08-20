"use client";
import React, { useEffect, useState } from "react";
import styles from "@/styles/components/user-status-block.module.scss";
import Avatar from "boring-avatars";
import kakao_image from "../../../public/images/kakao.png";
import Image from "next/image";
import {
  checkInitializedKakaoSDK,
  handleKakaoSocialLogin,
} from "@/utils/socialUtil";
import Cookies from "js-cookie";

const AVATAR_NAMES = [
  "Maya Angelou",
  "Elizabeth Peratrovich",
  "Alicia Dickerson",
  "Maud Nathan",
  "Susan B",
  "Mother Frances",
];

export default function UserStatusBlock() {
  const avatarName =
    AVATAR_NAMES[Math.floor(Math.random() * AVATAR_NAMES.length)];
  const [userName, setUserName] = useState("");
  const [isLogin, setLogin] = useState(false);

  useEffect(() => {
    setLogin(() => Cookies.get("nklcb__tk") !== undefined);
  }, []);

  useEffect(() => {
    checkInitializedKakaoSDK();
    if (isLogin) {
      (async () => {
        try {
          const response = await window.Kakao.API.request({
            url: "/v2/user/me",
          });
          setUserName(response.kakao_account.profile.nickname);
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          Cookies.remove("nklcb__tk");
          setLogin(false);
        }
      })();
    }
  }, [isLogin]);

  return (
    <div
      className={styles.user__status__container}
      data-login={isLogin}
      onClick={handleKakaoSocialLogin}
    >
      {isLogin ? (
        <Avatar
          name={avatarName}
          colors={["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"]}
          variant="beam"
          size={35}
        />
      ) : (
        <Image src={kakao_image} width={37} height={37} alt={""} />
      )}
      {isLogin
        ? `${userName}님, 반가워요!`
        : "카카오 로그인으로 커뮤니티 서비스 이용하기"}
    </div>
  );
}
