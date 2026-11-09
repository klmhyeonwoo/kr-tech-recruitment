import { useQuery } from "@tanstack/react-query";

interface SubscriberTotalResponse {
  count: number;
}

export default function useGetSubscribeTotal(enabled = true) {
  const fetch = async (): Promise<SubscriberTotalResponse> => {
    // 브라우저에서 외부 API 를 직접 부르면 CORS 에 막힐 수 있어 서버 라우트를 거칩니다.
    const response = await window.fetch("/api/subscribers");
    if (!response.ok) throw new Error("구독자 수를 불러오지 못했어요");
    const data = await response.json();
    if (typeof data?.count !== "number") throw new Error("구독자 수 형식이 올바르지 않아요");
    return data as SubscriberTotalResponse;
  };

  return useQuery<SubscriberTotalResponse>({
    queryKey: ["subscriber-total"],
    queryFn: fetch,
    enabled,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}
