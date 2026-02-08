import { CATEGORY_STORE } from "@/store";
import { useAtom } from "jotai";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function useFilter() {
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedGlobalFilter, setSelectedGlobalFilter] = useAtom<
    string | null
  >(CATEGORY_STORE);
  const router = useRouter();
  const pathname = usePathname();

  const removeSelectedFilter = () => {
    setSelectedGlobalFilter(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("category");
    router.replace(`${pathname}/?${params.toString()}`);
  };

  return {
    isOpenFilter,
    selectedGlobalFilter,
    setIsOpenFilter,
    setSelectedGlobalFilter,
    removeSelectedFilter,
  };
}
