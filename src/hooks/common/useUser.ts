import { USER_STORE } from "@/store";
import { useAtom } from "jotai";
import Cookies from "js-cookie";
import { useEffect } from "react";

export default function useUser() {
  const [isLogin, setIsLogin] = useAtom(USER_STORE);

  useEffect(() => {
    setIsLogin(Cookies.get("nklcb__tk") !== undefined);
  }, [setIsLogin]);

  const login = (token: string) => {
    Cookies.set("nklcb__tk", token);
    setIsLogin(true);
  };

  const logout = () => {
    Cookies.remove("nklcb__tk");
    setIsLogin(false);
  };

  return { isLogin, login, logout };
}
