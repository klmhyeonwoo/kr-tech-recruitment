import data from "@/data/remote-work-companies.kr.json";
import Directory from "./directory";

const categories = [
  { id: "all", label: "전체" }, { id: "full", label: "완전 원격" }, { id: "partial", label: "부분 원격" },
];
function policy(value: string) {
  return value.trim().replace(/^[oO](?=\s|$|[(/,])/u, "운영 중").replace(/^[xX](?=\s|$|[(/,])/u, "미운영");
}
const items = data.companies.filter((company) => company.isRemotePossible)
  .sort((a, b) => Number(b.remoteCategory === "full") - Number(a.remoteCategory === "full") ||
    a.companyName.localeCompare(b.companyName, "ko"))
  .map((company) => ({
    id: company.id, name: company.companyName, category: company.remoteCategory,
    description: `원격 근무 · ${policy(company.remoteWork)}`,
    detail: `자율 출퇴근 · ${policy(company.flexibleWork)}`, links: company.links,
  }));

export default function RemotePanel() {
  return <Directory title="재택·원격 회사" items={items} categories={categories}
    searchLabel="회사명 또는 근무 조건 검색"
    source={<><a href="https://github.com/milooy/remote-or-flexible-work-company-in-korea"
      target="_blank" rel="noopener noreferrer">원본 자료 ↗</a>
      <span>근무 정책은 회사의 최신 안내를 확인해 주세요.</span></>} />;
}
