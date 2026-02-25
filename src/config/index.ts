import { API_BASE_URL, API_BASE_URL_TEST, API_TIMEOUT } from "@env";
import { API_CONFIG } from "../constants/api";

const url =
  process.env.NODE_ENV === "development" ? API_BASE_URL_TEST : API_BASE_URL;

// App Configuration
export const CONFIG = {
  // API
  API_BASE_URL: url || "http://localhost:3000/api",
  API_TIMEOUT: parseInt(API_TIMEOUT) || API_CONFIG.TIMEOUT,

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
