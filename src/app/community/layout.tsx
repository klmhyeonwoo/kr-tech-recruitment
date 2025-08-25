import "@/styles/domain/web.scss";
import { Metadata } from "next";
import React from "react";
import DefaultLayout from "../layout/DefaultLayout";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "커뮤니티",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
