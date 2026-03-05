import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse } from "../types";

export interface JobCategoryDTO {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface JobPostDTO {
  id: string;
  farmerProfileId: string;
  jobCategoryId: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  workersNeeded: number;
  workersAccepted: number;
  wageTypeId: string;
  wageAmount: number;
  paymentMethodId: string;
  requiredSkills: string;
  genderPreference: string;
  ageRequirement: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isUrgent: boolean;
  statusId: string;
}

export const jobService = {
  getCategories: async (): Promise<JobCategoryDTO[]> => {
    const response = await api.get<ApiResponse<JobCategoryDTO[]>>(
      API_ENDPOINTS.JOB.CATEGORY_LIST,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  getCategoryDetail: async (id: string): Promise<JobCategoryDTO> => {
    const response = await api.get<ApiResponse<JobCategoryDTO>>(
      API_ENDPOINTS.JOB.CATEGORY_DETAIL(id),
    );
    return response.data.data;
  },

  getJobPosts: async (): Promise<JobPostDTO[]> => {
    const response = await api.get<ApiResponse<JobPostDTO[]>>(
      API_ENDPOINTS.JOB.POST_LIST,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  getJobPostDetail: async (id: string): Promise<JobPostDTO> => {
    const response = await api.get<ApiResponse<JobPostDTO>>(
      API_ENDPOINTS.JOB.POST_DETAIL(id),
    );
    return response.data.data;
  },
};
