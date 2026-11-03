import type { Metadata } from "next";
import { companyUrl, DEFAULT_COMPANY_CODE } from "@/lib/seo/companies";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const baseMetaData = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "서울데브클럽 - 한국 개발자를 위한 유용한 모든 정보",
    template: "%s | 서울데브클럽",
  },
  description:
    "네이버 채용, 카카오 채용, 라인 채용, 쿠팡 채용, 배달의 민족 채용, 당근 채용, 토스 채용 정보를 한눈에! 네이버, 카카오, 라인, 쿠팡, 배달의민족, 토스, 당근, 두나무 등 대한민국 대표 IT 기업의 최신 채용 공고를 실시간으로 확인하고 지원하세요.",
  keywords: [
    "네카라쿠배 채용",
    "nklcb 채용",
    "네이버 채용",
    "카카오 채용",
    "라인 채용",
    "쿠팡 채용",
    "우아한형제들 채용",
    "배달의민족 채용",
    "당근 채용",
    "토스 채용",
    "두나무 채용",
    "야놀자 채용",
    "삼성전자 채용",
    "LG전자 채용",
    "현대오토에버 채용",
    "SK하이닉스 채용",
    "엔씨소프트 채용",
    "넷마블 채용",
    "크래프톤 채용",
    "컴투스 채용",
    "넥슨 채용",
    "카카오뱅크 채용",
    "카카오페이 채용",
    "카카오게임즈 채용",
    "네이버파이낸셜 채용",
    "네이버웹툰 채용",
    "라인플러스 채용",
    "빗썸 채용",
    "업비트 채용",
    "한국거래소 채용",
    "프론트엔드 채용",
    "백엔드 채용",
    "풀스택 개발자 채용",
    "모바일 개발자 채용",
    "UI/UX 디자이너 채용",
    "그래픽 디자이너 채용",
    "데이터 분석가 채용",
    "AI 엔지니어 채용",
    "머신러닝 엔지니어 채용",
    "서비스 기획 채용",
    "프로덕트 매니저 채용",
    "프로젝트 매니저 채용",
    "신입 공개 채용",
    "경력직 공개 채용",
    "네카라쿠배 수시 채용",
    "IT 기업 수시 채용",
    "네카라쿠배 인턴 채용",
    "IT 기업 인턴십",
    "원격 근무 채용",
    "재택 근무 가능 채용",
    "2025 개발자 채용",
    "IT 채용 트렌드",
    "네카라쿠배 채용 공고",
    "네카라쿠배 공고",
    "블록체인 개발자 채용",
    "AI 스타트업 채용",
    "IT 대기업 채용",
    "빅테크 채용",
    "테크 기업 채용",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/favicon.svg",
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "서울 디벨로퍼 클럽 - IT 기업 채용정보 플랫폼",
    description:
      "네이버 채용, 카카오 채용, 라인 채용, 쿠팡 채용, 배달의 민족 채용, 당근 채용, 토스 채용 정보를 한눈에! 네이버, 카카오, 라인, 쿠팡, 배달의민족, 토스, 당근, 두나무 등 대한민국 대표 IT 기업의 최신 채용 공고를 실시간으로 확인하고 지원하세요.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "네카라쿠배 채용 플랫폼",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "서울 디벨로퍼 클럽 - IT 기업 채용정보 플랫폼",
    description:
      "네이버 채용, 카카오 채용, 라인 채용, 쿠팡 채용, 배달의 민족 채용, 당근 채용, 토스 채용 정보를 한눈에! 네이버, 카카오, 라인, 쿠팡, 배달의민족, 토스, 당근, 두나무 등 대한민국 대표 IT 기업의 최신 채용 공고를 실시간으로 확인하고 지원하세요.",
    images: [
      OG_IMAGE,
    ],
  },
};

export default function generateServiceOpenGraph({
  companyName,
  companyCode = DEFAULT_COMPANY_CODE,
}: {
  companyName: string;
  companyCode?: string;
}): Metadata {
  const title = `${companyName} 채용 공고`;
  const description = `${companyName} 채용 공고를 직무별로 살펴보고 공고 제목과 모집 기간을 확인하세요. 관심 있는 공고에서 원문으로 이동해 지원 자격과 전형 절차를 확인할 수 있습니다.`;
  const url = companyUrl(companyCode);

  return {
    title,
    description,
    keywords: [`${companyName} 채용`, `${companyName} 채용 공고`, "개발자 채용"],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "ko_KR",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}
