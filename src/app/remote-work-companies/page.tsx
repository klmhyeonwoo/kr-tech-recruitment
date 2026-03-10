import type { Metadata } from "next";
import Link from "next/link";
import DefaultLayout from "@/components/layout/DefaultLayout";
import StructuredData from "@/lib/seo/structured-data";
import remoteCompaniesData from "@/data/remote-work-companies.kr.json";
import UserAds from "@/components/ads/user-ads";
import RemoteWorkSearchInput from "./_components/RemoteWorkSearchInput";
import type {
  FilterType,
  RemoteCategory,
  RemoteCompany,
} from "./_components/types";
import styles from "./page.module.scss";
import tabStyles from "@/styles/components/tab.module.scss";
import "@/styles/domain/web.scss";

type PageSearchParams = {
  type?: string;
  q?: string;
};

type PageProps = {
  searchParams: Promise<PageSearchParams>;
};

const CATEGORY_LABEL: Record<RemoteCategory, string> = {
  full: "완전 원격",
  partial: "부분 원격",
  none: "원격 불가",
  unknown: "미정",
};

const CATEGORY_PRIORITY: Record<RemoteCategory, number> = {
  full: 0,
  partial: 1,
  none: 2,
  unknown: 3,
};

const allCompanies = (remoteCompaniesData.companies as RemoteCompany[])
  .filter((company) => company.isRemotePossible)
  .sort((a, b) => {
    const categoryDiff =
      CATEGORY_PRIORITY[a.remoteCategory] - CATEGORY_PRIORITY[b.remoteCategory];

    if (categoryDiff !== 0) {
      return categoryDiff;
    }

    return a.companyName.localeCompare(b.companyName, "ko");
  });

const summary = {
  total: allCompanies.length,
  fullRemoteCount: allCompanies.filter(
    (company) => company.remoteCategory === "full",
  ).length,
  partialRemoteCount: allCompanies.filter(
    (company) => company.remoteCategory === "partial",
  ).length,
};

const normalizeFilterType = (type?: string): FilterType => {
  if (type === "full" || type === "partial") {
    return type;
  }

  return "all";
};

const normalizeQuery = (query?: string) => query?.trim() ?? "";

