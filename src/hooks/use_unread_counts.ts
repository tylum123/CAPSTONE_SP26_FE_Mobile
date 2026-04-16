import { useState, useEffect, useCallback } from "react";
import { DeviceEventEmitter } from "react-native";
import { messageService } from "../services/message.service";
import { notificationService } from "../services/notification.service";
import { useAuth } from "../context/AuthContext";

export function useUnreadCounts() {
  const { isAuthenticated, user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchCounts = useCallback(async () => {
    if (!isAuthenticated || user?.isDemo) {
      // In demo mode, we can hardcode some unread items if desired
      if (user?.isDemo) {
        setUnreadMessages(1); // Demo unread
        setUnreadNotifications(2);
      }
      return;
    }

    try {
      const [conversations, notifications] = await Promise.all([
        messageService.getConversations(),
        notificationService.getUnreadNotifications()
      ]);

      const totalUnreadMsg = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadMessages(totalUnreadMsg);
      setUnreadNotifications(notifications.length);
    } catch (error) {
      console.log("[useUnreadCounts] Error fetching counts:", error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCounts();

    // Listen to global refresh events (emitted by markAsRead, etc.)
    const sub = DeviceEventEmitter.addListener("REFRESH_DATA", fetchCounts);
    
    // Polling as a fallback for background arrivals
    const interval = setInterval(fetchCounts, 30000);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [fetchCounts]);

  return { unreadMessages, unreadNotifications, refresh: fetchCounts };
}
