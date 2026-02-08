import company from "@/api/domain/company";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

interface StandardCategory {
  code: string;
  name: string;
}

interface StandardCategoriesResponse {
  list?: StandardCategory[];
}

type UseGetStandardJobCategoriesOptions = Omit<
  UseQueryOptions<
    StandardCategoriesResponse,
    Error,
    StandardCategoriesResponse,
    string[]
  >,
  "queryKey" | "queryFn"
>;

export function useGetStandardJobCategories(
  options?: UseGetStandardJobCategoriesOptions,
) {
  const fetch = async () => {
    const response = await company.getStandardCategories();
    return response?.data;
  };

  return useQuery({
    queryKey: ["standard-categories"],
    queryFn: () => fetch(),
    ...options,
  });
}
