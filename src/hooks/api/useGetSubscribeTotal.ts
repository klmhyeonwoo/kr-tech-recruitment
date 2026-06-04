import subscribe from "@/api/domain/subscribe";
import { useQuery } from "@tanstack/react-query";

export default function useGetSubscribeTotal() {
  const fetch = async () => {
    const response = await subscribe.subscribers();
    return response?.data;
  };

  return useQuery({
    queryKey: ["subscriber-total"],
    queryFn: fetch,
  });
}
