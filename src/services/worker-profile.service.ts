import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse } from "../types";
import { authTokenService } from "./auth-token.service";

export interface WorkerProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  ageRange: string;
  primaryLocation: string;
  travelRadiusKmPreference?: number | null;
  experienceLevelId: number;
  experienceLevel: string;
  averageRating: number;
  availabilitySchedule: string;
  totalJobsCompleted: number;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateWorkerProfileRequest {
  fullName: string;
  ageRange: string;
  primaryLocation: string;
  travelRadiusKmPreference?: number | null;
  experienceLevelId: number;
  availabilitySchedule: string;
  avatarUrl: string;
}

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
};
