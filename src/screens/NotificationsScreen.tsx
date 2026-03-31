/* AI CONTEXT:
 * Action: Displays a historical list of system alerts and user notifications.
 * Inputs: Notification payload from backend APIs.
 * Outputs: Rendered notification list, mark-as-read actions.
 * Dependencies: Notification service, Auth context. */

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell, CheckCircle2, Clock, Banknote, Briefcase, AlertCircle,
  X, ChevronLeft, CheckCheck,
} from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { notificationService } from "../services/export_services";
import { useAuth } from "../context/AuthContext";
import { SkeletonRow, EmptyState } from "../components/ui/export_ui_components";

type NotificationType = "job_accepted" | "job_rejected" | "payment_received" | "reminder" | "new_job" | "job_cancelled";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  jobId?: number;
}

const TYPE_CONFIG: Record<NotificationType, { icon: any; color: string; bg: string }> = {
  job_accepted:    { icon: CheckCircle2,  color: COLORS.primary[600], bg: COLORS.primary[50]  },
  job_rejected:    { icon: X,             color: COLORS.rose[500],    bg: COLORS.rose[50]     },
  payment_received:{ icon: Banknote,      color: COLORS.primary[600], bg: COLORS.primary[50]  },
  reminder:        { icon: Clock,         color: COLORS.rice[500],    bg: COLORS.rice[50]     },
  new_job:         { icon: Briefcase,     color: COLORS.blue[600],    bg: COLORS.blue[50]     },
  job_cancelled:   { icon: AlertCircle,   color: COLORS.rose[500],    bg: COLORS.rose[50]     },
};

const INITIAL: Notification[] = [
  { id: 1, type: "job_accepted",     title: "Ứng tuyển được chấp nhận", message: "Nguyễn Văn A đã chấp nhận ứng tuyển của bạn cho công việc 'Thu hoạch lúa'", timestamp: "5 phút trước",  read: false, actionable: true,  jobId: 1 },
  { id: 2, type: "payment_received", title: "Đã nhận thanh toán 💰",     message: "Bạn đã nhận 250,000 VNĐ cho công việc 'Làm đất trồng rau'",                timestamp: "2 giờ trước",   read: false },
  { id: 3, type: "reminder",         title: "Nhắc nhở công việc ⏰",      message: "Bạn có công việc 'Chăm sóc vườn cam' bắt đầu vào ngày mai lúc 07:00",      timestamp: "1 ngày trước",  read: true,  actionable: true,  jobId: 2 },
  { id: 4, type: "new_job",          title: "Việc mới gần bạn 📍",        message: "Có việc 'Phun thuốc sâu' cách 3km, thù lao 300,000 VNĐ",                       timestamp: "1 ngày trước",  read: true,  actionable: true,  jobId: 3 },
  { id: 5, type: "job_rejected",     title: "Ứng tuyển không thành công", message: "Trần Thị B đã từ chối ứng tuyển của bạn cho 'Tưới tiêu'",                   timestamp: "2 ngày trước",  read: true },
];

export function NotificationsScreen({ navigation }: any) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>(user?.isDemo ? INITIAL : []);
  const [isLoading, setIsLoading] = useState(!user?.isDemo);
  const [refreshing, setRefreshing] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || user?.isDemo) {
      setNotifications(INITIAL);
      setIsLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications();
      const mapType = (typeId: number) => {
        if (typeId === 1) return "job_accepted";
        if (typeId === 2) return "reminder";
        if (typeId === 3) return "payment_received";
        if (typeId === 4) return "new_job";
        return "new_job";
      };
      
      setNotifications(data.length > 0 ? data.map((n: any) => ({
        ...n,
        id: n.id,
        type: mapType(n.notificationType),
        title: n.title,
        message: n.content || n.message,
        timestamp: n.createdAt ? new Date(n.createdAt).toLocaleDateString("vi-VN") : "Gần đây",
        read: n.isRead,
        actionable: !!n.linkId,
        jobId: n.linkId,
      })) as any : []);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user?.isDemo]);

  useEffect(() => {
    loadNotifications();
    const sub = DeviceEventEmitter.addListener("REFRESH_DATA", loadNotifications);
    return () => sub.remove();
  }, [loadNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (id: number | string) => {
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n)));
    if (isAuthenticated && !user?.isDemo) {
      try { await notificationService.markAsRead(String(id)); } catch {}
    }
  };
  const deleteItem = async (id: number | string) => {
    setNotifications((p) => p.filter((n) => n.id !== id));
    if (isAuthenticated && !user?.isDemo) {
      try { await notificationService.deleteNotification(String(id)); } catch {}
    }
  };
  const markAllRead = async () => {
    setNotifications((p) => p.map((n) => ({ ...n, read: true, isRead: true })));
    if (isAuthenticated && !user?.isDemo) {
      try { await notificationService.markAllAsRead(); } catch {}
    }
  };

  const handlePress = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.actionable && notif.jobId) navigation.navigate("JobDetail", { jobId: notif.jobId });
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity
          className="w-[38px] h-[38px] rounded-full bg-slate-50 border border-slate-200 justify-center items-center mr-2"
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={22} color="#334155" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-[20px] font-extrabold text-slate-900" style={{ letterSpacing: -0.3 }}>Thông báo</Text>
          {unreadCount > 0 && (
            <View className="bg-rose-500 rounded-full min-w-5 h-5 justify-center items-center px-1">
              <Text className="text-[11px] font-bold text-white">{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            className="w-[38px] h-[38px] rounded-full bg-primary-50 border border-primary-200 justify-center items-center"
            onPress={markAllRead}
          >
            <CheckCheck size={18} color="#059669" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
        renderItem={({ item: notif }) => {
          const cfg = TYPE_CONFIG[notif.type as NotificationType];
          const IconComp = cfg.icon;
          return (
            <TouchableOpacity
              className={["flex-row items-start p-4 gap-2 rounded-[20px] border relative overflow-hidden", notif.read ? "bg-white border-slate-100" : "border-primary-100"].join(" ")}
              style={notif.read ? { shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 } : { backgroundColor: "#f8fffe", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}
              onPress={() => handlePress(notif)} activeOpacity={0.88}
            >
              {!notif.read && (
                <View className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary-500 rounded-l-[20px]" />
              )}
              <View className="w-[46px] h-[46px] rounded-full justify-center items-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                <IconComp size={22} color={cfg.color} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-start justify-between mb-1">
                  <Text className={["text-sm flex-1 leading-[18px]", notif.read ? "font-semibold text-slate-700" : "font-bold text-slate-900"].join(" ")} numberOfLines={1}>
                    {notif.title}
                  </Text>
                  <Text className="text-[11px] text-slate-400 font-medium shrink-0 ml-2">{notif.timestamp}</Text>
                </View>
                <Text className="text-[13px] text-slate-500 leading-[18px] mb-1" numberOfLines={2}>{notif.message}</Text>
                {notif.actionable && <Text className="text-xs text-primary-600 font-semibold">Nhấn để xem chi tiết →</Text>}
              </View>
              <TouchableOpacity className="p-1 shrink-0" onPress={() => deleteItem(notif.id)} hitSlop={8}>
                <X size={14} color="#cbd5e1" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState 
              title="Không có thông báo"
              message="Chúng tôi sẽ thông báo cho bạn khi có tin mới hoặc cập nhật về công việc!"
              icon={Bell}
            />
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <View className="px-4 gap-4 mt-2">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
      />
    </SafeAreaView>
  );
}
