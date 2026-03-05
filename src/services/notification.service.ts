import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";

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
    const response = await api.get<Notification[]>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
    );
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    await api.put(API_ENDPOINTS.NOTIFICATIONS.READ(id));
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.put(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  },
};
