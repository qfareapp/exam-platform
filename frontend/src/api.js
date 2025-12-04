import axios from "axios";

const envBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
// Avoid double `/api` when the env already includes it.
const baseURL = envBase
  ? envBase.endsWith("/api")
    ? envBase
    : `${envBase}/api`
  : "/api";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("exam_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
