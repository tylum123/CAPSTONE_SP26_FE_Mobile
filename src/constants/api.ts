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
    REFRESH_TOKEN: `${API_PREFIX}/refresh`,
    FORGOT_PASSWORD: `${API_PREFIX}/forget`,
    RESET_PASSWORD: `${API_PREFIX}/reset`,
    VERIFY_EMAIL: `${API_PREFIX}/verify-email`,
  },
  // Worker profile
  WORKER_PROFILE: {
    BASE: `${API_PREFIX}/worker`,
    UPLOAD_AVATAR: `${API_PREFIX}/worker/upload-avatar`,
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
    APPLICATION: `${API_PREFIX}/job/application`,
    APPLICATION_DETAIL: (id: string) => `${API_PREFIX}/job/application/${id}`,
  },
  // Attendance
  ATTENDANCE: {
    CHECK_IN: `${API_PREFIX}/attendance/check-in`,
    CHECK_OUT: `${API_PREFIX}/attendance/check-out`,
    APPROVE: `${API_PREFIX}/attendance/approve`,
    DETAIL: (id: string) => `${API_PREFIX}/attendance/${id}`,
    WORKER: (workerProfileId: string) =>
      `${API_PREFIX}/attendance/worker/${workerProfileId}`,
    FARM: (farmerProfileId: string) =>
      `${API_PREFIX}/attendance/farm/${farmerProfileId}`,
    FARM_WORKER: (farmerProfileId: string, workerProfileId: string) =>
      `${API_PREFIX}/attendance/farm/${farmerProfileId}/worker/${workerProfileId}`,
  },
  // Media
  MEDIA: {
    UPLOAD_IMAGE: `${API_PREFIX}/media/upload/image`,
  },
  // Reviews
  REVIEWS: {
    LIST: `${API_PREFIX}/reviews`,
    CREATE: `${API_PREFIX}/reviews`,
    UPDATE: (id: string) => `${API_PREFIX}/reviews/${id}`,
    DELETE: (id: string) => `${API_PREFIX}/reviews/${id}`,
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: `${API_PREFIX}/notification`,
    UNREAD: `${API_PREFIX}/notification/unread`,
    READ: `${API_PREFIX}/notification/read`, // Note: use PATCH { notificationId: string }
    READ_ALL: `${API_PREFIX}/notification/read-all`,
    DELETE: (id: string) => `${API_PREFIX}/notification/${id}`,
    REGISTER_TOKEN: `${API_PREFIX}/notification/register-token`,
  },
  // Wallet
  WALLET: {
    BALANCE: `${API_PREFIX}/wallet/balance`,
    TRANSACTIONS: `${API_PREFIX}/wallet/transactions`,
    WITHDRAW: `${API_PREFIX}/wallet/withdraw`,
  },
  // Chat
  CHAT: {
    CONVERSATIONS: `${API_PREFIX}/chat/conversations`,
    MESSAGES: (conversationId: string) =>
      `${API_PREFIX}/chat/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId: string) =>
      `${API_PREFIX}/chat/conversations/${conversationId}/messages`,
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
