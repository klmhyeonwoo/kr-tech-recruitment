import { Metadata } from "next";

export const metadata: Metadata = {
  title: "채용 공고",
  description:
    "네이버, 카카오, 라인, 쿠팡, 배달의민족 등 주요 IT 기업의 최신 채용 공고를 확인하세요. 신입부터 경력직까지 다양한 포지션의 채용 정보를 제공합니다.",
  keywords: [
    "채용 공고",
    "IT 채용",
    "개발자 채용",
    "신입 채용",
    "경력직 채용",
    "네카라쿠배 채용 공고",
  ],
  openGraph: {
    title: "네카라쿠배 - 채용 공고",
    description:
      "주요 IT 기업의 최신 채용 공고를 확인하세요. 신입부터 경력직까지 다양한 포지션 정보를 제공합니다.",
    type: "website",
    url: "https://nklcb.io/recruitment-notices",
  },
  twitter: {
    card: "summary_large_image",
    title: "네카라쿠배 - 채용 공고",
    description: "주요 IT 기업의 최신 채용 공고를 확인하세요",
  },
  alternates: {
    canonical: "https://nklcb.io/recruitment-notices",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>
      <div>{children}</div>
    </section>
  );
}
