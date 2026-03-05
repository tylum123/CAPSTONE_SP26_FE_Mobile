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

const resolveCurrentUserId = async (): Promise<string | null> => {
  return authTokenService.getCurrentUserId();
};

export const workerProfileService = {
  getProfile: async (userId?: string): Promise<WorkerProfileDTO> => {
    const resolvedUserId = userId || (await resolveCurrentUserId());

    if (resolvedUserId) {
      const response = await api.get<ApiResponse<WorkerProfileDTO>>(
        API_ENDPOINTS.WORKER_PROFILE.BY_USER_ID(resolvedUserId),
      );
      return response.data.data;
    }

    const fallbackResponse = await api.get<ApiResponse<WorkerProfileDTO>>(
      API_ENDPOINTS.WORKER_PROFILE.BASE,
    );
    return fallbackResponse.data.data;
  },

  updateProfile: async (
    data: UpdateWorkerProfileRequest,
    userId?: string,
  ): Promise<WorkerProfileDTO> => {
    const resolvedUserId = userId || (await resolveCurrentUserId());

    if (resolvedUserId) {
      const response = await api.put<ApiResponse<WorkerProfileDTO>>(
        API_ENDPOINTS.WORKER_PROFILE.BY_USER_ID(resolvedUserId),
        data,
      );
      return response.data.data;
    }

    const fallbackResponse = await api.put<ApiResponse<WorkerProfileDTO>>(
      API_ENDPOINTS.WORKER_PROFILE.BASE,
      data,
    );
    return fallbackResponse.data.data;
  },
};
