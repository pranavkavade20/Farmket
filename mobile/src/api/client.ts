import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import { getApiBaseUrl, logApiDiagnostic } from './config';

export const API_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Check if a URL is an unauthenticated public auth route
const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.includes('accounts/login') ||
    url.includes('accounts/register') ||
    url.includes('token/refresh') ||
    url.includes('token/')
  );
};

// Request interceptor: Attach JWT token only to protected endpoints
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isAuthRoute = isAuthEndpoint(config.url);
    
    if (!isAuthRoute) {
      const token = await storage.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (config.headers && config.headers.Authorization) {
      // Remove any accidental auth header on login/register endpoints
      delete config.headers.Authorization;
    }

    logApiDiagnostic(`REQ [${config.method?.toUpperCase()}]`, {
      url: `${config.baseURL}${config.url}`,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 token refresh queue for protected requests ONLY
apiClient.interceptors.response.use(
  (response) => {
    logApiDiagnostic(`RES [${response.status}]`, { url: response.config.url });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Never attempt token refresh on login/register/refresh endpoints
    const isAuthRoute = isAuthEndpoint(originalRequest?.url);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) {
        await storage.clearTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      return new Promise(function (resolve, reject) {
        axios
          .post(`${API_URL}token/refresh/`, { refresh: refreshToken })
          .then(async ({ data }) => {
            const newAccessToken = data.access;
            const newRefreshToken = data.refresh || refreshToken;

            await storage.setToken(newAccessToken);
            await storage.setRefreshToken(newRefreshToken);

            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            processQueue(null, newAccessToken);
            resolve(apiClient(originalRequest));
          })
          .catch(async (err) => {
            processQueue(err, null);
            await storage.clearTokens();
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    logApiDiagnostic(`ERR [${error.response?.status || 'NETWORK'}]`, {
      url: originalRequest?.url,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

/**
 * Normalizes backend error responses into clean, user-friendly strings.
 */
export const normalizeApiError = (error: unknown, fallbackMessage = 'An unexpected error occurred.'): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Connection timed out. Please check your internet connection.';
    }
    if (!error.response) {
      return 'Unable to reach Farmket server. Please verify your network and server status.';
    }

    const status = error.response.status;
    const data = error.response.data as Record<string, any>;
    const requestUrl = error.config?.url || '';

    // If 401 on login endpoint
    if (status === 401 && (requestUrl.includes('login') || requestUrl.includes('token'))) {
      return 'Incorrect email or password. Please verify your credentials and try again.';
    }

    // Handle DRF validation errors dictionary { field: ["error message"] }
    if (typeof data === 'object' && data !== null) {
      if (data.detail && typeof data.detail === 'string') {
        if (data.detail.toLowerCase().includes('no active account')) {
          return 'No account found with these credentials. Please check your email or create an account.';
        }
        return data.detail;
      }
      if (data.error && typeof data.error === 'string') return data.error;
      if (data.message && typeof data.message === 'string') return data.message;

      const keys = Object.keys(data);
      if (keys.length > 0) {
        const firstValue = data[keys[0]];
        if (Array.isArray(firstValue) && firstValue.length > 0) {
          return `${keys[0].replace(/_/g, ' ')}: ${firstValue[0]}`;
        }
        if (typeof firstValue === 'string') {
          return firstValue;
        }
      }
    }

    if (status === 401) {
      return 'Session expired. Please log in again.';
    }
    if (status === 403) {
      return data?.detail || data?.error || 'You do not have permission to perform this action.';
    }
    if (status === 404) {
      return data?.detail || data?.error || 'The requested resource was not found.';
    }
    if (status >= 500) {
      return 'Farmket server error. Our team has been notified. Please try again later.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};
