/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import { 
  ApiResponse, 
  CreateJobApplicationRequest, 
  JobApplicationDTO, 
  JobPostDTO, 
  JobCategoryDTO,
  JobSearchFilterRequest,
  PaginatedJobDiscoveryResponse,
  JobDiscoveryDTO
} from "../types/export_type_definitions";

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

  getNearbyJobs: async (params: {
    latitude: number;
    longitude: number;
    maxDistanceKm?: number;
  }): Promise<JobDiscoveryDTO[]> => {
    const response = await api.get<ApiResponse<JobDiscoveryDTO[]>>(
      API_ENDPOINTS.JOB.NEARBY,
      { params },
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  searchJobs: async (
    data: JobSearchFilterRequest,
  ): Promise<PaginatedJobDiscoveryResponse> => {
    const response = await api.post<ApiResponse<PaginatedJobDiscoveryResponse>>(
      API_ENDPOINTS.JOB.SEARCH,
      data,
    );
    return response.data.data;
  },

  filterJobs: async (params: {
    title?: string;
    category?: string;
    address?: string;
    skill?: string;
  }): Promise<JobPostDTO[]> => {
    const response = await api.get<ApiResponse<JobPostDTO[]>>(
      API_ENDPOINTS.JOB.FILTER,
      { params },
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

  cancelApplication: async (id: string): Promise<void> => {
    await api.delete(
      API_ENDPOINTS.JOB.CANCEL_APPLICATION(id),
    );
  },
};
