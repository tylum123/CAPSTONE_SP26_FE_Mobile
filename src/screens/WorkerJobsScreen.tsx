import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { PillTabs, EmptyState } from "../components/ui";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import {
  Clock,
  MapPin,
  Banknote,
  Calendar,
  CheckCircle2,
  Star,
  MessageSquare,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react-native";
import { jobService, JobPostDTO } from "../services";
import { useAuth } from "../context/AuthContext";

type TabType = "applied" | "upcoming" | "completed";

export function WorkerJobsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>("applied");
  const { isAuthenticated, user } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);

  const demoAppliedJobs = [
    {
      id: 5,
      title: "Hái cà phê",
      farmer: "Trần Văn D",
      location: "An Giang",
      date: "18/01/2026",
      time: "07:00 - 16:00",
      wage: 180000,
      status: "pending",
      appliedDate: "15/01/2026",
    },
    {
      id: 6,
      title: "Thu hoạch rau",
      farmer: "Nguyễn Văn E",
      location: "Đồng Tháp",
      date: "15/01/2026",
      time: "08:00 - 17:00",
      wage: 200000,
      status: "accepted",
      appliedDate: "12/01/2026",
    },
  ];
  const demoUpcomingJobs = [
    {
      id: 3,
      title: "Tưới nước vườn cam",
      farmer: "Lê Thị C",
      location: "Vĩnh Long",
      date: "25/02/2026",
      time: "06:00 - 10:00",
      wage: 150000,
      status: "accepted",
    },
    {
      id: 7,
      title: "Phun thuốc vườn cam",
      farmer: "Trần Văn F",
      location: "Cần Thơ",
      date: "26/02/2026",
      time: "07:00 - 11:00",
      wage: 200000,
      status: "accepted",
    },
  ];
  const demoCompletedJobs = [
    {
      id: 1,
      title: "Làm cỏ vườn mít",
      farmer: "Nguyễn Văn A",
      location: "Cần Thơ",
      date: "20/01/2026",
      completedDate: "20/01/2026",
      wage: 250000,
      rating: 5,
      review: "Công việc tốt, người thuê nhiệt tình",
      paidAmount: 250000,
    },
    {
      id: 8,
      title: "Thu hoạch lúa",
      farmer: "Phạm Văn G",
      location: "Đồng Tháp",
      date: "10/01/2026",
      completedDate: "10/01/2026",
      wage: 300000,
      rating: 4,
      review: "Môi trường làm việc tốt, trả lương đúng hẹn",
      paidAmount: 300000,
    },
    {
      id: 9,
      title: "Vận chuyển phân bón",
      farmer: "Võ Thị H",
      location: "An Giang",
      date: "05/01/2026",
      completedDate: "05/01/2026",
      wage: 180000,
      rating: 0,
      review: "",
      paidAmount: 180000,
    },
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) {
      setAppliedJobs(demoAppliedJobs);
      setUpcomingJobs(demoUpcomingJobs);
      setCompletedJobs(demoCompletedJobs);
      return;
    }
    const loadJobs = async () => {
      try {
        const result = await jobService.getJobPosts();
        const mappedApplied = result.map((job: JobPostDTO) => ({
          id: job.id,
          title: job.title,
          farmer: "Chủ nông trại",
          location: job.address,
          date: job.startDate
            ? new Date(job.startDate).toLocaleDateString("vi-VN")
            : "",
          time: "",
          wage: job.wageAmount || 0,
          status: "pending" as const,
          appliedDate: job.publishedAt
            ? new Date(job.publishedAt).toLocaleDateString("vi-VN")
            : "",
        }));
        setAppliedJobs(mappedApplied);
        setUpcomingJobs([]);
        setCompletedJobs([]);
      } catch {
        setAppliedJobs([]);
        setUpcomingJobs([]);
        setCompletedJobs([]);
      }
    };
    loadJobs().catch(() => undefined);
  }, [isAuthenticated, user?.isDemo]);

  const renderApplied = (job: any) => (
    <TouchableOpacity
      key={job.id}
      style={styles.jobCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
    >
      <View style={styles.jobCardInner}>
        <View style={styles.jobTop}>
          <Avatar fallback={job.farmer[0]} size={42} />
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {job.title}
            </Text>
            <Text style={styles.jobFarmer}>{job.farmer}</Text>
          </View>
          <Badge variant={job.status === "accepted" ? "success" : "warning"}>
            {job.status === "accepted" ? "Chấp nhận" : "Chờ xác nhận"}
          </Badge>
        </View>
        <View style={styles.divider} />
        <View style={styles.jobMeta}>
          <View style={styles.metaItem}>
            <MapPin size={13} color={COLORS.slate[400]} />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={13} color={COLORS.slate[400]} />
            <Text style={styles.metaText}>{job.date}</Text>
          </View>
          <View style={[styles.metaItem, styles.wageChip]}>
            <Banknote size={13} color={COLORS.emerald[600]} />
            <Text style={styles.wageText}>
              {job.wage.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        </View>
        <Text style={styles.appliedNote}>Đã apply: {job.appliedDate}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUpcoming = (job: any) => (
    <View key={job.id} style={styles.jobCard}>
      <View style={[styles.jobAccent, { backgroundColor: COLORS.teal[600] }]} />
      <View style={styles.jobCardInner}>
        <View style={styles.jobTop}>
          <Avatar fallback={job.farmer[0]} size={42} />
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={styles.upcomingDate}>
              <Calendar size={12} color={COLORS.teal[600]} />
              <Text style={styles.upcomingDateText}>
                {job.date} • {job.time}
              </Text>
            </View>
          </View>
          <Badge variant="success">Xác nhận</Badge>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={13} color={COLORS.slate[400]} />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
          <View style={[styles.metaItem, styles.wageChip]}>
            <Banknote size={13} color={COLORS.emerald[600]} />
            <Text style={styles.wageText}>
              {job.wage.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <Button
            variant="outline"
            size="sm"
            onPress={() =>
              navigation.navigate("Chat", { farmerId: job.farmer })
            }
          >
            <Text>💬 Nhắn tin</Text>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() =>
              navigation.navigate("CheckIn", {
                jobApplicationId: String(job.id),
              })
            }
          >
            <Text>📍 Check in</Text>
          </Button>
          <Button
            size="sm"
            onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
          >
            Chi tiết
          </Button>
        </View>
      </View>
    </View>
  );

  const renderCompleted = (job: any) => (
    <View key={job.id} style={styles.jobCard}>
      <View
        style={[styles.jobAccent, { backgroundColor: COLORS.emerald[400] }]}
      />
      <View style={styles.jobCardInner}>
        <View style={styles.jobTop}>
          <View style={styles.completedIconWrap}>
            <CheckCircle2 size={24} color={COLORS.emerald[600]} />
          </View>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobFarmer}>
              {job.farmer} • {job.completedDate}
            </Text>
          </View>
          <Badge variant="success">Xong</Badge>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={13} color={COLORS.slate[400]} />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
          <View style={[styles.metaItem, styles.wageChip]}>
            <Banknote size={13} color={COLORS.emerald[600]} />
            <Text style={styles.wageText}>
              {job.paidAmount.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        </View>
        {job.rating && job.review ? (
          <View style={styles.ratingBox}>
            <View style={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  color={COLORS.amber[400]}
                  fill={i < job.rating ? COLORS.amber[400] : "none"}
                />
              ))}
            </View>
            <Text style={styles.reviewText}>"{job.review}"</Text>
          </View>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => navigation.navigate("Review", { jobId: job.id })}
          >
            Đánh giá công việc ⭐
          </Button>
        )}
      </View>
    </View>
  );

  const listData =
    activeTab === "applied"
      ? appliedJobs
      : activeTab === "upcoming"
        ? upcomingJobs
        : completedJobs;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Công việc của bạn</Text>
          <Text style={styles.headerSub}>
            Quản lý ứng tuyển và lịch làm việc
          </Text>
        </View>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate("AttendanceHistory")}
        >
          <ClipboardCheck size={18} color={COLORS.emerald[600]} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <PillTabs
          items={[
            {
              key: "applied",
              label: "Đã apply",
              badgeCount: appliedJobs.length,
            },
            {
              key: "upcoming",
              label: "Sắp tới",
              badgeCount: upcomingJobs.length,
            },
            {
              key: "completed",
              label: "Hoàn thành",
              badgeCount: completedJobs.length,
            },
          ]}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabType)}
        />
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={listData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          activeTab === "applied"
            ? renderApplied(item)
            : activeTab === "upcoming"
              ? renderUpcoming(item)
              : renderCompleted(item)
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card variant="tinted" style={styles.emptyCard}>
            <CardContent>
              <EmptyState
                title={
                  activeTab === "applied"
                    ? "Chưa có đơn apply"
                    : activeTab === "upcoming"
                      ? "Chưa có lịch sắp tới"
                      : "Chưa có việc hoàn thành"
                }
                description={
                  activeTab === "applied"
                    ? "Tìm và apply công việc phù hợp với bạn."
                    : activeTab === "upcoming"
                      ? "Lịch làm đã xác nhận sẽ xuất hiện ở đây."
                      : "Công việc hoàn tất sẽ hiển thị sau khi thanh toán."
                }
              />
            </CardContent>
          </Card>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.sage[50] },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.slate[900],
    letterSpacing: -0.3,
  },
  headerSub: { fontSize: 12, color: COLORS.slate[400], marginTop: 2 },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.emerald[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
  },
  tabsWrap: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  list: { flex: 1 },
  listContent: { padding: SPACING.md, paddingBottom: 110, gap: SPACING.sm },

  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: "row",
    overflow: "hidden",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  jobAccent: { width: 4 },
  jobCardInner: { flex: 1, padding: SPACING.md },
  jobTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  jobInfo: { flex: 1 },
  jobTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.slate[800],
    marginBottom: 2,
  },
  jobFarmer: { fontSize: 12, color: COLORS.slate[500] },
  divider: {
    height: 1,
    backgroundColor: COLORS.slate[100],
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: SPACING.sm,
  },
  jobMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.slate[500] },
  wageChip: {
    backgroundColor: COLORS.emerald[50],
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.emerald[100],
  },
  wageText: { fontSize: 12, color: COLORS.emerald[700], fontWeight: "700" },
  appliedNote: { fontSize: 11, color: COLORS.slate[400], marginTop: 4 },
  upcomingDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  upcomingDateText: {
    fontSize: 12,
    color: COLORS.teal[600],
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: SPACING.sm,
    flexWrap: "wrap",
  },
  completedIconWrap: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.emerald[50],
    justifyContent: "center",
    alignItems: "center",
  },
  ratingBox: {
    backgroundColor: COLORS.amber[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.amber[200],
  },
  starsRow: { flexDirection: "row", gap: 3 },
  reviewText: { fontSize: 13, color: COLORS.slate[700], fontStyle: "italic" },
  emptyCard: { marginTop: SPACING.md },
});
