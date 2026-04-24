export const AUTH_KEYS = {
  ACCESS_TOKEN: 'qltv_access_token',
  REFRESH_TOKEN: 'qltv_refresh_token',
  USER: 'qltv_user',
  READER: 'qltv_reader',
} as const;

export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  ME: "/users/me",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  CHANGE_PASSWORD: "/auth/change-password",
} as const;
