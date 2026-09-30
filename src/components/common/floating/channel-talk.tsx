"use client";

import { useEffect } from "react";

type ChannelCommand = {
  (command: "boot", options: { pluginKey: string; language: string }): void;
  (command: "shutdown"): void;
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
    window.ChannelIO?.("boot", { pluginKey, language: "ko" });
    return () => window.ChannelIO?.("shutdown");
  }, []);

  return null;
}
