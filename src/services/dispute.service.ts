/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import { DisputeReportDTO, CreateDisputeReportRequest, ApiResponse } from "../types/export_type_definitions";

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
