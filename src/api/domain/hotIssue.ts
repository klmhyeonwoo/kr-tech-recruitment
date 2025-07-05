import { api } from "..";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  comments: ({
    id,
    anonymousName,
    content,
  }: {
    id: number;
    anonymousName: string;
    content: string;
  }) => {
    return api.post(`/hot-issues/${id}/comments`, {
      anonymousName,
      content,
    });
  },
  getActivatedList: () => {
    return api.get("/hot-issues/activated-list");
  },
  getCommentsList: ({ questionId }: { questionId: number }) => {
    return api.get(`/hot-issues/${questionId}`);
  },
};
