import { api } from "..";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  bestList: () => api.get("/boards/best-item"),
  standardList: ({
    page,
    pageSize,
    searchWord,
  }: {
    page: number;
    pageSize: number;
    searchWord?: string;
  }) => api.get("/boards", { params: { page, pageSize, searchWord } }),
  createBoard: ({ title, content }: { title: string; content: string }) =>
    api.post("/boards", { title, content }),
};
