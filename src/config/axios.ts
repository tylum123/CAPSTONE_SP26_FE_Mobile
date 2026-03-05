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
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      const requestUrl = error.config?.url || "";
      const isAuthRequest =
        requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.REGISTER) ||
        requestUrl.includes(API_ENDPOINTS.AUTH.GOOGLE_LOGIN);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (!isAuthRequest && token) {
        // Clear token and redirect to login
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        // You can add navigation to login screen here
        // navigationRef.current?.navigate('Login');
        // Suppress terminal log; handle UI messaging elsewhere if needed
      }
    }

    // Handle network errors
    if (error.message === "Network Error") {
      console.error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      console.error(ERROR_MESSAGES.TIMEOUT_ERROR);
    }

    return Promise.reject(error);
  },
);

export default api;
