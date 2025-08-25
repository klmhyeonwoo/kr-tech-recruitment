import { USER_STORE } from "@/store";
import { useAtom } from "jotai";
import Cookies from "js-cookie";

export default function useUser() {
  const [isLogin, setIsLogin] = useAtom(USER_STORE);

  const login = (token: string) => {
    Cookies.set("nklcb__tk", token);
    setIsLogin(true);
  };

  const logout = () => {
    Cookies.remove("nklcb__tk");
    setIsLogin(false);
  };

  const checkLogin = () => {
    setIsLogin(Cookies.get("nklcb__tk") !== undefined);
  };

  return { isLogin, login, logout, checkLogin };
}
