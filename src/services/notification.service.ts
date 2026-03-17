import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse } from "../types";

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  data?: any;
}

// Notification Service
export const notificationService = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
    );
    // @ts-ignore
    return response.data.data || response.data;
  },

  // Get unread notifications
  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD,
    );
    // @ts-ignore
    return response.data.data || response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(API_ENDPOINTS.NOTIFICATIONS.READ, { notificationId: id });
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  },

  // Register push notification token
  registerPushToken: async (token: string): Promise<void> => {
    await api.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_TOKEN, { token });
  },
};
