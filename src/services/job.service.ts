import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, CreateJobApplicationRequest, JobApplicationDTO } from "../types";

export interface JobCategoryDTO {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface JobSkillRequirementSummaryDTO {
  id: string;
  name: string;
}

export interface JobPostDTO {
  id: string;
  farmerProfileId: string;
  contactName: string;
  jobSkillRequirements: JobSkillRequirementSummaryDTO[];
  farmId: string;
  jobCategoryId: string;
  title: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  workersNeeded: number;
  workersAccepted: number;
  wageTypeId: number;
  wageAmount: number;
  paymentMethodId: number;
  requiredSkills: string;
  genderPreference: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isUrgent: boolean;
  status: string;
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

  applyJob: async (data: CreateJobApplicationRequest): Promise<JobApplicationDTO> => {
    const response = await api.post<ApiResponse<JobApplicationDTO>>(
      API_ENDPOINTS.JOB.APPLICATION,
      data,
    );
    return response.data.data;
  },

  getApplications: async (): Promise<JobApplicationDTO[]> => {
    const response = await api.get<ApiResponse<JobApplicationDTO[]>>(
      API_ENDPOINTS.JOB.APPLICATION,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  getApplicationDetail: async (id: string): Promise<JobApplicationDTO> => {
    const response = await api.get<ApiResponse<JobApplicationDTO>>(
      API_ENDPOINTS.JOB.APPLICATION_DETAIL(id),
    );
    return response.data.data;
  },
};
