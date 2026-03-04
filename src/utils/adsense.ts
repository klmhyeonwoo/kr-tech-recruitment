export const ADSENSE_SCRIPT_ID = "adsbygoogle-lib";
export const ADSENSE_LOADED_EVENT = "adsense:loaded";
export const ADSENSE_CLIENT = "ca-pub-1550225145364569";
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

type AdsByGoogleQueue = {
  push: (config: Record<string, unknown>) => number | void;
};

export type AdSenseWindow = Window & {
  adsbygoogle?: AdsByGoogleQueue | unknown[];
  __adsenseScriptLoaded?: boolean;
};

export function markAdSenseScriptLoaded() {
  if (typeof window === "undefined") return;
  const adWindow = window as AdSenseWindow;
  adWindow.__adsenseScriptLoaded = true;
  document.getElementById(ADSENSE_SCRIPT_ID)?.setAttribute("data-loaded", "true");
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

export function requestAdSenseRender() {
  const adWindow = window as AdSenseWindow;
  adWindow.adsbygoogle = adWindow.adsbygoogle || [];
  (adWindow.adsbygoogle as AdsByGoogleQueue).push({});
}
