import { CATEGORY_STORE } from "@/store";
import { useAtom } from "jotai";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function useFilter() {
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedGlobalFilter, setSelectedGlobalFilter] = useAtom<
    string | null
  >(CATEGORY_STORE);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const removeSelectedFilter = () => {
    setSelectedGlobalFilter(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentQuery = searchParams.toString();
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    if (nextUrl === currentUrl) return;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  };

  return {
    isOpenFilter,
    selectedGlobalFilter,
    setIsOpenFilter,
    setSelectedGlobalFilter,
    removeSelectedFilter,
  };
}
