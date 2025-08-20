"use client";
import React, { useEffect } from "react";
import styles from "@/styles/components/loading.module.scss";
import EyesLoading from "@/components/loading/eyes-loading";
import social from "@/api/domain/social";
import { api } from "@/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { checkInitializedKakaoSDK } from "@/utils/socialUtil";

function SocialLoading() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const code = new URL(window.location.href).searchParams.get("code");
      if (code) {
        const { status, data } = await api.post(
          "https://kauth.kakao.com/oauth/token",
          {
            grant_type: "authorization_code",
            client_id: process.env.NEXT_KAKAO_JAVASCRIPT_KEY,
            redirect_uri: "http://localhost:3000/auth",
            code,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        if (status === 200) {
          checkInitializedKakaoSDK();
          const { access_token } = data;
          window.Kakao.Auth.setAccessToken(access_token);
          const response = await social.kakao({ token: access_token });
          Cookies.set("nklcb__tk", response.data.accessToken);
          router.replace("/community");
        }
      }
    })();
  }, []);

  return (
    <div className={styles.loading__container}>
      <EyesLoading />
      <span> 카카오로 로그인 중... </span>
    </div>
  );
}

export default SocialLoading;
