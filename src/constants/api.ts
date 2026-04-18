/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */
// API Configuration Constants
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_DATA: "userData",
  REFRESH_TOKEN: "refreshToken",
  LANGUAGE: "language",
  THEME: "theme",
} as const;

const API_PREFIX = "/api/v1";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_PREFIX}/login`,
    REGISTER: `${API_PREFIX}/register`,
    GOOGLE_LOGIN: `${API_PREFIX}/google-login`,
    LOGOUT: `${API_PREFIX}/logout`,
    FORGOT_PASSWORD: `${API_PREFIX}/forget`,
    RESET_PASSWORD: `${API_PREFIX}/reset`,
    VERIFY_EMAIL: `${API_PREFIX}/verify-email`,
    RESEND_VERIFICATION: `${API_PREFIX}/resend-verification`,
  },
  // Worker profile
  WORKER_PROFILE: {
    BASE: `${API_PREFIX}/worker`,
    UPLOAD_AVATAR: `${API_PREFIX}/worker/upload-avatar`,
    DASHBOARD: `${API_PREFIX}/worker/dashboard`,
  },
  // User
  USER: {
    PROFILE: `${API_PREFIX}/user/profile`,
    UPDATE_PROFILE: `${API_PREFIX}/user/profile`,
    CHANGE_PASSWORD: `${API_PREFIX}/user/change-password`,
    UPLOAD_AVATAR: `${API_PREFIX}/user/avatar`,
  },
  // Jobs
  JOB: {
    CATEGORY_LIST: `${API_PREFIX}/job/category`,
    CATEGORY_DETAIL: (id: string) => `${API_PREFIX}/job/category/${id}`,
    POST_LIST: `${API_PREFIX}/job/post`,
    POST_DETAIL: (id: string) => `${API_PREFIX}/job/post/${id}`,
    NEARBY: `${API_PREFIX}/job/post/nearby`,
    SEARCH: `${API_PREFIX}/job/post/search`,
    FILTER: `${API_PREFIX}/job/post/filter`,
    BY_DATE: `${API_PREFIX}/job/post/by-date`,
    BY_SKILL: `${API_PREFIX}/job/post/by-skill`,
    BY_WAGE: `${API_PREFIX}/job/post/by-wage`,
    URGENT: `${API_PREFIX}/job/post/urgent`,
    BY_TYPE: `${API_PREFIX}/job/post/by-type`,
    APPLICATION: `${API_PREFIX}/job/application`,
    APPLICATION_WORKER: `${API_PREFIX}/job/application/worker`,
    APPLICATION_DETAIL: (id: string) => `${API_PREFIX}/job/application/${id}`,
    CANCEL_APPLICATION: (id: string) => `${API_PREFIX}/job/application/cancel/${id}`,
    APPLICATION_STATS: `${API_PREFIX}/job/application/worker/stats`,
  },
  // Job Detail (Daily Report replacement for Attendance)
  JOB_DETAIL: {
    REPORT_DAILY: (id: string) => `${API_PREFIX}/job/detail/report/${id}`,
    DETAIL: (id: string) => `${API_PREFIX}/job/detail/${id}`,
    LIST: `${API_PREFIX}/job/detail`,
    WORKER: (workerProfileId: string) => `${API_PREFIX}/job/detail/worker/${workerProfileId}`,
    POST: (jobPostId: string) => `${API_PREFIX}/job/detail/post/${jobPostId}`, // GET - list daily reports by jobPostId
  },
  // Disputes
  DISPUTE: {
    CREATE: `${API_PREFIX}/disputes`,
    MY: `${API_PREFIX}/disputes/mine`,
    DETAIL: (id: string) => `${API_PREFIX}/disputes/${id}`,
  },
  // Media
  MEDIA: {
    UPLOAD_IMAGE: `${API_PREFIX}/media/upload/image`,
  },
  // Ratings & Reviews
  RATING: {
    BASE: `${API_PREFIX}/ratings`,
    CREATE: `${API_PREFIX}/ratings`,
    DETAIL: (id: string) => `${API_PREFIX}/ratings/${id}`,
    DELETE: (id: string) => `${API_PREFIX}/ratings/${id}`,
    USER_SPECIFIC: (userId: string) => `${API_PREFIX}/ratings/user/${userId}`,
    USER_ALL: (userId: string) => `${API_PREFIX}/ratings/user/${userId}/all`,
    USER_AVERAGE: (userId: string) => `${API_PREFIX}/ratings/user/${userId}/average`,
    USER_GIVEN: `${API_PREFIX}/ratings/user/given`,
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: `${API_PREFIX}/notification`,
    UNREAD: `${API_PREFIX}/notification/unread`,
    READ: `${API_PREFIX}/notification/read`, // Note: use PATCH { notificationId: string }
    READ_ALL: `${API_PREFIX}/notification/read-all`,
    DELETE: (id: string) => `${API_PREFIX}/notification/${id}`,
    TOKENS: `${API_PREFIX}/notification/tokens`,
    REGISTER_TOKEN: `${API_PREFIX}/notification/register-token`,
    UNREGISTER_TOKEN: `${API_PREFIX}/notification/unregister-token`,
  },
  // Wallet & Withdrawals
  WALLET: {
    ME: `${API_PREFIX}/wallet/me`,
    TRANSACTIONS: (walletId: string) => `${API_PREFIX}/wallet-transaction/wallet/${walletId}`,
    TRANSACTION_DETAIL:(id: string) => `${API_PREFIX}/wallet-transaction/${id}`,
    WITHDRAW: `${API_PREFIX}/withdraw`,
    WITHDRAW_HISTORY: `${API_PREFIX}/withdraw`, // GET - withdrawal history list (same route, different method)
    ACCOUNT_BALANCE: `${API_PREFIX}/withdraw/account-balance`,
  },
  // Skills
  SKILLS: {
    LIST: `${API_PREFIX}/skills`,
  },
  // Weather
  WEATHER: {
    ME: `${API_PREFIX}/weather/me`,
    COORDINATES: `${API_PREFIX}/weather/coordinates`,
    CITY: `${API_PREFIX}/weather/city`,
  },
  // Messages
  MESSAGES: {
    BASE: `${API_PREFIX}/messages`,
    MARK_AS_READ: `${API_PREFIX}/messages/read`,
    CONVERSATIONS: `${API_PREFIX}/messages/conversations`,
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
  TIMEOUT_ERROR: "Kết nối quá lâu. Vui lòng thử lại.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền truy cập.",
  NOT_FOUND: "Không tìm thấy dữ liệu.",
  SERVER_ERROR: "Lỗi server. Vui lòng thử lại sau.",
  UNKNOWN_ERROR: "Đã có lỗi xảy ra. Vui lòng thử lại.",
} as const;

// Request Headers
export const REQUEST_HEADERS = {
  CONTENT_TYPE_JSON: "application/json",
  CONTENT_TYPE_FORM_DATA: "multipart/form-data",
} as const;
