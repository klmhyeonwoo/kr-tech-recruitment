import "@/styles/domain/web.scss";
import { Metadata } from "next";
import React from "react";
import DefaultLayout from "../layout/DefaultLayout";

export const metadata: Metadata = {
  title: "커뮤니티",
  description:
    "네카라쿠배 커뮤니티에서 IT 기업 채용 정보와 취업 팁을 공유하고, 다른 구직자들과 소통하세요. 익명으로 자유롭게 의견을 나눌 수 있습니다.",
  keywords: [
    "네카라쿠배 커뮤니티",
    "IT 채용 커뮤니티",
    "개발자 커뮤니티",
    "취업 정보 공유",
    "채용 공고 토론",
    "IT 기업 정보",
  ],
  openGraph: {
    title: "네카라쿠배 커뮤니티",
    description:
      "IT 기업 채용 정보와 취업 팁을 공유하고, 다른 구직자들과 소통하세요",
    type: "website",
    url: "https://nklcb.io/community",
  },
  twitter: {
    card: "summary_large_image",
    title: "네카라쿠배 커뮤니티",
    description:
      "IT 기업 채용 정보와 취업 팁을 공유하고, 다른 구직자들과 소통하세요",
  },
  alternates: {
    canonical: "https://nklcb.io/community",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
