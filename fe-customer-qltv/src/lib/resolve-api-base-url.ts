/**
 * Chuẩn hóa base URL API (luôn kết thúc bằng `/api`) để dùng chung cho axios, SSE, chat.
 */
export function getResolvedApiBaseUrl(): string {
  const rawBase =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  const normalized = rawBase.replace(/\/+$/, "");
  return normalized.endsWith("/api")
    ? normalized
    : `${normalized}/api`;
}
