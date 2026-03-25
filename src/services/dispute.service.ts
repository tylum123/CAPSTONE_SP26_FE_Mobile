import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { DisputeReportDTO, CreateDisputeReportRequest } from "../types";

export const disputeService = {
  createDispute: async (data: CreateDisputeReportRequest): Promise<DisputeReportDTO> => {
    const response = await api.post<{ message: string; status_code: number; data: DisputeReportDTO }>(
      API_ENDPOINTS.DISPUTE.CREATE,
      data
    );
    return response.data.data;
  },

  getMyDisputes: async (): Promise<DisputeReportDTO[]> => {
    const response = await api.get<{ message: string; status_code: number; data: DisputeReportDTO[] }>(
      API_ENDPOINTS.DISPUTE.MY
    );
    return response.data.data || [];
  }
};
