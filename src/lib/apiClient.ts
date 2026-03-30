import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  withCredentials: true,
  timeout: 10000,
});

let interceptorRegistered = false;

export function registerApiInterceptors() {
  if (interceptorRegistered) return;

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status as number | undefined;
      if (status === 401) {
        window.location.assign("/error/401");
      } else if (status === 403) {
        window.location.assign("/error/403");
      } else if (status && status >= 500) {
        window.location.assign("/error/500");
      }
      return Promise.reject(error);
    },
  );

  interceptorRegistered = true;
}
