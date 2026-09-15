import API from "@/utils/axiosInstance";
import { parseApiError } from "@/lib/errors";
import store from "@/redux/store";
import { setUser } from "@/redux/authSlice";

/**
 * Normalizes backend list responses that may be shaped as:
 * { success: true, data: { [key]: [...] } }
 * or { success: true, [key]: [...] }
 * or { data: [...] }
 * or direct array.
 */
export function unwrapList(res, key) {
  if (!res) return [];
  const payload = res?.data !== undefined ? res.data : res;
  if (!payload) return [];

  // 1. Direct data[key] or data.data[key]
  if (key && Array.isArray(payload?.[key])) {
    return payload[key];
  }
  if (key && Array.isArray(payload?.data?.[key])) {
    return payload.data[key];
  }

  // 2. Singular/plural tolerance if key provided
  if (key && typeof key === "string") {
    const alternateKey = key.endsWith("s") ? key.slice(0, -1) : `${key}s`;
    if (Array.isArray(payload?.[alternateKey])) {
      return payload[alternateKey];
    }
    if (Array.isArray(payload?.data?.[alternateKey])) {
      return payload.data[alternateKey];
    }
  }

  // 3. Fallback to direct array if payload or payload.data is an array
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

/**
 * Normalizes single item responses:
 * { success: true, data: { [key]: { ... } } }
 * or { success: true, [key]: { ... } }
 */
export function unwrapItem(res, key) {
  if (!res) return null;
  const payload = res?.data !== undefined ? res.data : res;
  if (!payload) return null;

  if (key && payload?.[key] !== undefined) {
    return payload[key];
  }
  if (key && payload?.data?.[key] !== undefined) {
    return payload.data[key];
  }
  if (payload?.data !== undefined) {
    return payload.data;
  }
  return payload;
}

/**
 * Extracts pagination object from API response.
 */
export function unwrapPagination(res) {
  if (!res) return null;
  const payload = res?.data !== undefined ? res.data : res;
  return payload?.pagination || payload?.data?.pagination || null;
}

// Attach response interceptor for error classification and 401 handling
if (API && API.interceptors && API.interceptors.response) {
  API.interceptors.response.use(
    (response) => response,
    (error) => {
      const normalized = parseApiError(error);

      // Handle 401 Unauthorized
      if (normalized.status === 401) {
        try {
          store.dispatch(setUser(null));
        } catch (dispatchErr) {
          console.warn("Could not dispatch setUser(null) on 401:", dispatchErr);
        }

        if (typeof window !== "undefined" && window.location) {
          const pathname = window.location.pathname;
          const search = window.location.search;
          const currentPath = pathname + search;
          const isAuthScreen =
            pathname === "/login" ||
            pathname === "/register" ||
            pathname === "/forgot-password" ||
            pathname === "/reset-password";

          const requestUrl = error?.config?.url || "";
          const isAuthRequest =
            requestUrl.includes("/login") ||
            requestUrl.includes("/register") ||
            requestUrl.includes("/forgot-password") ||
            requestUrl.includes("/reset-password");

          // Avoid infinite redirect loops on auth pages or failed login attempts
          if (!isAuthScreen && !isAuthRequest) {
            const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
            window.location.href = redirectUrl;
          }
        }
      }

      return Promise.reject(normalized);
    }
  );
}

export const http = {
  get: (url, config) => API.get(url, config),
  post: (url, data, config) => API.post(url, data, config),
  put: (url, data, config) => API.put(url, data, config),
  patch: (url, data, config) => API.patch(url, data, config),
  delete: (url, config) => API.delete(url, config),
  unwrapList,
  unwrapItem,
  unwrapPagination,
};

export { API };
export default http;
