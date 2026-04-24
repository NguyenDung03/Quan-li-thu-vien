import { AUTH_KEYS, API_ENDPOINTS } from "@/constants/auth";
import axios from "axios";
import { getResolvedApiBaseUrl } from "@/lib/resolve-api-base-url";

const api = axios.create({
  baseURL: getResolvedApiBaseUrl(),
  timeout: import.meta.env.VITE_API_TIMEOUT
    ? Number(import.meta.env.VITE_API_TIMEOUT)
    : 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

function isPublicAuthFailureRequest(config: { url?: string } | undefined) {
  const u = config?.url ?? "";
  return (
    u.includes(API_ENDPOINTS.LOGIN) ||
    u.includes(API_ENDPOINTS.FORGOT_PASSWORD) ||
    u.includes(API_ENDPOINTS.RESET_PASSWORD)
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthFailureRequest(originalRequest)
    ) {
      originalRequest._retry = true;
      localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_KEYS.USER);
      localStorage.removeItem(AUTH_KEYS.READER);
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
