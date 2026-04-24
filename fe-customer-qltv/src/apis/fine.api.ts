import api from "@/lib/api";
import type { Fine, FinesResponse, GetFinesParams } from "@/types/fine.type";

export const fineApi = {
  getFines: async (params?: GetFinesParams): Promise<FinesResponse> => {
    const response = await api.get<FinesResponse>("/fines", { params });
    return response.data;
  },

  getFineById: async (id: string): Promise<Fine> => {
    const response = await api.get<Fine>(`/fines/${id}`);
    return response.data;
  },
};
