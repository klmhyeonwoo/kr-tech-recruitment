import Header from "@/components/common/header";
import "@/styles/domain/web.scss";
import { Metadata } from "next";
import React, { Fragment } from "react";

export const metadata: Metadata = {
  title: "이번 질문 답변하기",
  description:
    "이번 주 질문을 통해 여러분의 생각을 익명으로 나눠보세요. 다른 사람들의 의견도 확인할 수 있어요.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      <Header />
      <section>
        <article className="content-wrapper">
          <div> {children} </div>
        </article>
      </section>
    </Fragment>
  );
}
