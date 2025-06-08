const scaledPositionName = (originalName: string) => {
  const set: { [key: string]: string } = {
    ETC: "기타",
    BACKEND: "백엔드",
    FRONTEND: "프론트엔드",
    ANDROID: "안드로이드",
    IOS: "iOS",
    EMBEDDED: "임베디드",
    DBA: "DBA",
    HR: "인사",
    INFRA_DEVOPS: "인프라 · 데브옵스",
    DESIGN: "디자인",
    QA: "QA",
    AI_ML: "AI · 머신러닝",
    DATA: "데이터",
    SECURITY: "정보보안",
    SERVICE_PLANNER: "서비스 기획",
    OPERATION: "운영",
    SALES: "영업",
    PM_PO: "PM/PO",
    ART: "아트",
    GAME_DESIGN: "게임 디자인",
    GAME_PROGRAMMING: "게임 개발",
  };

  return set[originalName?.trim()] ?? originalName;
};

const formatDate = (dateString: string) => {
  if (dateString.includes("9999")) {
    return "채용 시 마감";
  }

  if (!dateString.includes("T")) {
    return dateString;
  }

  try {
    const date = new Date(dateString);

    const koreanFormatter = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return koreanFormatter
      .format(date)
      .replace(/\. /g, ".")
      .replace(/(\d{4}\.\d{2}\.\d{2})\./, "$1 · ");
  } catch (error) {
    console.error("날짜 변환 중 오류가 발생했어요 : ", error);
    return dateString;
  }
};

const scaledIndex = (index: number) => {
  if (index < 10) {
    return `0${index}`;
  } else {
    return `${index}`;
  }
};

export { scaledPositionName, formatDate, scaledIndex };
