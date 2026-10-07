import React from "react";
import SocialLoading from "../social-loading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <SocialLoading />;
}
