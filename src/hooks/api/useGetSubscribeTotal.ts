import subscribe from "@/api/domain/subscribe";
import { useQuery } from "@tanstack/react-query";

interface SubscriberTotalResponse {
  count: number;
}

export default function useGetSubscribeTotal() {
  const fetch = async (): Promise<SubscriberTotalResponse> => {
    const response = await subscribe.subscribers();
    return response?.data;
  };

  return useQuery<SubscriberTotalResponse>({
    queryKey: ["subscriber-total"],
    queryFn: fetch,
  });
}
