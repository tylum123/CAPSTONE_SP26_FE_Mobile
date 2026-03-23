import api from "../config/axios";
import { JobDailyReportDTO, CreateDailyReportRequest } from "../types";

const REPORT_URL = "/report";

export const reportService = {
  /**
   * Worker/Farmer: Get specific report details
   */
  getReportById: async (id: string): Promise<JobDailyReportDTO> => {
    const response = await api.get<{ message: string; status_code: number; data: JobDailyReportDTO }>(
      `${REPORT_URL}/${id}`
    );
    return response.data.data;
  },

  /**
   * Worker: Get worker's reports over a date range
   */
  getWorkerReports: async (workerProfileId: string, startDate?: string, endDate?: string): Promise<JobDailyReportDTO[]> => {
    let params = "";
    if (startDate || endDate) {
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);
      params = `?${query.toString()}`;
    }

    const response = await api.get<{ message: string; status_code: number; data: JobDailyReportDTO[] }>(
      `${REPORT_URL}/worker/${workerProfileId}${params}`
    );
    return response.data.data || [];
  },

  /**
   * Worker: Submit daily report
   */
  submitDailyReport: async (data: CreateDailyReportRequest): Promise<JobDailyReportDTO> => {
    const response = await api.post<{ message: string; status_code: number; data: JobDailyReportDTO }>(
      REPORT_URL,
      data
    );
    return response.data.data;
  },

  /**
   * Worker: Appeal evaluation
   */
  appealEvaluation: async (reportId: string, reason: string): Promise<void> => {
    const response = await api.post<{ message: string; status_code: number }>(
      `${REPORT_URL}/${reportId}/appeal`,
      { reason }
    );
  },

  /**
   * Farmer: Get all daily reports in farm
   */
   getFarmReports: async (farmerProfileId: string): Promise<JobDailyReportDTO[]> => {
    const response = await api.get<{ message: string; status_code: number; data: JobDailyReportDTO[] }>(
      `${REPORT_URL}/farm/${farmerProfileId}`
    );
    return response.data.data || [];
  },
  
  /**
   * Farmer: Evaluate report
   */
  evaluateReport: async (data: { reportId: string, evaluationPercentage: number, farmerFeedback: string }): Promise<void> => {
    const response = await api.put<{ message: string; status_code: number }>(
      `${REPORT_URL}/evaluate`,
      data
    );
  }
};
