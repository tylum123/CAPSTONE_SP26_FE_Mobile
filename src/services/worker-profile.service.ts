/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, WorkerProfileDTO, UpdateWorkerProfileRequest, WorkerDashboardResponseDTO } from "../types/export_type_definitions";

// Use JWT token directly for worker profile APIs
export const workerProfileService = {
  getProfile: async (): Promise<WorkerProfileDTO> => {
    const response = await api.get<ApiResponse<WorkerProfileDTO>>(
      API_ENDPOINTS.WORKER_PROFILE.BASE,
    );
    return response.data.data;
  },

  updateProfile: async (
    data: UpdateWorkerProfileRequest,
  ): Promise<WorkerProfileDTO> => {
    const response = await api.put<ApiResponse<WorkerProfileDTO>>(
      API_ENDPOINTS.WORKER_PROFILE.BASE,
      data,
    );
    return response.data.data;
  },

  uploadAvatar: async (imageFile: any): Promise<string> => {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.WORKER_PROFILE.UPLOAD_AVATAR,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },
  
  getDashboardData: async (): Promise<WorkerDashboardResponseDTO> => {
    const response = await api.get<ApiResponse<WorkerDashboardResponseDTO>>(
      API_ENDPOINTS.WORKER_PROFILE.DASHBOARD,
    );
    return response.data.data;
  },
};
