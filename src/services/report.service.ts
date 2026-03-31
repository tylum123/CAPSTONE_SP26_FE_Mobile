/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, JobDetailDTO, CreateDailyReportRequest, ApproveJobDetailRequest } from "../types/export_type_definitions";

export const reportService = {
  /**
   * Worker/Farmer: Get specific report details
   */
  getReportById: async (id: string): Promise<JobDetailDTO> => {
    const response = await api.get<ApiResponse<JobDetailDTO>>(
      API_ENDPOINTS.JOB_DETAIL.DETAIL(id)
    );
    // @ts-ignore
    return response.data.data || response.data;
  },

  /**
   * Worker: Get worker's reports
   */
  getWorkerReports: async (workerProfileId: string): Promise<JobDetailDTO[]> => {
    const url = API_ENDPOINTS.JOB_DETAIL.WORKER(workerProfileId);
    const response = await api.get<ApiResponse<JobDetailDTO[]>>(url);
    // @ts-ignore
    return response.data.data || Object.values(response.data) || [];
  },

  /**
   * Worker: Submit daily report
   */
  submitDailyReport: async (data: CreateDailyReportRequest): Promise<JobDetailDTO> => {
    const response = await api.post<ApiResponse<JobDetailDTO>>(
      API_ENDPOINTS.JOB_DETAIL.REPORT_DAILY,
      data
    );
    // @ts-ignore
    return response.data.data || response.data;
  },

  /**
   * Farmer: Get all daily reports in farm (Job Post)
   */
  getFarmReports: async (jobPostId: string): Promise<JobDetailDTO[]> => {
    const response = await api.get<ApiResponse<JobDetailDTO[]>>(
      API_ENDPOINTS.JOB_DETAIL.FARM(jobPostId)
    );
    // @ts-ignore
    return response.data.data || Object.values(response.data) || [];
  },
  
  /**
   * Farmer: Evaluate/Approve report
   */
  evaluateReport: async (id: string, data: ApproveJobDetailRequest): Promise<void> => {
    await api.post<ApiResponse<void>>(
      API_ENDPOINTS.JOB_DETAIL.APPROVE(id),
      data
    );
  }
};
