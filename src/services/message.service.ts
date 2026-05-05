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
  ConversationDTO,
} from "../types/export_type_definitions";

// Message Service
export const messageService = {
  // Get paginated messages for a conversation with a specific user
  getMessages: async (
    userId: string,
    page: number = 1,
    limit: number = 100
  ): Promise<any> => {
    const response = await api.get<any>(
      API_ENDPOINTS.MESSAGES.BASE,
      {
        params: { userId, page, limit },
      }
    );
    // Backend trả về ApiResponse<PaginatedResponse<MessageDTO>> hoặc ApiResponse<MessageDTO[]>
    // Normalize: luôn trả về raw data để ChatScreen tự parse
    return response.data?.data ?? response.data ?? [];
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

  // Get list of all conversations
  getConversations: async (): Promise<ConversationDTO[]> => {
    const response = await api.get<ApiResponse<ConversationDTO[]>>(
      `${API_ENDPOINTS.MESSAGES.CONVERSATIONS}?t=${new Date().getTime()}`
    );
    return response.data.data || [];
  },
};
