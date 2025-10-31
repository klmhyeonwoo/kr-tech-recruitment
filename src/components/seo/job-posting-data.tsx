import Script from "next/script";
import { safeJsonStringify } from "@/utils/seo";

interface JobPostingDataProps {
  title: string;
  description: string;
  company: string;
  location?: string;
  employmentType?: string;
  datePosted: string;
  validThrough?: string;
  url: string;
}

export default function JobPostingData({
  title,
  description,
  company,
  location = "대한민국",
  employmentType = "FULL_TIME",
  datePosted,
  validThrough,
  url,
}: JobPostingDataProps) {
  const jobPostingData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    hiringOrganization: {
      "@type": "Organization",
      name: company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "KR",
        addressRegion: location,
      },
    },
    employmentType,
    datePosted,
    ...(validThrough && { validThrough }),
    url,
  };

  return (
    <Script
      id="job-posting-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonStringify(jobPostingData) }}
    />
  );
}
