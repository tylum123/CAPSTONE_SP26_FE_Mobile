/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, NotificationDTO } from "../types/export_type_definitions";

// Notification Service
export const notificationService = {
  // Get all notifications
  getNotifications: async (): Promise<NotificationDTO[]> => {
    const response = await api.get<ApiResponse<NotificationDTO[]>>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
    );
    // @ts-ignore
    return response.data.data || response.data;
  },

  // Get unread notifications
  getUnreadNotifications: async (): Promise<NotificationDTO[]> => {
    const response = await api.get<ApiResponse<NotificationDTO[]>>(
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
  registerPushToken: async (token: string, deviceName: string = "Mobile Device"): Promise<void> => {
    await api.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_TOKEN, { token, deviceName });
  },

  // Unregister push notification token
  unregisterPushToken: async (token: string): Promise<void> => {
    await api.post(API_ENDPOINTS.NOTIFICATIONS.UNREGISTER_TOKEN, { token });
  },
};
