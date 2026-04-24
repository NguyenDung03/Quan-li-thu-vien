import api from "@/lib/api";
import type { User, UpdateUserRequest } from "@/types/auth.type";

export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  updateMe: async (data: UpdateUserRequest): Promise<User> => {
    const response = await api.patch<User>("/users/me", data);
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
};
