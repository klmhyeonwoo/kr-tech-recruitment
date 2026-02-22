"use client";
import React, { memo, useEffect, useState } from "react";
import styles from "@/styles/components/user-status-block.module.scss";
import kakao_image from "@public/images/kakao.png";
import Image from "next/image";
import {
  checkInitializedKakaoSDK,
  handleKakaoSocialLogin,
} from "@/utils/socialUtil";
import Cookies from "js-cookie";
import user from "@/api/domain/user";
import UserAvatar from "./user-avatar";
import useUser from "@/hooks/common/useUser";

const UserStatusBlock = () => {
  const [userName, setUserName] = useState(Cookies.get("nklcb__nn") || "");
  const { isLogin, logout } = useUser();

  useEffect(() => {
    checkInitializedKakaoSDK();
    if (isLogin) {
      (async () => {
        try {
          await window.Kakao.API.request({
            url: "/v2/user/me",
          });
          const { status, data } = await user.userInfo();
          if (status === 200) {
            setUserName(data.nickname);
            Cookies.set("nklcb__un", data.id);
            Cookies.set("nklcb__nn", data.nickname);
          }
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          logout();
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
        <UserAvatar size={35} />
      ) : (
        <Image src={kakao_image} width={37} height={37} alt={""} />
      )}
      {isLogin && userName
        ? `${userName}님, 반가워요!`
        : "카카오 로그인으로 커뮤니티 서비스 이용하기"}
    </div>
  );
};

export default memo(UserStatusBlock);
