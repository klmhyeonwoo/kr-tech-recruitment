"use client";
import React, { createContext, useState } from "react";
import { Portal } from "../../common/portal";
import Popup from "../../common/popup";
import { useAtom } from "jotai";
import { PORTAL_STORE } from "@/store";
import Progress from "./phase/Progress";
import subscribe from "@/api/domain/subscribe";
import company from "@/api/domain/company";
import useCheckEmail from "@/hooks/useCheckEmail";
import Complete from "./phase/Complete";
import Cookies from "js-cookie";
import CountUp from "react-countup";

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
  const handleNext = async () => {
    // 현재 페이즈가 마지막 페이즈라면 아무 작업도 하지 않음
    if (phase === phaseTextSet.length) return;

    // 페이즈 시작 단계
    if (phase === 0) {
      const { data, status } = await handleGetStandardCategories();
      if (status === 200) {
        setStandardCategories(data);
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

  const handleGetStandardCategories = async () => {
    setLoader(true);
    try {
      const { status, data } = await company.getStandardCategories();
      setLoader(false);
      if (status === 200) {
        return { data, status };
      } else {
        return { status };
      }
    } catch (error) {
      setLoader(false);
      console.error("Error fetching standard categories:", error);
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
            loader={loader}
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
