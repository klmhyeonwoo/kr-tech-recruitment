"use client";
import React, { createContext, PropsWithChildren } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityProvider({ children }: PropsWithChildren) {
  // TODO: 추후 관련 상태 값이 추가되면 Context API로 추가 제공

  const Provider = createContext({});
  Clarity.init(process.env.NEXT_PUBLIC_CLARITY_KEY as string);

  return <Provider value={{}}> {children} </Provider>;
}
