"use client";
import React, { createContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
import useGetSubscribeTotal from "@/hooks/api/useGetSubscribeTotal";

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

const AUTO_OPEN_DELAY_MS = 8000;
const SUBSCRIBED_KEY = "sdc-subscribed";

function SubscriptionPopup() {
  const [isShowPopup, setIsShowPopup] = useAtom(PORTAL_STORE);
  const pathname = usePathname();
  const [prefetchCount, setPrefetchCount] = useState(false);
  const { data: subscriberTotal } = useGetSubscribeTotal(isShowPopup || prefetchCount);
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

  const handleNext = async () => {
    // 현재 페이즈가 마지막 페이즈라면 아무 작업도 하지 않음
    if (phase === phaseTextSet.length) return;

    // 페이즈 시작 단계
    if (phase === 0) {
      setShouldFetchCategoriesFlag(true); // tanstack-query enabled flag
      // * 캐싱 처리를 위해 tanstack-query 사용함으로써 초기 데이터 패칭 성공 여부는 useEffect에서 처리
      if (standardJobCategories) {
        // * 데이터가 존재하면 다음 페이즈로 이동시킴
        setPhase((prev) => prev + 1);
      }
    }

    // 페이즈 진행 단계 (이메일 구독)
    if (phase === 1) {
      const { status } = await handleSubscription({
        email,
        standardCategories: selectedSubscriptionCategories,
      });
      if (status === 204) {
        try { localStorage.setItem(SUBSCRIBED_KEY, "1"); } catch {}
        setPhase((prev) => prev + 1);
      }
    }

    // 페이즈 완료 단계 (구독 완료)
    if (phase === 2) {
      handleCleanUpData();
      handleClose();
    }
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

  const handleClose = () => {
    setIsShowPopup(false);
    setPhase(0);
    setShouldFetchCategoriesFlag(false);
    handleCleanUpData();
    Cookies.set("subscriptionPopup", "closed", {
      expires: 1, // 쿠키를 하루 동안 유지해요
    });
  };

  const handleCleanUpData = () => {
    setSelectedSubscriptionCategories([]);
    handleCleanUpEmail();
  };

  const initPhase = () => {
    setPhase(0);
    setShouldFetchCategoriesFlag(false);
    handleCleanUpData();
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
          서울데브클럽을 구독하면 <br />
          커뮤니티 소식과 주요 기업의 <br />
          채용 소식을 받아볼 수 있어요 <br />
          {typeof subscriberTotal?.count === "number" &&
          Number.isFinite(subscriberTotal.count) ? (
            <>
              <span className="popup-count"><i aria-hidden="true" /><span>현재 <b><CountUp end={subscriberTotal.count} separator="," duration={1.4} />명</b>이 구독 중이에요</span></span>
            </>
          ) : (
            <span className="popup-count">메일로 편하게 받아보세요</span>
          )}
        </>
      ),
      positiveText: "5초만에 구독해볼래요",
      negativeText: "오늘 하루 보지 않기",
      positiveCallback: handleNext,
      negativeCallback: handleClose,
    },
    {
      title: `이메일을 입력해주시면 \n 곧 다양한 채용 공고로 찾아갈게요`,
      positiveText: "구독을 진행할게요",
      negativeText: "처음부터 다시 확인하고 싶어요",
      positiveCallback: handleNext,
      negativeCallback: initPhase,
      isDisabledButton:
        !isValidEmail || selectedSubscriptionCategories.length === 0,
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
   * @description 몇 초 뒤 자동으로 구독 팝업을 띄웁니다. (오늘 닫았거나 이미 구독했다면 띄우지 않아요)
   */
  useEffect(() => {
    if (pathname?.startsWith("/subscribe")) return;
    if (Cookies.get("subscriptionPopup") === "closed") return;
    try { if (localStorage.getItem(SUBSCRIBED_KEY)) return; } catch {}
    // 팝업이 뜨기 전에 구독자 수를 미리 받아 둬서, 열릴 때 바로 숫자가 보이게 합니다.
    const prefetch = window.setTimeout(() => setPrefetchCount(true), AUTO_OPEN_DELAY_MS / 2);
    const timer = window.setTimeout(() => setIsShowPopup(true), AUTO_OPEN_DELAY_MS);
    return () => { window.clearTimeout(timer); window.clearTimeout(prefetch); };
  }, [pathname, setIsShowPopup]);

  /**
   * @description 직무 별 카테고리 성공 여부 감지를 위한 UseEffect 함수
   */
  useEffect(() => {
    if (
      isShowPopup &&
      shouldFetchCategoriesFlag &&
      phase === 0 &&
      isSuccessStandardJobCategories
    ) {
      setStandardCategories(standardJobCategories);
      setPhase((prev) => prev + 1);
    }
  }, [
    isShowPopup,
    shouldFetchCategoriesFlag,
    phase,
    isSuccessStandardJobCategories,
    standardJobCategories,
  ]);

  return (
    <Portal id="portal">
      {isShowPopup ? (
        <SubsecriptionContext.Provider
          value={{
            handleNext,
            handleClose,
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
            onClose={handleClose}
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
