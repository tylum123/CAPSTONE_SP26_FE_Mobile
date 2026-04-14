/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse } from "../types/export_type_definitions";

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

  // Register - Backend logic update: No longer returns token on registration
  // Account is created in pending state, OTP is sent to user email.
  register: async (data: RegisterRequest): Promise<void> => {
    await api.post<ApiResponse<any>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
    );
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
  
  // Resend verification code
  resendVerification: async (email: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
  },

  // Verify Email with OTP
  verifyEmail: async (email: string, otp: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, otp });
  },
};
