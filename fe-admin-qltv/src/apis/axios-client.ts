import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { READER_KEY, TOKEN_KEY, USER_KEY } from "@/constants/auth-storage";
import { triggerUnauthorizedRedirect } from "@/lib/auth-navigation";
import { queryClient } from "@/lib/query-client";

export { READER_KEY, TOKEN_KEY, USER_KEY } from "@/constants/auth-storage";

export function normalizeAxiosBackendBaseUrl(raw: string): string {
  let base = String(raw || "http://localhost:8090")
    .trim()
    .replace(/\/+$/, "");
  if (base.endsWith("/api")) {
    base = base.slice(0, -"/api".length).replace(/\/+$/, "");
  }
  return base || "http://localhost:8090";
}

export function getBackendApiRoot(): string {
  const origin = normalizeAxiosBackendBaseUrl(
    import.meta.env.VITE_API_URL || "http://localhost:8090",
  );
  return `${origin}/api`;
}

const API_BASE_URL = normalizeAxiosBackendBaseUrl(
  import.meta.env.VITE_API_URL || "http://localhost:8090",
);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

function isAuthLoginRequest(
  config: InternalAxiosRequestConfig | undefined,
): boolean {
  const url = config?.url ?? "";
  return url.includes("auth/login");
}

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          if (isAuthLoginRequest(error.config)) {
            return Promise.reject(error);
          }
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(READER_KEY);
          queryClient.clear();
          triggerUnauthorizedRedirect();
          break;
        case 403:
          break;
        case 404:
          break;
        case 500:
          break;
      }
    } else if (error.request) {
      console.error("Network error:", error.request);
    } else {
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
