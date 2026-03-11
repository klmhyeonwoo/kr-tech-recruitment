"use client";
import React, { memo, useEffect, useState } from "react";
import styles from "@/styles/components/user-status-block.module.scss";
import kakao_image from "@public/images/kakao.webp";
import Image from "next/image";
import {
  checkInitializedKakaoSDK,
  handleKakaoSocialLogin,
} from "@/utils/socialUtil";
import Cookies from "js-cookie";
import user from "@/api/domain/user";
import UserAvatar from "./user-avatar";
import useUser from "@/hooks/common/useUser";

type UserStatusBlockProps = {
  className?: string;
  loginMessage?: string;
  showWhenLoggedIn?: boolean;
  compact?: boolean;
};

const UserStatusBlock = ({
  className,
  loginMessage = "카카오 로그인으로 커뮤니티 서비스 이용하기",
  showWhenLoggedIn = true,
  compact = false,
}: UserStatusBlockProps) => {
  const [userName, setUserName] = useState(Cookies.get("nklcb__nn") || "");
  const { isLogin, logout } = useUser();

  useEffect(() => {
    checkInitializedKakaoSDK();
  }, []);

  useEffect(() => {
    if (!isLogin || userName || !showWhenLoggedIn) {
      return;
    }

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
  }, [isLogin, logout, showWhenLoggedIn, userName]);

  if (isLogin && !showWhenLoggedIn) {
    return null;
  }

  const handleLogin = () => {
    handleKakaoSocialLogin();
  };

  if (!isLogin) {
    return (
      <button
        type="button"
        className={`${styles.user__status__container} ${className || ""}`.trim()}
        data-login={false}
        data-compact={compact}
        onClick={handleLogin}
      >
        <Image src={kakao_image} width={30} height={30} alt="카카오 로그인" />
        {loginMessage}
      </button>
    );
  }

  return (
    <div
      className={`${styles.user__status__container} ${className || ""}`.trim()}
      data-login
      data-compact={compact}
    >
      <UserAvatar size={35} />
      {userName ? `${userName}님, 반가워요!` : "반가워요!"}
    </div>
  );
};

export default memo(UserStatusBlock);
