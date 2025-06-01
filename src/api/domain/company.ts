import { api } from "..";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getStandardCategories: () => {
    return api.get("/companies/standard-categories");
  },
};
