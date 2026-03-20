"use client";
import React, { createContext, useEffect, useState } from "react";
import { Portal } from "../../common/overlay/portal";
import Popup from "../../common/overlay/popup";
import { useAtom } from "jotai";
import { PORTAL_STORE } from "@/store";
import Progress from "./phase/Progress";
import subscribe from "@/api/domain/subscribe";
import useCheckEmail from "@/hooks/common/useCheckEmail";
import Complete from "./phase/Complete";
import Cookies from "js-cookie";
import CountUp from "react-countup";
import { useGetStandardJobCategories } from "@/hooks/api/useGetStandardJobCategories";

type SubscriptionContextType = {
  handleNext: () => void;
  handleClose: () => void;
  phase: number;
  subscriptionCategories?: { list?: { code: string; name: string }[] };
  selectedSubscriptionCategories?: string[];
};

export const SubsecriptionContext = createContext<SubscriptionContextType>({
  handleNext: () => {},
  handleClose: () => {},
  phase: 0,
  subscriptionCategories: {},
  selectedSubscriptionCategories: [],
});

function SubscriptionPopup() {
  const [isShowPopup, setIsShowPopup] = useAtom(PORTAL_STORE);
  const { email, isValidEmail, handleEmailChange, handleCleanUpEmail } =
    useCheckEmail();
  const [standardCategories, setStandardCategories] = useState<{
    list?: {
      code: string;
      name: string;
    }[];
  }>({});
  const [selectedSubscriptionCategories, setSelectedSubscriptionCategories] =
    useState<string[]>([]);

  // TODO: 추후 tanstack query의 isLoading을 사용하여 로딩 상태 관리 필요
  const [loader, setLoader] = useState(false);
  const [phase, setPhase] = useState(0);
  const [shouldFetchCategoriesFlag, setShouldFetchCategoriesFlag] =
    useState(false);

  const {
    data: standardJobCategories,
    isSuccess: isSuccessStandardJobCategories,
    isLoading: isLoadingStandardJobCategories,
  } = useGetStandardJobCategories({
    enabled: shouldFetchCategoriesFlag,
  });

  const closePopup = () => {
    setIsShowPopup(false);
  };

  const dismissForToday = () => {
    Cookies.set("subscriptionPopup", "closed", { expires: 1 });
    closePopup();
  };

  const handleCleanUpData = () => {
    setSelectedSubscriptionCategories([]);
    handleCleanUpEmail();
  };

  const initPhase = () => {
    setPhase(0);
    handleCleanUpData();
  };

  const handleAddStandardCategories = ({
    item,
  }: {
    item: { code: string; name: string };
  }) => {
    setSelectedSubscriptionCategories((prev) => {
      if (prev.includes(item.code)) {
        return prev.filter((code) => code !== item.code);
      } else {
        return [...prev, item.code];
      }
    });
  };

  const handlePhase0 = () => {
    setShouldFetchCategoriesFlag(true);
    if (standardJobCategories) {
      setPhase((prev) => prev + 1);
    }
  };

  const handlePhase1 = async () => {
    const { status } = await handleSubscription({
      email,
      standardCategories: selectedSubscriptionCategories,
    });
    if (status === 204) {
      setPhase((prev) => prev + 1);
    }
  };

  const handlePhase2 = () => {
    handleCleanUpData();
    closePopup();
  };

  const handleNext = async () => {
    if (phase === phaseTextSet.length) return;
    if (phase === 0) return handlePhase0();
    if (phase === 1) return handlePhase1();
    if (phase === 2) return handlePhase2();
  };

  const handleSubscription = async ({
    email,
    standardCategories,
  }: {
    email: string;
    standardCategories: string[];
  }) => {
    setLoader(true);
    try {
      const { status } = await subscribe.subscribe({
        email,
        standardCategories,
      });
      setLoader(false);
      return { status };
    } catch (error) {
      setLoader(false);
      console.error("Error during subscription:", error);
      return { status: 500 };
    }
  };

  // 순차적으로 퍼널이 진행하기 위한 텍스트 및 함수 세팅 작업이 진행되어요
  const phaseTextSet = [
    {
      title: (
        <>
          서비스의 다양한 소식과 <br />
          여러 빅테크 기업의 채용 소식을 <br />
          벌써 <CountUp end={200} />명 이상 구독하고 있어요
        </>
      ),
      positiveText: "5초만에 구독해볼래요",
      negativeText: "오늘 하루 보지 않기",
      positiveCallback: handleNext,
      negativeCallback: dismissForToday,
    },
    {
      title: `이메일을 입력해주시면 \n 곧 다양한 채용 공고로 찾아갈게요`,
      positiveText: "구독을 진행할게요",
      negativeText: "처음부터 다시 확인하고 싶어요",
      positiveCallback: handleNext,
      negativeCallback: initPhase,
      isDisabledButton: !(isValidEmail && selectedSubscriptionCategories.length > 0),
    },
    {
      positiveText: "확인했어요",
      positiveCallback: handleNext,
      options: {
        isPositiveButton: true,
        isNegativeButton: false,
        isTitle: false,
      },
    },
  ];

  /**
   * @description 직무 별 카테고리 성공 여부 감지를 위한 UseEffect 함수
   */
  useEffect(() => {
    if (isSuccessStandardJobCategories && standardJobCategories) {
      setStandardCategories(standardJobCategories);
      setPhase((prev) => prev + 1);
    }
  }, [isSuccessStandardJobCategories, standardJobCategories]);

  return (
    <Portal id="portal">
      {isShowPopup ? (
        <SubsecriptionContext.Provider
          value={{
            handleNext,
            handleClose: closePopup,
            phase,
            selectedSubscriptionCategories,
            subscriptionCategories: standardCategories,
          }}
        >
          <Popup
            title={phaseTextSet[phase]?.title}
            positiveCallback={phaseTextSet[phase]?.positiveCallback}
            negativeCallback={phaseTextSet[phase]?.negativeCallback}
            positiveButtonText={phaseTextSet[phase]?.positiveText}
            negativeButtonText={phaseTextSet[phase]?.negativeText}
            isDisabledButton={phaseTextSet[phase]?.isDisabledButton}
            options={phaseTextSet[phase]?.options}
            loader={loader || isLoadingStandardJobCategories}
          >
            {phase === 1 && (
              <Progress
                standardCategory={standardCategories?.list ?? []}
                email={email}
                handleEmailChange={handleEmailChange}
                handleAddStandardCategories={handleAddStandardCategories}
              />
            )}
            {phase === 2 && <Complete />}
          </Popup>
        </SubsecriptionContext.Provider>
      ) : null}
    </Portal>
  );
}

export default SubscriptionPopup;
