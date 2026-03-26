import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { JobDetailDTO, CreateDailyReportRequest, ApproveJobDetailRequest } from "../types";

export const reportService = {
  /**
   * Worker/Farmer: Get specific report details
   */
  getReportById: async (id: string): Promise<JobDetailDTO> => {
    const response = await api.get<{ message: string; status_code: number; data: JobDetailDTO }>(
      API_ENDPOINTS.JOB_DETAIL.DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Worker: Get worker's reports
   */
  getWorkerReports: async (workerProfileId: string): Promise<JobDetailDTO[]> => {
    const url = API_ENDPOINTS.JOB_DETAIL.WORKER(workerProfileId);
    const response = await api.get<{ message: string; status_code: number; data: JobDetailDTO[] }>(url);
    return response.data.data || [];
  },

  /**
   * Worker: Submit daily report
   */
  submitDailyReport: async (data: CreateDailyReportRequest): Promise<JobDetailDTO> => {
    const response = await api.post<{ message: string; status_code: number; data: JobDetailDTO }>(
      API_ENDPOINTS.JOB_DETAIL.REPORT_DAILY,
      data
    );
    return response.data.data;
  },

  /**
   * Farmer: Get all daily reports in farm (Job Post)
   */
  getFarmReports: async (jobPostId: string): Promise<JobDetailDTO[]> => {
    const response = await api.get<{ message: string; status_code: number; data: JobDetailDTO[] }>(
      API_ENDPOINTS.JOB_DETAIL.FARM(jobPostId)
    );
    return response.data.data || [];
  },
  
  /**
   * Farmer: Evaluate/Approve report
   */
  evaluateReport: async (id: string, data: ApproveJobDetailRequest): Promise<void> => {
    const response = await api.post<{ message: string; status_code: number }>(
      API_ENDPOINTS.JOB_DETAIL.APPROVE(id),
      data
    );
  }
};