const formatPolicyText = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "-";
  }

  if (/^[oO](\s|$|[(/,])/u.test(trimmed)) {
    return trimmed.replace(/^[oO]/u, "운영 중");
  }

  if (/^[xX](\s|$|[(/,])/u.test(trimmed)) {
    return trimmed.replace(/^[xX]/u, "미운영");
  }

  return trimmed;
};

const buildFilterHref = (type: FilterType, query: string) => {
  const params = new URLSearchParams();

  if (type !== "all") {
    params.set("type", type);
  }

  if (query) {
    params.set("q", query);
  }

  const search = params.toString();
  return `/remote-work-companies${search ? `?${search}` : ""}`;
};

export const metadata: Metadata = {
  title: "재택 근무 가능 회사 모음",
  description:
    "한국의 재택/원격 근무 가능 회사를 한 곳에서 확인하세요. 완전 원격, 부분 원격 회사 정보를 빠르게 필터링할 수 있습니다.",
  openGraph: {
    title: "재택 근무 가능 회사 모음",
    description:
      "완전 원격 및 부분 원격이 가능한 국내 회사 목록을 확인해보세요.",
    type: "website",
    url: "https://nklcb.kr/remote-work-companies",
  },
  twitter: {
    card: "summary_large_image",
    title: "재택 근무 가능 회사 모음",
    description:
      "완전 원격 및 부분 원격이 가능한 국내 회사 목록을 확인해보세요.",
  },
  alternates: {
    canonical: "https://nklcb.kr/remote-work-companies",
  },
};

export const revalidate = 86400;

export default async function RemoteWorkCompaniesPage({
  searchParams,
}: PageProps) {
  const { type, q } = await searchParams;
  const filterType = normalizeFilterType(type);
  const query = normalizeQuery(q);
  const normalizedQuery = query.toLowerCase();

  const filteredCompanies = allCompanies.filter((company) => {
    const filterMatched =
      filterType === "all" ? true : company.remoteCategory === filterType;

    if (!filterMatched) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [company.companyName, company.flexibleWork, company.remoteWork].some(
      (field) => field.toLowerCase().includes(normalizedQuery),
    );
  });

  const pageQuery = new URLSearchParams();
  if (filterType !== "all") pageQuery.set("type", filterType);
  if (query) pageQuery.set("q", query);
  const pageUrl = `https://nklcb.kr/remote-work-companies${
    pageQuery.toString() ? `?${pageQuery.toString()}` : ""
  }`;

  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "재택 근무 가능 회사 모음",
    description: "한국의 재택/원격 근무 가능 회사 정보를 모아둔 컬렉션 페이지",
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: filteredCompanies.length,
      itemListElement: filteredCompanies.slice(0, 50).map((company, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: company.companyName,
        url: company.links[0]?.url ?? pageUrl,
      })),
    },
  };

  return (
    <DefaultLayout>
      <StructuredData
        id={`structured-data-remote-work-companies-${filterType}`}
        data={collectionStructuredData}
      />
      <main className={styles.page}>
        <section className={styles.sourceNotice}>
          <a
            href="https://github.com/milooy/remote-or-flexible-work-company-in-korea/blob/master/README.md"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="원본 GitHub 저장소 README 보기"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.95-3.19.69-3.86-1.54-3.86-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.14 1.17a10.9 10.9 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.59.23 2.76.11 3.05.73.8 1.18 1.82 1.18 3.07 0 4.41-2.68 5.38-5.24 5.66.41.35.77 1.03.77 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.21.66.79.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            깃허브에서 가져온 정보예요
          </a>
          <p>
            최신화된 정보가 아닐 수 있어 참고 용으로 확인해주세요. 정확한 정보가
            아닌 경우가 있습니다.
          </p>
        </section>
        <UserAds />
        <section className={styles.intro}>
          <div>
            <h1 className="title">재택 근무 가능 회사 모음</h1>
            <p className="description">
              공개된 회사의 재택 · 원격 근무 가능 회사를 빠르게 확인할 수
              있어요.
            </p>
          </div>
          <p className={styles.summaryText}>
            전체 {summary.total}개 · 완전 원격 {summary.fullRemoteCount}개 ·
            부분 원격 {summary.partialRemoteCount}개
          </p>
        </section>

        <section className={styles.controls}>
          <div className={tabStyles.tab__container}>
            {(
              [
                { key: "all", label: `전체 (${summary.total})` },
                {
                  key: "full",
                  label: `완전 원격 (${summary.fullRemoteCount})`,
                },
                {
                  key: "partial",
                  label: `부분 원격 (${summary.partialRemoteCount})`,
                },
              ] as Array<{ key: FilterType; label: string }>
            ).map((option) => (
              <Link
                key={option.key}
                href={buildFilterHref(option.key, query)}
                className={tabStyles.tab}
                aria-selected={filterType === option.key}
              >
                {option.label}
              </Link>
            ))}
          </div>

          <div className={styles.searchForm}>
            <RemoteWorkSearchInput initialQuery={query} />
          </div>
        </section>

        {filteredCompanies.length ? (
          <ul className={styles.companyList}>
            {filteredCompanies.map((company) => (
              <li key={company.id} className={styles.companyCard}>
                <div className={styles.cardHeader}>
                  <h2>{company.companyName}</h2>
                  <span
                    className={styles.categoryBadge}
                    data-category={company.remoteCategory}
                  >
                    {CATEGORY_LABEL[company.remoteCategory]}
                  </span>
                </div>

                <dl className={styles.infoList}>
                  <div>
                    <dt>자율 출퇴근</dt>
                    <dd>{formatPolicyText(company.flexibleWork)}</dd>
                  </div>
                  <div>
                    <dt>원격 근무</dt>
                    <dd>{formatPolicyText(company.remoteWork)}</dd>
                  </div>
                </dl>

                {!!company.links.length && (
                  <div className={styles.linkList}>
                    {company.links.map((link) => (
                      <a
                        key={`${company.id}-${link.url}-${link.label}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {link.label || "관련 링크"}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>
            조건에 맞는 회사가 없습니다. 검색어 또는 필터를 변경해보세요.
          </p>
        )}
      </main>
    </DefaultLayout>
  );
}
