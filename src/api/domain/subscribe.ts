import { api } from "..";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  subscribe: ({
    email,
    standardCategories,
  }: {
    email: string;
    standardCategories: string[];
  }) =>
    api.post("/subscribe-emails", {
      email,
      standardCategories,
    }),
  clear: ({ email }: { email: string }) =>
    api.delete("/subscribe-emails", {
      data: { email },
    }),
};
