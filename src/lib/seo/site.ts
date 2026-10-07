export const SITE_URL = "https://nklcb.kr";
export const SITE_NAME = "서울데브클럽";
export const OG_IMAGE =
  "https://raw.githubusercontent.com/klmhyeonwoo/Asset-Archieve./main/nklcb.png";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
