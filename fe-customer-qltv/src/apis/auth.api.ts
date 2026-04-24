import api from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/auth";
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  User,
} from "@/types/auth.type";

/** HTTP auth — dùng từ `AuthProvider` (context), không dùng hook song song. */
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
      API_ENDPOINTS.LOGIN,
      data,
    );
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.FORGOT_PASSWORD,
      data,
    );
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordRequest,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.RESET_PASSWORD,
      data,
    );
    return response.data;
  },

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.CHANGE_PASSWORD,
      data,
    );
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>(API_ENDPOINTS.ME);
    return response.data;
  },
};
