// public/images/companies 에 SVG 로고 파일이 있는 회사만 로고를 보여줍니다. (파일 이름은 회사 코드의 소문자)
const LOGOS = new Set(["NAVER", "KAKAO", "LINE", "COUPANG", "WOOWAHAN", "DAANGN", "TOSS"]);

export function companyLogo(code?: string | null) {
  const upper = code?.trim().toUpperCase();
  return upper && LOGOS.has(upper) ? `/images/companies/${upper.toLowerCase()}.svg` : null;
}

/** 로고가 있는 회사 코드 (홈의 기업 바로가기 순서) */
export const LOGO_COMPANY_CODES = ["NAVER", "KAKAO", "LINE", "COUPANG", "WOOWAHAN", "DAANGN", "TOSS"] as const;
