"use client";
import React, { createContext, PropsWithChildren, useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityProvider({ children }: PropsWithChildren) {
  // TODO: 추후 관련 상태 값이 추가되면 Context API로 추가 제공

  const Provider = createContext({});

  useEffect(() => {
    // * Clarity.init이 내부적으로 스크립트 로드/비동기 상태를 건드리면서, Suspense 경계 정리 타이밍과 충돌
    // * UseEffect 안에서 실행되어야 함
    Clarity.init(process.env.NEXT_PUBLIC_CLARITY_KEY as string);
  }, []);

  return <Provider value={{}}> {children} </Provider>;
}
