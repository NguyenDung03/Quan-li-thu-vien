import api from "@/lib/api";
import type {
  GradeLevelsResponse,
  GetGradeLevelsParams,
} from "@/types/book.type";

export const gradeLevelApi = {
  getGradeLevels: async (
    params?: GetGradeLevelsParams,
  ): Promise<GradeLevelsResponse> => {
    const response = await api.get<GradeLevelsResponse>("/grade-levels", {
      params,
    });
    return response.data;
  },
};
