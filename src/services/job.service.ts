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
  JobDiscoveryDTO,
  WorkerApplicationStatsDTO
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

  getJobsByDate: async (dateFilter: string): Promise<JobDiscoveryDTO[]> => {
    const response = await api.get<ApiResponse<JobDiscoveryDTO[]>>(
      API_ENDPOINTS.JOB.BY_DATE,
      { params: { dateFilter } },
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  getJobsBySkill: async (skills: string): Promise<JobDiscoveryDTO[]> => {
    const response = await api.get<ApiResponse<JobDiscoveryDTO[]>>(
      API_ENDPOINTS.JOB.BY_SKILL,
      { params: { skills } },
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  getJobsByWageRange: async (minWage: number, maxWage?: number): Promise<JobDiscoveryDTO[]> => {
    const response = await api.get<ApiResponse<JobDiscoveryDTO[]>>(
      API_ENDPOINTS.JOB.BY_WAGE,
      { params: { minWage, maxWage } },
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  getUrgentJobs: async (params: {
    latitude: number;
    longitude: number;
    maxDistanceKm?: number;
  }): Promise<JobDiscoveryDTO[]> => {
    const response = await api.get<ApiResponse<JobDiscoveryDTO[]>>(
      API_ENDPOINTS.JOB.URGENT,
      { params },
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
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
      API_ENDPOINTS.JOB.APPLICATION_WORKER,
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
    await api.put(
      API_ENDPOINTS.JOB.CANCEL_APPLICATION(id),
    );
  },

  getWorkerStats: async (): Promise<WorkerApplicationStatsDTO> => {
    const response = await api.get<ApiResponse<WorkerApplicationStatsDTO>>(
      API_ENDPOINTS.JOB.APPLICATION_STATS,
    );
    return response.data.data;
  },
};
