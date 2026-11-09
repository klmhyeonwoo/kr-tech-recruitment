import { cache } from "react";
import { api } from "@/api";
import { SERVICE_CATEGORY } from "@/utils/const";
import { absoluteUrl } from "./site";

export type RecruitmentCompany = { companyCode: string; name: string };
export const DEFAULT_COMPANY_CODE = "NAVER";

export function normalizeCompanyCode(value?: string | string[]) {
  const code = Array.isArray(value) ? value[0] : value;
  return code?.trim().toUpperCase() || DEFAULT_COMPANY_CODE;
}

export function companyPath(code: string) {
  return `/web?${new URLSearchParams({ company: normalizeCompanyCode(code) })}`;
}

export function companyUrl(code: string) {
  return absoluteUrl(companyPath(code));
}

// Share the same company catalog between metadata, visible links and the sitemap.
export const getRecruitmentCompanies = cache(async (): Promise<RecruitmentCompany[]> => {
  try {
    const { data } = await api.get("/companies");
    if (Array.isArray(data?.companies)) {
      const companies = new Map<string, RecruitmentCompany>();
      for (const company of data.companies) {
        if (typeof company?.companyCode !== "string" || !company.companyCode.trim() || typeof company?.name !== "string") continue;
        const companyCode = normalizeCompanyCode(company.companyCode);
        if (!/^[A-Z0-9_-]+$/.test(companyCode) || !company.name.trim()) continue;
        companies.set(companyCode, { companyCode, name: company.name.trim() });
      }
      if (companies.size) return [...companies.values()];
    }
  } catch {
    // Keep known company pages discoverable during an API outage.
  }
  return Object.values(SERVICE_CATEGORY).map(({ code, name }) => ({ companyCode: code, name }));
});
