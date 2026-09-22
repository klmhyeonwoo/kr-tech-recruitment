"use client";

import { useEffect } from "react";

type ChannelCommand = (command: "boot" | "shutdown", options?: Record<string, unknown>) => void;

declare global {
  interface Window {
    ChannelIO?: ChannelCommand & { q?: unknown[][]; c?: (args: unknown[]) => void };
    ChannelIOInitialized?: boolean;
  }
}

const pluginKey = process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY ?? "ba39e2cd-5540-4df8-9553-817fd584119b";

function loadChannelScript() {
  if (window.ChannelIO) return;

  const channel = ((...args: unknown[]) => channel.c?.(args)) as ChannelCommand & {
    q: unknown[][];
    c: (args: unknown[]) => void;
  };
  channel.q = [];
  channel.c = (args) => channel.q.push(args);
  window.ChannelIO = channel;

  if (window.ChannelIOInitialized) return;
  window.ChannelIOInitialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
  document.head.appendChild(script);
}

export default function ChannelTalk() {
  useEffect(() => {
    loadChannelScript();
    const compact = window.matchMedia("(max-width: 768px)").matches;

    window.ChannelIO?.("boot", {
      pluginKey,
      language: "ko",
      channelButtonOption: {
        position: "right",
        xMargin: compact ? 14 : 28,
        yMargin: compact ? 124 : 150,
      },
    });

    return () => window.ChannelIO?.("shutdown");
  }, []);

  return null;
}
