import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell, CheckCircle2, Clock, Banknote, Briefcase, AlertCircle,
  X, ChevronLeft, CheckCheck,
} from "lucide-react-native";
import { COLORS } from "../constants/theme";

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
  { id: 4, type: "new_job",          title: "Việc mới gần bạn 📍",        message: "Có việc 'Phun thuốc sâu' cách 3km, lương 300,000 VNĐ",                       timestamp: "1 ngày trước",  read: true,  actionable: true,  jobId: 3 },
  { id: 5, type: "job_rejected",     title: "Ứng tuyển không thành công", message: "Trần Thị B đã từ chối ứng tuyển của bạn cho 'Tưới tiêu'",                   timestamp: "2 ngày trước",  read: true },
];

export function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead   = (id: number) => setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const deleteItem   = (id: number) => setNotifications((p) => p.filter((n) => n.id !== id));
  const markAllRead  = ()           => setNotifications((p) => p.map((n) => ({ ...n, read: true })));

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
        renderItem={({ item: notif }) => {
          const cfg = TYPE_CONFIG[notif.type];
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
          <View className="items-center pt-20 gap-2">
            <View className="w-20 h-20 rounded-full bg-slate-100 justify-center items-center">
              <Bell size={40} color="#cbd5e1" />
            </View>
            <Text className="text-base font-bold text-slate-600">Không có thông báo</Text>
            <Text className="text-sm text-slate-400 text-center">Chúng tôi sẽ thông báo khi có việc mới!</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
      />
    </SafeAreaView>
  );
}
