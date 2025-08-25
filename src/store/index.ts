import { atom } from "jotai";
import Cookies from "js-cookie";

const CATEGORY_STORE = atom<string | null>(null);
const SEARCH_KEYWORD_STORE = atom<string>("");
const SELECTED_COMPANY_STORE = atom<{
  companyCode: string;
  name: string;
}>({
  companyCode: "",
  name: "",
});
const PORTAL_STORE = atom<boolean>(false);
const USER_STORE = atom<boolean>(Cookies.get("nklcb__un") !== undefined);

export {
  CATEGORY_STORE,
  SEARCH_KEYWORD_STORE,
  SELECTED_COMPANY_STORE,
  USER_STORE,
  PORTAL_STORE,
};
