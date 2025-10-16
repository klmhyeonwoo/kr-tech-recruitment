"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import ErrorMessage from "@/components/common/error-message";

function NotFound() {
  const params = useSearchParams();
  const reason = decodeURIComponent(params.get("reason") || "");

  return <ErrorMessage message={reason} />;
}

export default NotFound;
