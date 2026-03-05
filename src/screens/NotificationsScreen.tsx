import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ListItem } from "../components/ui/ListItem";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from "../constants/theme";

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
      title: "Thanh toán thành công",
      message: "Bạn đã nhận được 250,000 VNĐ cho công việc 'Làm đất trồng rau'",
      timestamp: "2 giờ trước",
      read: false,
    },
    {
      id: 3,
      type: "reminder",
      title: "Nhắc nhở công việc",
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
      title: "Công việc mới gần bạn",
      message: "Có công việc 'Phun thuốc sâu' cách bạn 3km, lương 300,000 VNĐ",
      timestamp: "1 ngày trước",
      read: true,
      actionable: true,
      jobId: 3,
    },
    {
      id: 5,
      type: "job_rejected",
      title: "Ứng tuyển không được chấp nhận",
      message:
        "Trần Thị B đã từ chối ứng tuyển của bạn cho công việc 'Tưới tiêu'",
      timestamp: "2 ngày trước",
      read: true,
    },
  ]);

  const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { size: 24 };

    switch (type) {
      case "job_accepted":
        return <CheckCircle2 {...iconProps} color={COLORS.emerald[600]} />;
      case "job_rejected":
        return <X {...iconProps} color={COLORS.red[600]} />;
      case "payment_received":
        return <Banknote {...iconProps} color={COLORS.emerald[600]} />;
      case "reminder":
        return <Clock {...iconProps} color={COLORS.amber[600]} />;
      case "new_job":
        return <Briefcase {...iconProps} color={COLORS.blue[600]} />;
      case "job_cancelled":
        return <AlertCircle {...iconProps} color={COLORS.red[600]} />;
      default:
        return <Bell {...iconProps} color={COLORS.gray[600]} />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "job_accepted":
      case "payment_received":
        return COLORS.emerald[50];
      case "job_rejected":
      case "job_cancelled":
        return COLORS.red[50];
      case "reminder":
        return COLORS.amber[50];
      case "new_job":
        return COLORS.blue[50];
      default:
        return COLORS.gray[50];
    }
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.actionable && notification.jobId) {
      navigation.navigate("JobDetail", { jobId: notification.jobId });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Thông báo</Text>
              {unreadCount > 0 && (
                <Badge variant="danger">{unreadCount} mới</Badge>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <X size={24} color={COLORS.gray[600]} />
            </TouchableOpacity>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllRead}>Đánh dấu tất cả đã đọc</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color={COLORS.slate[300]} />
              <Text style={styles.emptyTitle}>Không có thông báo</Text>
              <Text style={styles.emptySubtitle}>
                Bạn sẽ nhận được thông báo ở đây
              </Text>
            </View>
          ) : (
            <Card style={styles.listCard}>
              {notifications.map((notification, index) => (
                <ListItem
                  key={notification.id}
                  title={notification.title}
                  subtitle={notification.message}
                  leftSlot={
                    <View
                      style={{
                        ...styles.iconContainer,
                        backgroundColor: getNotificationColor(
                          notification.type,
                        ),
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </View>
                  }
                  rightSlot={
                    <View style={styles.rightContent}>
                      <Text style={styles.timestamp}>
                        {notification.timestamp}
                      </Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                  }
                  onPress={() => handleNotificationPress(notification)}
                  isLast={index === notifications.length - 1}
                  style={!notification.read ? styles.unreadItem : undefined}
                />
              ))}
            </Card>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.slate[900],
  },
  markAllRead: {
    ...TYPOGRAPHY.body2,
    color: COLORS.emerald[600],
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  listCard: {
    marginBottom: SPACING.xl,
  },
  unreadItem: {
    backgroundColor: COLORS.emerald[50],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  rightContent: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  timestamp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.slate[500],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.emerald[600],
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.slate[700],
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.slate[500],
    marginTop: SPACING.xs,
  },
});
