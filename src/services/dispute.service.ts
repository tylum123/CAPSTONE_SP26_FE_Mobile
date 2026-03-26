import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { DisputeReportDTO, CreateDisputeReportRequest, ApiResponse } from "../types";

export const disputeService = {
  createDispute: async (data: CreateDisputeReportRequest): Promise<DisputeReportDTO> => {
    const response = await api.post<ApiResponse<DisputeReportDTO>>(
      API_ENDPOINTS.DISPUTE.CREATE,
      data
    );
    return response.data.data;
  },

  getMyDisputes: async (): Promise<DisputeReportDTO[]> => {
    const response = await api.get<ApiResponse<DisputeReportDTO[]>>(
      API_ENDPOINTS.DISPUTE.MY
    );
    return response.data.data || [];
  }
};
