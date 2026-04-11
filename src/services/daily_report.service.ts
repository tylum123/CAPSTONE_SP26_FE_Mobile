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
};
