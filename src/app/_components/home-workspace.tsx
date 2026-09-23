"use client";

import dynamic from "next/dynamic";
import { Component, useSyncExternalStore, type ReactNode } from "react";
import Ads from "@/components/ads/ads";
import HomeNavigation from "./home-navigation";

const ITEMS = [
  { id: "jobs", label: "채용 공고" },
  { id: "remote", label: "재택·원격 회사", shortLabel: "재택·원격" },
  { id: "activities", label: "개발자 대외활동", shortLabel: "대외활동" },
  { id: "interview", label: "기술 면접 준비", shortLabel: "면접 준비" },
  { id: "trends", label: "개발 트렌드", shortLabel: "개발 트렌드" },
  { id: "community", label: "커뮤니티" },
] as const;
type View = (typeof ITEMS)[number]["id"];

function Loading() {
  return <div className="home-panel-loading" role="status">내용을 불러오고 있어요.</div>;
}

const RemotePanel = dynamic(() => import("./home-panels/remote"), { loading: Loading });
const ActivitiesPanel = dynamic(() => import("./home-panels/activities"), { loading: Loading });
const InterviewPanel = dynamic(() => import("./home-panels/interview"), { loading: Loading });
const TrendsPanel = dynamic(() => import("./home-panels/trends"), { loading: Loading });
const CommunityPanel = dynamic(() => import("./home-panels/community"), { loading: Loading });

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("home-view-change", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("home-view-change", callback);
  };
}

function getView(): View {
  const view = new URLSearchParams(window.location.search).get("view");
  return ITEMS.find((item) => item.id === view)?.id ?? "jobs";
}

function subscribeLayout(callback: () => void) {
  const media = window.matchMedia("(min-width: 1200px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

class PanelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return <div className="home-panel-loading" role="alert">
        <p>내용을 불러오지 못했어요.</p>
        <button type="button" onClick={() => window.location.reload()}>새로고침</button>
      </div>;
    }
    return this.props.children;
  }
}

export default function HomeWorkspace({ children, extra }: { children: ReactNode; extra: ReactNode }) {
  const active = useSyncExternalStore(subscribe, getView, () => "jobs" as View);
  const vertical = useSyncExternalStore(subscribeLayout,
    () => window.matchMedia("(min-width: 1200px)").matches, () => false);

  function select(view: View) {
    if (view === active) return;
    const url = new URL(window.location.href);
    url.search = view === "jobs" ? "" : new URLSearchParams({ view }).toString();
    url.hash = "";
    window.history.pushState(null, "", url);
    window.dispatchEvent(new Event("home-view-change"));
  }

  return <main className="home-layout" data-view={active}>
    <HomeNavigation items={ITEMS} active={active} vertical={vertical} onSelect={select} />
    {ITEMS.map((item) => <div key={item.id} id={`home-panel-${item.id}`}
      role="tabpanel" aria-labelledby={`home-tab-${item.id}`} tabIndex={0}
      hidden={active !== item.id} className="home-panel">
      {active === item.id && <PanelBoundary key={item.id}>
        {item.id === "jobs" && children}
        {item.id === "remote" && <RemotePanel />}
        {item.id === "activities" && <ActivitiesPanel />}
        {item.id === "interview" && <InterviewPanel />}
        {item.id === "trends" && <TrendsPanel />}
        {item.id === "community" && <CommunityPanel />}
      </PanelBoundary>}
    </div>)}
    <aside className="home-ad-rail"><div className="home-ad-sticky">
      <Ads placement="home-primary" className="home-ad" />
    </div></aside>
    <div className="home-extra">{extra}</div>
  </main>;
}
