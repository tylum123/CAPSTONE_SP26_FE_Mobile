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
    return response.data.data;
  },

  /**
   * Worker: Get worker's reports
   */
  getWorkerReports: async (workerProfileId: string): Promise<JobDetailDTO[]> => {
    const url = API_ENDPOINTS.JOB_DETAIL.WORKER(workerProfileId);
    const response = await api.get<ApiResponse<JobDetailDTO[]>>(url);
    return response.data.data || [];
  },

  /**
   * Worker: Submit daily report
   */
  submitDailyReport: async (data: CreateDailyReportRequest): Promise<JobDetailDTO> => {
    const response = await api.post<ApiResponse<JobDetailDTO>>(
      API_ENDPOINTS.JOB_DETAIL.REPORT_DAILY,
      data
    );
    return response.data.data;
  },
};
