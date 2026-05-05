/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { CONFIG } from "./export_configurations";
import {
  REQUEST_HEADERS,
  HTTP_STATUS,
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
let isLoggingOut = false; // New flag to prevent redundant logouts

api.interceptors.response.use(
  (response) => {
    // Handle logical failures disguised as HTTP 200
    const bodyStatus = response.data?.status_code;
    if (bodyStatus && bodyStatus >= 400) {
      return Promise.reject({
        response: response,
        message: response.data?.message || "Logical failure detected in API body",
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const responseData = error.response?.data as any;
    const bodyStatus = responseData?.status_code;
    const httpStatus = error.response?.status;

    // Handle 401 Unauthorized
    if (httpStatus === HTTP_STATUS.UNAUTHORIZED || bodyStatus === 401) {
      const requestUrl = originalRequest.url || "";
      const isLogoutUrl = requestUrl.toLowerCase().includes("logout");
      const isAuthRequest =
        requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.REGISTER) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.GOOGLE_LOGIN) ||
        isLogoutUrl;

      const errorMessage = responseData?.message || "";
      const isProfileNotFound = errorMessage.toLowerCase().includes("profile not found");
      const hasAuthHeader = !!originalRequest.headers.Authorization;
      const isLoggingOutManual = authTokenService.getIsLoggingOut();

      if (!isAuthRequest && !isProfileNotFound && !isLoggingOut && !isLoggingOutManual && hasAuthHeader) {
        console.log("Axios: 401 Unauthorized detected. BodyStatus:", bodyStatus, "URL:", requestUrl);
        
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

    // Handle network errors (Backend Down)
    if (error.message === "Network Error" || error.code === "ECONNABORTED" || httpStatus === 502 || httpStatus === 503) {
      console.log("Network error or server hiccup detected.");
    }

    return Promise.reject(error);
  },
);


export default api;
