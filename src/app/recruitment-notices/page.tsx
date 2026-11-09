import { api } from "@/api";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type SearchParams = {
  id?: string | string[];
  path?: string | string[];
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { id, path } = await searchParams;
  const noticeId = typeof id === "string" && /^[1-9]\d*$/.test(id)
    ? Number(id)
    : NaN;
  let destination: URL | undefined;

  if (Number.isSafeInteger(noticeId) && typeof path === "string") {
    try {
      const url = new URL(atob(path));
      if (["https:", "http:"].includes(url.protocol)) destination = url;
    } catch {
      // Invalid or incomplete shared links return to the recruitment list.
    }
  }

  if (!destination) redirect("/web");

  try {
    await api.post(`/recruitment-notices/${noticeId}/click`);
  } catch {
    // Click tracking must not prevent opening an otherwise valid posting.
  }

  redirect(destination.href);
}
