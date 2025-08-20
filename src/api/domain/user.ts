import { api } from "..";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  userInfo: () => api.get("/users"),
};
