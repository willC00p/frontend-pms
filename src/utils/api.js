import axios from "axios";
import { getToken } from "./auth";

// Create axios instance with base API URL and enable credentials for CSRF
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Attach token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to initialize Sanctum CSRF cookie
export const initCsrf = async () => {
  // Try to derive the backend origin from the api instance baseURL.
  // If baseURL is like 'http://localhost:8000/api' we want 'http://localhost:8000'.
  const base = (api.defaults && api.defaults.baseURL) || "http://localhost:8000/api";
  const origin = base.replace(/\/api\/?$/, "");

  const candidates = [
    // common Laravel-sanctum locations (try api-prefixed first since this project registers it under /api)
    `${origin}/api/csrf-cookie`,
    `${origin}/api/sanctum/csrf-cookie`,
    // prefer configured origin
    `${origin}/sanctum/csrf-cookie`,
    // fallbacks (some dev setups use 127.0.0.1)
    `${origin.replace('localhost', '127.0.0.1')}/api/csrf-cookie`,
    `${origin.replace('localhost', '127.0.0.1')}/sanctum/csrf-cookie`,
    `${origin.replace('127.0.0.1', 'localhost')}/api/csrf-cookie`,
    `${origin.replace('127.0.0.1', 'localhost')}/sanctum/csrf-cookie`,
    // final fallback to relative paths
    `/api/csrf-cookie`,
    `/sanctum/csrf-cookie`,
  ];

  let lastErr = null;
  for (const url of candidates) {
    try {
      const res = await axios.get(url, { withCredentials: true });
      // success
      return res;
    } catch (err) {
      lastErr = err;
      // Log debug info for the attempted URL — keep it concise but useful
      console.debug(`CSRF init failed for ${url}:`, err.response?.status, err.message || err);
      // try next candidate
    }
  }

  // If we get here, all attempts failed — surface a helpful console error
  console.error('Failed to init CSRF cookie; tried candidates:', candidates, 'last error:', lastErr?.response?.status, lastErr?.message || lastErr);
  // Re-throw so callers can handle failure if they want
  throw lastErr;
};

// Make initCsrf available as a method on the api instance for convenience
api.initCsrf = initCsrf;

export default api;
