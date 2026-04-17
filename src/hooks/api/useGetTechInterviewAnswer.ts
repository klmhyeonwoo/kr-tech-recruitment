import { useQuery } from "@tanstack/react-query";

export default function useTechInterviewAnswer({ id }: { id: string }) {
  const fetchAnswer = async (id: string) => {
    const type = id.startsWith("fe-") ? "frontend" : "backend";
    const url = `https://raw.githubusercontent.com/maeil-mail/maeil-mail-contents/main/${type}/contents/${id}.md`;
    const response = await globalThis.fetch(url);
    if (!response.ok) throw new Error("fetch failed");
    return response.text();
  };

  return useQuery({
    queryFn: () => fetchAnswer(id),
    queryKey: [id],
    enabled: !!id,
  });
}
