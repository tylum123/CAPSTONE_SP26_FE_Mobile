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
  MessageDTO,
  CreateMessageRequest,
  MarkConversationAsReadRequest,
  PaginatedResponse, // NOTE: Assuming we might need to import or handle this
} from "../types/export_type_definitions";

// Message Service
export const messageService = {
  // Get paginated messages for a conversation with a specific user
  getMessages: async (userId: string, page: number = 1, limit: number = 20) => {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.MESSAGES.BASE, {
      params: { userId, page, limit },
    });
    // Backend returns PaginatedResponse<MessageDTO> wrapped in ApiResponse
    if (response.data.data && Array.isArray(response.data.data.items)) {
      // Typically PaginatedResponse has an 'items' or 'data' array
      return response.data.data;
    }
    // Fallback if data is the array itself
    return response.data;
  },

  // Send a new message to a specific user
  sendMessage: async (data: CreateMessageRequest): Promise<MessageDTO> => {
    const response = await api.post<ApiResponse<MessageDTO>>(
      API_ENDPOINTS.MESSAGES.BASE,
      data
    );
    return response.data.data!;
  },

  // Mark all messages from a specific sender as read
  markAsRead: async (data: MarkConversationAsReadRequest): Promise<number> => {
    const response = await api.patch<ApiResponse<number>>(
      API_ENDPOINTS.MESSAGES.MARK_AS_READ,
      data
    );
    return response.data.data || 0;
  },
};
