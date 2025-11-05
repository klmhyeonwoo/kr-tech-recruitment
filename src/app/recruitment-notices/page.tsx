import { api } from "@/api";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import StructuredData from "@/components/seo/structured-data";
import { Suspense } from "react";

// Default validity period for job postings (90 days in milliseconds)
const DEFAULT_JOB_VALIDITY_DAYS = 90;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

interface RecruitmentNoticeData {
  recruitmentNoticeId: number;
  jobOfferTitle: string;
  companyName: string;
  corporates?: Array<{
    corporateName: string;
    corporateCode: string;
  }>;
  categories?: string[];
  startAt?: string;
  endAt?: string;
  url: string;
}

async function getRecruitmentInfo({
  id,
}: {
  id: number;
}): Promise<{ status: number; data?: RecruitmentNoticeData }> {
  try {
    const response = await api.get(`/recruitment-notices/${id}`);
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch recruitment info:", error);
    return { status: 500 };
  }
}

async function trackClick({ id }: { id: number }): Promise<void> {
  try {
    await api.post(`/recruitment-notices/${id}/click`);
  } catch (error) {
    // Intentionally silent: Click tracking failures should not impact user experience
    console.error("Failed to track click:", error);
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id: number; path: string }>;
}): Promise<Metadata> {
  const { id } = await searchParams;
  
  if (!id) {
    return {
      title: "채용 공고",
      description: "채용 공고를 확인하세요",
    };
  }

  const { data } = await getRecruitmentInfo({ id });
  
  if (!data) {
    return {
      title: "채용 공고",
      description: "채용 공고를 확인하세요",
    };
  }

  const companyName = data.corporates?.[0]?.corporateName || data.companyName || "회사";
  const jobTitle = data.jobOfferTitle || "채용 공고";
  const categories = data.categories?.join(", ") || "";
  const description = `${companyName}의 ${jobTitle} 채용 공고입니다. ${categories ? `직무: ${categories}` : ""} 지금 바로 지원하세요!`;

  return {
    title: `${companyName} - ${jobTitle}`,
    description,
    keywords: [
      `${companyName} 채용`,
      `${companyName} 공고`,
      jobTitle,
      ...categories.split(", ").filter(Boolean),
      "IT 채용",
      "개발자 채용",
      "네카라쿠배 채용",
    ],
    openGraph: {
      title: `${companyName} - ${jobTitle}`,
      description,
      type: "website",
      url: `https://nklcb.kr/recruitment-notices?id=${id}`,
      siteName: "네카라쿠배 채용",
      images: [
        {
          url: "https://raw.githubusercontent.com/klmhyeonwoo/Asset-Archieve./main/nklcb.png",
          width: 1200,
          height: 630,
          alt: `${companyName} 채용 공고`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} - ${jobTitle}`,
      description,
    },
    alternates: {
      canonical: `https://nklcb.kr/recruitment-notices?id=${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function RedirectScript({ url }: { url: string }) {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${url}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "${url}";`,
        }}
      />
    </>
  );
}

async function RecruitmentContent({
  id,
  path,
}: {
  id: number;
  path: string;
}) {
  const { status, data } = await getRecruitmentInfo({ id });

  if (status === 500 || !data) {
    return redirect("/error");
  }

  // Track the click asynchronously - errors are logged but don't affect user flow
  trackClick({ id }).catch((error) => {
    console.error("Click tracking failed:", error);
  });

  const companyName = data.corporates?.[0]?.corporateName || data.companyName || "회사";
  const jobTitle = data.jobOfferTitle || "채용 공고";
  const decodedUrl = atob(path);

  // Calculate default end date (90 days from now)
  const defaultEndDate = new Date(Date.now() + (DEFAULT_JOB_VALIDITY_DAYS * MILLISECONDS_PER_DAY));

  // Create JobPosting structured data for Google
  const jobPostingData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: jobTitle,
    description: `${companyName}에서 ${jobTitle} 포지션을 채용합니다.`,
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "KR",
      },
    },
    datePosted: data.startAt || new Date().toISOString(),
    validThrough: data.endAt || defaultEndDate.toISOString(),
    employmentType: data.categories?.includes("인턴") ? "INTERN" : "FULL_TIME",
    url: decodedUrl,
    directApply: true,
  };

  return (
    <>
      <StructuredData data={jobPostingData} />
      <RedirectScript url={decodedUrl} />
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>{companyName} - {jobTitle}</h1>
        <p>채용 공고 페이지로 이동 중입니다...</p>
        <p>
          자동으로 이동하지 않으면{" "}
          <a href={decodedUrl} style={{ color: "blue", textDecoration: "underline" }}>
            여기를 클릭하세요
          </a>
        </p>
      </div>
    </>
  );
}

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id: number; path: string }>;
}) {
  const { id, path } = await searchParams;

  if (!id || !path) {
    return redirect("/error");
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecruitmentContent id={id} path={path} />
    </Suspense>
  );
}

export default Page;
