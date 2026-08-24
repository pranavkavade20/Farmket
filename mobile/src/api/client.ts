import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

/**
 * Resolves the API base URL dynamically:
 * - Production: uses EXPO_PUBLIC_API_URL from .env
 * - Dev (physical device / emulator): extracts the host IP from Expo's
 *   dev server URI (e.g. "10.51.121.145:8081") and swaps the port to 8000.
 * - Dev (web): uses localhost.
 */
const getApiUrl = (): string => {
  // Production builds always use the env variable
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!__DEV__ && envUrl) return envUrl;

  // In dev, derive the URL from the Expo dev server host
  if (__DEV__) {
    if (Platform.OS === 'web') return 'http://localhost:8000/api/';

    // Constants.expoConfig?.hostUri is something like "10.51.121.145:8081"
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0]; // "10.51.121.145"
      return `http://${hostIp}:8000/api/`;
    }

    // Fallback for Android emulator if hostUri is unavailable
    if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api/';
    return 'http://localhost:8000/api/';
  }

  return envUrl || 'http://localhost:8000/api/';
};

export const API_URL = getApiUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s timeout prevents infinite loading
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await storage.getRefreshToken();
      
      if (!refreshToken) {
        // No refresh token available, logout user
        await storage.clearTokens();
        // Here you would typically dispatch a logout action or navigate to login
        isRefreshing = false;
        return Promise.reject(error);
      }

      return new Promise(function (resolve, reject) {
        axios.post(`${API_URL}token/refresh/`, { refresh: refreshToken })
          .then(async ({ data }) => {
            const newAccessToken = data.access;
            const newRefreshToken = data.refresh || refreshToken; // Some APIs return a new refresh token too
            
            await storage.setToken(newAccessToken);
            await storage.setRefreshToken(newRefreshToken);
            
            apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            
            processQueue(null, newAccessToken);
            resolve(apiClient(originalRequest));
          })
          .catch(async (err) => {
            processQueue(err, null);
            await storage.clearTokens();
            // Dispatch logout
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);
