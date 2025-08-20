import { api } from "..";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  kakao: ({ token }: { token: string }) =>
    api.post("/auth/kakao/login", {
      kakaoToken: token,
    }),
};
