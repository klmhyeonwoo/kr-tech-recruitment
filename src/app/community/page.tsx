import Title from "@/components/commnuity/title";
import UserStatusBlock from "@/components/commnuity/user-status-block";
import React, { Fragment } from "react";
import List from "@/components/commnuity/list";
import type { Metadata } from "next";
import { BASE_URL } from "@/utils/const";

export const metadata: Metadata = {
  title: "취준 · 취업 커뮤니티",
  description:
    "IT 기업 취업 준비생들을 위한 커뮤니티. 면접 후기, 채용 정보, 이직 노하우 등 다양한 취업 정보를 공유하세요.",
  keywords: [
    "IT 취업 커뮤니티",
    "개발자 커뮤니티",
    "네카라쿠배 커뮤니티",
    "취업 준비",
    "면접 후기",
    "이직 정보",
    "채용 정보",
    "개발자 취업",
  ],
  openGraph: {
    title: "취준 · 취업 커뮤니티 | 네카라쿠배 채용",
    description:
      "IT 기업 취업 준비생들을 위한 커뮤니티. 면접 후기, 채용 정보, 이직 노하우 등 다양한 취업 정보를 공유하세요.",
    url: `${BASE_URL}/community`,
    type: "website",
  },
  alternates: {
    canonical: `${BASE_URL}/community`,
  },
};

export default async function Page() {
  return (
    <Fragment>
      <Title
        title="취준 · 취업 커뮤니티"
        description="커뮤니티에서 여러분들의 고민과 노하우들을 자유롭게 이야기해보세요"
      />
      <UserStatusBlock />
      <List />
    </Fragment>
  );
}
