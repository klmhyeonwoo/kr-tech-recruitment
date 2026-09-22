"use client";

import { useEffect } from "react";

type ChannelCommand = {
  (command: "boot" | "shutdown", options?: Record<string, unknown>): void;
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
  useEffect(() => {
    loadChannelScript();
    const compact = window.matchMedia("(max-width: 768px)").matches;

    window.ChannelIO?.("boot", {
      pluginKey,
      language: "ko",
      channelButtonOption: {
        position: "left",
        xMargin: compact ? 14 : 28,
        yMargin: compact ? 124 : 150,
      },
    });

    return () => window.ChannelIO?.("shutdown");
  }, []);

  return null;
}
