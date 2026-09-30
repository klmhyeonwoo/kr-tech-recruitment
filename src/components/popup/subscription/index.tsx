"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { PORTAL_STORE } from "@/store";
import { Portal } from "@/components/common/overlay/portal";
import Popup from "@/components/common/overlay/popup";
import subscribe from "@/api/domain/subscribe";
import useCheckEmail from "@/hooks/common/useCheckEmail";
import { useGetStandardJobCategories } from "@/hooks/api/useGetStandardJobCategories";
import Progress from "./phase/Progress";
import Complete from "./phase/Complete";

export default function SubscriptionPopup() {
  const [isOpen, setIsOpen] = useAtom(PORTAL_STORE);
  const { email, isValidEmail, handleEmailChange, handleCleanUpEmail } = useCheckEmail();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");
  const { data: categories, isLoading, isError } = useGetStandardJobCategories({ enabled: isOpen });

  function close() {
    setIsOpen(false);
    setIsComplete(false);
    setSelectedCategories([]);
    setError("");
    handleCleanUpEmail();
  }

  function toggleCategory(code: string) {
    setSelectedCategories((current) => current.includes(code)
      ? current.filter((selected) => selected !== code)
      : [...current, code]);
  }

  async function submit() {
    if (!isValidEmail || selectedCategories.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const response = await subscribe.subscribe({
        email,
        standardCategories: selectedCategories,
      });
      if (response.status === 204) setIsComplete(true);
      else setError("구독을 완료하지 못했어요. 다시 시도해 주세요.");
    } catch {
      setError("구독을 완료하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Portal id="portal">
      {isOpen && (
        <Popup
          title="이메일과 관심 직무"
          positiveCallback={isComplete ? close : submit}
          negativeCallback={close}
          positiveButtonText={isComplete ? "닫기" : "구독하기"}
          negativeButtonText="취소"
          isDisabledButton={!isComplete && (!isValidEmail || selectedCategories.length === 0 || isError)}
          loader={isSubmitting || isLoading}
          options={{ isPositiveButton: true, isNegativeButton: !isComplete, isTitle: !isComplete }}
        >
          {isComplete ? (
            <Complete />
          ) : (
            <>
              <Progress
                standardCategory={categories?.list ?? []}
                selectedCategories={selectedCategories}
                email={email}
                handleEmailChange={handleEmailChange}
                onToggleCategory={toggleCategory}
              />
              {isError && <p role="alert">직무 목록을 불러오지 못했어요.</p>}
              {error && <p role="alert">{error}</p>}
            </>
          )}
        </Popup>
      )}
    </Portal>
  );
}
