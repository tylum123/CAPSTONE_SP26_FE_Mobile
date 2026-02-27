import Constants from "expo-constants";
import { API_CONFIG } from "../constants/api";

const extra = Constants.expoConfig?.extra || {};
const isDev = (extra.NODE_ENV || process.env.NODE_ENV) === "development";
const baseUrl = isDev
  ? extra.API_BASE_URL_TEST || extra.API_BASE_URL
  : extra.API_BASE_URL;

// App Configuration
export const CONFIG = {
  // API
  API_BASE_URL: baseUrl || "http://localhost:3000/api",
  API_TIMEOUT: parseInt(extra.API_TIMEOUT || "") || API_CONFIG.TIMEOUT,

  // Feature Flags
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: false,
  ENABLE_PUSH_NOTIFICATIONS: true,

  // App Settings
  DEFAULT_LANGUAGE: "vi",
  CURRENCY: "VND",
  DATE_FORMAT: "DD/MM/YYYY",
  TIME_FORMAT: "HH:mm",

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/jpg"],

  // Validation
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,

  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

console.log("App Configuration:", CONFIG);

export type ConfigType = typeof CONFIG;
