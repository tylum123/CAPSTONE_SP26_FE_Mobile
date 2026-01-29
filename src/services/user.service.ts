import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  skills?: string[];
  experience?: string;
  education?: string;
}

// Update profile data
export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  skills?: string[];
  experience?: string;
  education?: string;
}

// Change password data
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// User Service
export const userService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await api.put<UserProfile>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      data,
    );
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await api.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data);
  },

  // Upload avatar
  uploadAvatar: async (file: File | Blob): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post<{ url: string }>(
      API_ENDPOINTS.USER.UPLOAD_AVATAR,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};
