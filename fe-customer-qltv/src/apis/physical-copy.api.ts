import api from "@/lib/api";
import type {
  PhysicalCopy,
  PhysicalCopiesResponse,
  GetPhysicalCopiesParams,
} from "@/types/ebook.type";

export const physicalCopyApi = {
  getPhysicalCopies: async (
    params?: GetPhysicalCopiesParams,
  ): Promise<PhysicalCopiesResponse> => {
    const response = await api.get<PhysicalCopiesResponse>("/physical-copies", {
      params,
    });
    return response.data;
  },

  getPhysicalCopyById: async (id: string): Promise<PhysicalCopy> => {
    const response = await api.get<PhysicalCopy>(`/physical-copies/${id}`);
    return response.data;
  },
};
