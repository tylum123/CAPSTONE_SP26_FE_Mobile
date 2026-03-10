import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  CheckCircle2,
  Clock,
  Banknote,
  Briefcase,
  AlertCircle,
  X,
  ChevronLeft,
  CheckCheck,
} from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";

type NotificationType =
  | "job_accepted"
  | "job_rejected"
  | "payment_received"
  | "reminder"
  | "new_job"
  | "job_cancelled";

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

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: any; color: string; bg: string }
> = {
  job_accepted: {
    icon: CheckCircle2,
    color: COLORS.emerald[600],
    bg: COLORS.emerald[50],
  },
  job_rejected: { icon: X, color: COLORS.rose[500], bg: COLORS.rose[50] },
  payment_received: {
    icon: Banknote,
    color: COLORS.emerald[600],
    bg: COLORS.emerald[50],
  },
  reminder: { icon: Clock, color: COLORS.amber[500], bg: COLORS.amber[50] },
  new_job: { icon: Briefcase, color: COLORS.blue[600], bg: COLORS.blue[50] },
  job_cancelled: {
    icon: AlertCircle,
    color: COLORS.rose[500],
    bg: COLORS.rose[50],
  },
};

export function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "job_accepted",
      title: "Ứng tuyển được chấp nhận",
      message:
        "Nguyễn Văn A đã chấp nhận ứng tuyển của bạn cho công việc 'Thu hoạch lúa'",
      timestamp: "5 phút trước",
      read: false,
      actionable: true,
      jobId: 1,
    },
    {
      id: 2,
      type: "payment_received",
      title: "Đã nhận thanh toán 💰",
      message: "Bạn đã nhận 250,000 VNĐ cho công việc 'Làm đất trồng rau'",
      timestamp: "2 giờ trước",
      read: false,
    },
    {
      id: 3,
      type: "reminder",
      title: "Nhắc nhở công việc ⏰",
      message:
        "Bạn có công việc 'Chăm sóc vườn cam' bắt đầu vào ngày mai lúc 07:00",
      timestamp: "1 ngày trước",
      read: true,
      actionable: true,
      jobId: 2,
    },
    {
      id: 4,
      type: "new_job",
      title: "Việc mới gần bạn 📍",
      message: "Có việc 'Phun thuốc sâu' cách 3km, lương 300,000 VNĐ",
      timestamp: "1 ngày trước",
      read: true,
      actionable: true,
      jobId: 3,
    },
    {
      id: 5,
      type: "job_rejected",
      title: "Ứng tuyển không thành công",
      message: "Trần Thị B đã từ chối ứng tuyển của bạn cho 'Tưới tiêu'",
      timestamp: "2 ngày trước",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const deleteNotification = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handlePress = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.actionable && notif.jobId) {
      navigation.navigate("JobDetail", { jobId: notif.jobId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={22} color={COLORS.slate[700]} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
            <CheckCheck size={18} color={COLORS.emerald[600]} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: notif }) => {
          const cfg = TYPE_CONFIG[notif.type];
          const IconComp = cfg.icon;
          return (
            <TouchableOpacity
              style={[styles.card, !notif.read && styles.cardUnread]}
              onPress={() => handlePress(notif)}
              activeOpacity={0.88}
            >
              {/* Unread indicator */}
              {!notif.read && <View style={styles.unreadBar} />}

              <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                <IconComp size={22} color={cfg.color} />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text
                    style={[
                      styles.cardTitle,
                      !notif.read && styles.cardTitleUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {notif.title}
                  </Text>
                  <Text style={styles.timestamp}>{notif.timestamp}</Text>
                </View>
                <Text style={styles.cardMessage} numberOfLines={2}>
                  {notif.message}
                </Text>
                {notif.actionable && (
                  <Text style={styles.tapHint}>Nhấn để xem chi tiết →</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteNotification(notif.id)}
                hitSlop={8}
              >
                <X size={14} color={COLORS.slate[300]} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconBox}>
              <Bell size={40} color={COLORS.slate[300]} />
            </View>
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptyText}>
              Chúng tôi sẽ thông báo khi có việc mới!
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.sage[50] },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.slate[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.slate[900],
    letterSpacing: -0.3,
  },
  unreadBadge: {
    backgroundColor: COLORS.rose[500],
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadBadgeText: { fontSize: 11, fontWeight: "700", color: COLORS.white },
  markAllBtn: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.emerald[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
  },
  list: { flex: 1 },
  listContent: { padding: SPACING.md, paddingBottom: 110 },

  /* Card */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.xs,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
    position: "relative",
    overflow: "hidden",
  },
  cardUnread: {
    backgroundColor: "#f8fffe",
    borderColor: COLORS.emerald[100],
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.emerald[500],
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.slate[700],
    flex: 1,
    lineHeight: 18,
  },
  cardTitleUnread: { fontWeight: "700", color: COLORS.slate[900] },
  timestamp: {
    fontSize: 11,
    color: COLORS.slate[400],
    fontWeight: "500",
    flexShrink: 0,
    marginLeft: 8,
  },
  cardMessage: {
    fontSize: 13,
    color: COLORS.slate[500],
    lineHeight: 18,
    marginBottom: 4,
  },
  tapHint: { fontSize: 12, color: COLORS.emerald[600], fontWeight: "600" },
  deleteBtn: {
    padding: 4,
    flexShrink: 0,
  },
  separator: { height: SPACING.sm },

  /* Empty */
  emptyWrap: { alignItems: "center", paddingTop: 80, gap: SPACING.sm },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.slate[100],
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.slate[600] },
  emptyText: { fontSize: 14, color: COLORS.slate[400], textAlign: "center" },
});
