const WALLA = "https://walla.my/v/KsaWEsXPHLu0DxkLrJ6R";
const BASE_URL = "https://nklcb.io";
const SERVICE_CATEGORY: {
  [key in
    | "naver"
    | "kakao"
    | "line"
    | "coupang"
    | "woowahan"
    | "daangn"
    | "toss"
    | "yanolja"]: {
    code: string;
    name: string;
  };
} = {
  naver: {
    code: "NAVER",
    name: "네이버",
  },
  kakao: {
    code: "KAKAO",
    name: "카카오",
  },
  line: {
    code: "LINE",
    name: "라인",
  },
  coupang: {
    code: "COUPANG",
    name: "쿠팡",
  },
  woowahan: {
    code: "WOOWAHAN",
    name: "배달의민족",
  },
  daangn: {
    code: "DAANGN",
    name: "당근",
  },
  toss: {
    code: "TOSS",
    name: "토스",
  },
  yanolja: {
    code: "YANOLJA",
    name: "야놀자",
  },
};

export { WALLA, SERVICE_CATEGORY, BASE_URL };
