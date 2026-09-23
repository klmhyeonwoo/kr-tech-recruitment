"use client";

import { useEffect, useState } from "react";
import styles from "./channel-talk.module.scss";

type ChannelCommand = {
  (command: "boot", options: Record<string, unknown>, callback: (error: Error | null) => void): void;
  (command: "shutdown" | "showMessenger" | "clearCallbacks"): void;
  (command: "onBadgeChanged", callback: (unread: number) => void): void;
  q?: IArguments[];
  c?: (args: IArguments) => void;
};

declare global {
  interface Window {
    ChannelIO?: ChannelCommand;
    ChannelIOInitialized?: boolean;
  }
}

const pluginKey = process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY ?? "ba39e2cd-5540-4df8-9553-817fd584119b";

function loadChannelScript() {
  if (window.ChannelIO) return;

  const channel = function () {
    // eslint-disable-next-line prefer-rest-params -- The SDK queue preserves the original argument list.
    channel.c?.(arguments);
  } as ChannelCommand;
  channel.q = [];
  channel.c = (args) => channel.q?.push(args);
  window.ChannelIO = channel;

  if (window.ChannelIOInitialized) return;
  window.ChannelIOInitialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
  document.head.appendChild(script);
}

export default function ChannelTalk() {
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let mounted = true;
    loadChannelScript();
    const compact = window.matchMedia("(max-width: 768px)").matches;

    window.ChannelIO?.("boot", {
      pluginKey,
      language: "ko",
      hideChannelButtonOnBoot: true,
      hidePopup: compact,
    }, (error) => {
      if (mounted) setReady(!error);
    });
    window.ChannelIO?.("onBadgeChanged", (count) => {
      if (mounted) setUnread(count);
    });

    return () => {
      mounted = false;
      window.ChannelIO?.("clearCallbacks");
      window.ChannelIO?.("shutdown");
    };
  }, []);

  const label = unread > 0 ? `채널톡 문의, 읽지 않은 메시지 ${unread}개` : "채널톡 문의";
  const content = <>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z" strokeLinejoin="round" />
      <path d="M7 11h8" strokeLinecap="round" />
    </svg>
    {unread > 0 && <span className={styles.badge} aria-hidden="true">{unread > 99 ? "99+" : unread}</span>}
  </>;

  return ready
    ? <button type="button" className={styles.launcher} aria-label={label}
        onClick={() => window.ChannelIO?.("showMessenger")}>{content}</button>
    : <a href="https://6oo1v.channel.io/home" target="_blank" rel="noopener noreferrer"
        className={styles.launcher} aria-label={label}>{content}</a>;
}
