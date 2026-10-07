import { api } from "@/api";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

async function getRecruitmentInfo({
  id,
}: {
  id: number;
}): Promise<{ status: number }> {
  try {
    const { status } = await api.post(`/recruitment-notices/${id}/click`);
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      status,
    };
  } catch (error) {
    console.error("Failed to fetch recruitment info:", error);
    return { status: 500 };
  }
}

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id: number; path: string }>;
}) {
  const { id, path } = await searchParams;
  const { status } = await getRecruitmentInfo({
    id,
  });

  if (status === 500 || !id || !path) {
    return redirect("/error");
  }

  redirect(atob(path));
}

export default Page;
