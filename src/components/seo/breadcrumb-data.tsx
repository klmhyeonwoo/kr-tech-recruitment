import Script from "next/script";
import { safeJsonStringify } from "@/utils/seo";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbDataProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbData({ items }: BreadcrumbDataProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumbData) }}
    />
  );
}
