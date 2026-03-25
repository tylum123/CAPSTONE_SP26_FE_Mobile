import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG } from "./index";
import {
  STORAGE_KEYS,
  REQUEST_HEADERS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  API_ENDPOINTS,
} from "../constants/api";
import { authTokenService } from "../services/auth-token.service";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.API_TIMEOUT,
  headers: {
    "Content-Type": REQUEST_HEADERS.CONTENT_TYPE_JSON,
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get token from memory cache or AsyncStorage
      const token = await authTokenService.getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      // Silent error in interceptor
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
let isRefreshing = false;
let failedQueue: any[] = [];

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      const requestUrl = originalRequest.url || "";
      const isAuthRequest =
        requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.REGISTER) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.GOOGLE_LOGIN) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN);

      if (!isAuthRequest) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          try {
            // Use a clean axios instance to avoid interceptor loop for refresh
            const refreshResponse = await axios.post(`${api.defaults.baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
              refreshToken,
            });

            const { token: newToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

            await AsyncStorage.multiSet([
              [STORAGE_KEYS.AUTH_TOKEN, newToken],
              [STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken || refreshToken],
            ]);
            authTokenService.setTokenToMemory(newToken);

            processQueue(null, newToken);
            isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;
            // Force logout from AuthContext reference exported earlier
            const { forceLogout } = require("../context/AuthContext");
            await forceLogout();
          }
        } else {
          const { forceLogout } = require("../context/AuthContext");
          await forceLogout();
        }
      }
    }

    // Handle network errors (Backend Down -> "Sập")
    // As per user request: "nếu backend sập thì phải bặt người dùng out khỏi app ra màn hình login liền"
    if (error.message === "Network Error" || error.code === "ECONNABORTED" || error.response?.status === 502 || error.response?.status === 503) {
      const { forceLogout } = require("../context/AuthContext");
      await forceLogout();
    }

    return Promise.reject(error);
  },
);


export default api;
