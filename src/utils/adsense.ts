export const ADSENSE_SCRIPT_ID = "adsbygoogle-lib";
export const ADSENSE_LOADED_EVENT = "adsense:loaded";
export const ADSENSE_CLIENT = "ca-pub-1550225145364569";
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

type AdsByGoogleQueue = {
  push: (config: Record<string, unknown>) => number | void;
};

const requestedSlots = new WeakSet<HTMLElement>();

export type AdSenseWindow = Window & {
  adsbygoogle?: AdsByGoogleQueue | unknown[];
  __adsenseScriptLoaded?: boolean;
};

export function markAdSenseScriptLoaded() {
  if (typeof window === "undefined") return;
  const adWindow = window as AdSenseWindow;
  if (adWindow.__adsenseScriptLoaded) return;
  adWindow.__adsenseScriptLoaded = true;
  document
    .getElementById(ADSENSE_SCRIPT_ID)
    ?.setAttribute("data-loaded", "true");
  window.dispatchEvent(new Event(ADSENSE_LOADED_EVENT));
}

export function isAdSenseScriptLoaded() {
  if (typeof window === "undefined") return false;
  const adWindow = window as AdSenseWindow;
  if (adWindow.__adsenseScriptLoaded) return true;
  return (
    document.getElementById(ADSENSE_SCRIPT_ID)?.getAttribute("data-loaded") ===
    "true"
  );
}

export function requestAdSenseRender(adElement: HTMLElement): boolean {
  if (typeof window === "undefined") return false;
  if (
    requestedSlots.has(adElement) ||
    adElement.hasAttribute("data-adsbygoogle-status")
  ) {
    return true;
  }
  if (
    !isAdSenseScriptLoaded() ||
    !adElement.isConnected ||
    adElement.getBoundingClientRect().width <= 0
  ) {
    return false;
  }

  // Keep the attempt tied to the DOM node across Strict Mode effect replays.
  requestedSlots.add(adElement);
  const adWindow = window as AdSenseWindow;
  adWindow.adsbygoogle = adWindow.adsbygoogle || [];
  try {
    (adWindow.adsbygoogle as AdsByGoogleQueue).push({});
  } catch (error) {
    console.error("Failed to render ad:", error);
  }
  return true;
}
