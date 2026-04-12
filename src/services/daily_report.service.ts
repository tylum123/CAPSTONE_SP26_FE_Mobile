/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, JobDetailDTO, CreateDailyReportRequest } from "../types/export_type_definitions";

export const dailyReportService = {
  /**
   * Worker/Farmer: Get specific report details
   */
  getReportById: async (id: string): Promise<JobDetailDTO> => {
    const response = await api.get<ApiResponse<JobDetailDTO>>(
      API_ENDPOINTS.JOB_DETAIL.DETAIL(id)
    );
    return response.data?.data;
  },

  /**
   * Worker/Farmer: Get all daily reports (paginated)
   */
  getAllReports: async (params?: { pageNumber?: number; pageSize?: number }): Promise<JobDetailDTO[]> => {
    const response = await api.get<ApiResponse<any>>(
      API_ENDPOINTS.JOB_DETAIL.LIST,
      { params }
    );
    const responseData = response.data?.data;
    if (Array.isArray(responseData)) return responseData;
    if (responseData && Array.isArray(responseData.items)) return responseData.items;
    return [];
  },

  /**
   * Worker: Get worker's reports
   */
  getWorkerReports: async (workerProfileId: string): Promise<JobDetailDTO[]> => {
    const url = API_ENDPOINTS.JOB_DETAIL.WORKER(workerProfileId);
    const response = await api.get<ApiResponse<any>>(url);
    const responseData = response.data?.data;

    // Handle both direct array and paginated response (items or data field)
    if (Array.isArray(responseData)) {
      return responseData;
    } else if (responseData && Array.isArray(responseData.items)) {
      return responseData.items;
    } else if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    
    return [];
  },

  /**
   * Worker: Submit daily report
   */
  submitDailyReport: async (id: string, data: CreateDailyReportRequest): Promise<JobDetailDTO> => {
    const response = await api.post<ApiResponse<JobDetailDTO>>(
      API_ENDPOINTS.JOB_DETAIL.REPORT_DAILY(id),
      data
    );
    return response.data?.data;
  },

  /**
   * Get reports by job post ID (any worker's reports).
   * Used to extract farmer info (avatarUrl, userId) when current worker has no reports yet.
   */
  getReportsByJobPostId: async (jobPostId: string, page: number = 1, limit: number = 1): Promise<JobDetailDTO[]> => {
    const url = API_ENDPOINTS.JOB_DETAIL.POST(jobPostId);
    const response = await api.get<ApiResponse<any>>(url, { params: { page, limit } });
    const responseData = response.data?.data;

    if (Array.isArray(responseData)) return responseData;
    if (responseData && Array.isArray(responseData.items)) return responseData.items;
    if (responseData && Array.isArray(responseData.data)) return responseData.data;
    return [];
  },
};
