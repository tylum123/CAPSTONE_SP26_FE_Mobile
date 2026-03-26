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
let isLoggingOut = false; // New flag to prevent redundant logouts
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
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      const requestUrl = originalRequest.url || "";
      const isLogoutUrl = requestUrl.toLowerCase().includes("logout");
      const isAuthRequest =
        requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.REGISTER) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.GOOGLE_LOGIN) ||
        isLogoutUrl;

      const errorMessage = (error.response?.data as any)?.message || "";
      const isProfileNotFound = errorMessage.toLowerCase().includes("profile not found");

      if (!isAuthRequest && !isProfileNotFound && !isLoggingOut) {
        console.log("Axios: 401 Unauthorized detected. URL:", requestUrl, "Message:", errorMessage);
        
        const isOnboardingRequest = requestUrl.includes("/worker") || requestUrl.includes("/user/profile");
        
        if (!isOnboardingRequest) {
          isLoggingOut = true;
          try {
            const { forceLogout } = require("../context/AuthContext");
            await forceLogout();
          } finally {
            isLoggingOut = false;
          }
        }
      }
    }

    // Handle network errors (Backend Down -> "Sập")
    if (error.message === "Network Error" || error.code === "ECONNABORTED" || error.response?.status === 502 || error.response?.status === 503) {
      // Don't force logout on simple network errors, just let the screen handle the failure state
      console.log("Network error or server hiccup detected.");
    }

    return Promise.reject(error);
  },
);


export default api;
