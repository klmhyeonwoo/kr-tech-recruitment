import { NextResponse } from "next/server";
import { api } from "@/api";

// 구독 모달에 보여줄 구독자 수입니다.
// 브라우저가 외부 API 를 직접 부르면 CORS 에 막힐 수 있어, 서버에서 받아 한 시간 동안 캐시합니다.
export const revalidate = 3600;

export async function GET() {
  try {
    const { data } = await api.get<{ count: number }>("/subscribe-emails/count", { timeout: 8_000 });
    if (typeof data?.count !== "number" || !Number.isFinite(data.count)) throw new Error("Invalid subscriber count");
    return NextResponse.json(
      { count: data.count },
      { headers: { "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ count: null }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
