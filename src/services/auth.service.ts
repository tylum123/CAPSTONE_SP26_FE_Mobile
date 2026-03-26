import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse } from "../types";

// Login credentials interface
export interface LoginRequest {
  email?: string;
  phoneNumber?: string;
  password: string;
}

// Register data interface
export interface RegisterRequest {
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  roleId: number;
}

// Google login request
export interface GoogleLoginRequest {
  googleToken: string;
  roleId?: number;
}

// Reset password request
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// Auth response interface
export interface LoginResponse {
  token: string;
  expiresAt: string;
  email: string;
  role: string; // Backend trả về role name (vd: "Worker", "Farmer", "Admin")
}

// Auth Service
export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return response.data.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
    );
    return response.data.data;
  },

  // Google login
  googleLogin: async (data: GoogleLoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
      data,
    );
    return response.data.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },
};
