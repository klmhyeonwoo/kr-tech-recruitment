import { NextResponse } from "next/server";
import { api } from "@/api";
import type { RecruitData } from "@/components/card/Section";
import { deadlineOf } from "@/utils/jobs";

// 홈의 검색·필터가 쓰는 전체 공고 목록입니다.
// 브라우저가 외부 API 를 직접 부르면 CORS 에 막힐 수 있어, 서버에서 한 번 받아 한 시간 동안 캐시합니다.
export const revalidate = 3600;

export async function GET() {
  try {
    const { data } = await api.get<{ list: RecruitData[] }>("/recruitment-notices/redirections", {
      params: { page: 0, pageSize: 9999 },
      timeout: 15_000,
    });
    if (!Array.isArray(data?.list)) throw new Error("Invalid recruitment response");
    // 마감된 공고는 보내지 않습니다.
    const list = data.list
      .filter((item) => deadlineOf(item.endAt).tone !== "closed")
      .map((item) => ({ ...item, url: btoa(item.url) }));
    return NextResponse.json(
      { list },
      { headers: { "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ list: [] }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
