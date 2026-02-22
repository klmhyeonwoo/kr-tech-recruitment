import "@/styles/domain/web.scss";
import { Metadata } from "next";
import React from "react";
import DefaultLayout from "@/components/layout/DefaultLayout";

export const metadata: Metadata = {
  title: "이번 주 질문",
  description:
    "이번 주 질문을 통해 여러분의 생각을 익명으로 나눠보세요. 다른 사람들의 의견도 확인할 수 있어요. IT 업계, 채용, 커리어에 대한 다양한 주제로 소통합니다.",
  keywords: [
    "네카라쿠배 질문",
    "IT 업계 질문",
    "개발자 설문",
    "취업 질문",
    "커리어 고민",
    "익명 질문",
  ],
  openGraph: {
    title: "네카라쿠배 - 이번 주 질문",
    description:
      "이번 주 질문을 통해 여러분의 생각을 익명으로 나눠보세요. 다른 사람들의 의견도 확인할 수 있어요.",
    type: "website",
    url: "https://nklcb.io/question",
  },
  twitter: {
    card: "summary_large_image",
    title: "네카라쿠배 - 이번 주 질문",
    description:
      "이번 주 질문을 통해 여러분의 생각을 익명으로 나눠보세요",
  },
  alternates: {
    canonical: "https://nklcb.io/question",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
