import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PillTabs, ListItem, EmptyState } from "../components/ui";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from "../constants/theme";
import {
  Clock,
  MapPin,
  Banknote,
  Calendar,
  CheckCircle2,
  Star,
} from "lucide-react-native";
import { jobService, JobPostDTO } from "../services";
import { useAuth } from "../context/AuthContext";

type TabType = "applied" | "upcoming" | "completed";

export function WorkerJobsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>("applied");
  const { isAuthenticated } = useAuth();

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
  ];

  useEffect(() => {
    if (!isAuthenticated) {
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
  }, [isAuthenticated]);

  const renderAppliedJobs = () => (
    <>
      {appliedJobs.length === 0 ? (
        <Card style={styles.jobCard}>
          <CardContent>
            <EmptyState
              title="Chưa có đơn đã apply"
              description="Khi bạn apply công việc, chúng sẽ hiển thị tại đây."
            />
          </CardContent>
        </Card>
      ) : (
        appliedJobs.map((job) => (
          <Card key={job.id} style={styles.jobCard}>
            <CardContent>
              <ListItem
                title={job.title}
                subtitle={job.farmer}
                meta={`${job.date} • ${job.time}`}
                leftSlot={
                  <View style={styles.iconCircle}>
                    <Calendar size={16} color={COLORS.emerald[600]} />
                  </View>
                }
                rightSlot={
                  <Badge
                    variant={job.status === "accepted" ? "success" : "warning"}
                  >
                    {job.status === "accepted"
                      ? "Đã chấp nhận"
                      : "Chờ xác nhận"}
                  </Badge>
                }
                onPress={() =>
                  navigation.navigate("JobDetail", { jobId: job.id })
                }
              />

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <MapPin size={14} color={COLORS.slate[500]} />
                  <Text style={styles.metaText}>{job.location}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Banknote size={14} color={COLORS.emerald[600]} />
                  <Text style={styles.metaText}>
                    {job.wage.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </View>
              </View>

              <Text style={styles.metaNote}>Đã apply: {job.appliedDate}</Text>
            </CardContent>
          </Card>
        ))
      )}
    </>
  );

  const renderUpcomingJobs = () => (
    <>
      {upcomingJobs.length === 0 ? (
        <Card style={styles.jobCard}>
          <CardContent>
            <EmptyState
              title="Chưa có lịch sắp tới"
              description="Lịch công việc đã xác nhận sẽ hiển thị ở đây."
            />
          </CardContent>
        </Card>
      ) : (
        upcomingJobs.map((job) => (
          <Card key={job.id} style={styles.jobCard}>
            <CardContent>
              <ListItem
                title={job.title}
                subtitle={job.farmer}
                meta={`${job.date} • ${job.time}`}
                leftSlot={
                  <View style={styles.iconCircle}>
                    <Clock size={16} color={COLORS.emerald[600]} />
                  </View>
                }
                rightSlot={<Badge variant="success">Đã xác nhận</Badge>}
                onPress={() =>
                  navigation.navigate("JobDetail", { jobId: job.id })
                }
              />

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <MapPin size={14} color={COLORS.slate[500]} />
                  <Text style={styles.metaText}>{job.location}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Banknote size={14} color={COLORS.emerald[600]} />
                  <Text style={styles.metaText}>
                    {job.wage.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() =>
                    navigation.navigate("Chat", { farmerId: job.farmer })
                  }
                >
                  Nhắn tin
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
                  Check in
                </Button>
                <Button
                  size="sm"
                  onPress={() =>
                    navigation.navigate("JobDetail", { jobId: job.id })
                  }
                >
                  Xem chi tiết
                </Button>
              </View>
            </CardContent>
          </Card>
        ))
      )}
    </>
  );

  const renderCompletedJobs = () => (
    <>
      {completedJobs.length === 0 ? (
        <Card style={styles.jobCard}>
          <CardContent>
            <EmptyState
              title="Chưa có công việc hoàn thành"
              description="Sau khi hoàn tất và thanh toán, công việc sẽ xuất hiện tại đây."
            />
          </CardContent>
        </Card>
      ) : (
        completedJobs.map((job) => (
          <Card key={job.id} style={styles.jobCard}>
            <CardContent>
              <ListItem
                title={job.title}
                subtitle={job.farmer}
                meta={`Hoàn thành: ${job.completedDate}`}
                leftSlot={
                  <View style={styles.iconCircle}>
                    <CheckCircle2 size={16} color={COLORS.emerald[600]} />
                  </View>
                }
                rightSlot={<Badge variant="success">Đã xong</Badge>}
                onPress={() =>
                  navigation.navigate("JobDetail", { jobId: job.id })
                }
              />

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <MapPin size={14} color={COLORS.slate[500]} />
                  <Text style={styles.metaText}>{job.location}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Banknote size={14} color={COLORS.emerald[600]} />
                  <Text style={styles.metaText}>
                    Đã thanh toán: {job.paidAmount.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </View>
              </View>

              {job.rating && job.review ? (
                <View style={styles.ratingSection}>
                  <Text style={styles.ratingLabel}>Đánh giá của bạn:</Text>
                  <View style={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        color={COLORS.amber[400]}
                        fill={i < job.rating! ? COLORS.amber[400] : "none"}
                      />
                    ))}
                  </View>
                  {job.review && (
                    <Text style={styles.reviewText}>{job.review}</Text>
                  )}
                </View>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() =>
                    navigation.navigate("Review", { jobId: job.id })
                  }
                >
                  Đánh giá công việc
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroTextGroup}>
            <Text style={styles.title}>Công việc của bạn</Text>
            <Text style={styles.subtitle}>
              Theo dõi trạng thái apply, lịch làm và công việc đã xong.
            </Text>
          </View>
          <Button
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate("AttendanceHistory")}
          >
            Lịch sử chấm công
          </Button>
        </View>

        <View style={styles.tabWrap}>
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
                label: "Đã hoàn thành",
                badgeCount: completedJobs.length,
              },
            ]}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as TabType)}
          />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {activeTab === "applied" && renderAppliedJobs()}
          {activeTab === "upcoming" && renderUpcomingJobs()}
          {activeTab === "completed" && renderCompletedJobs()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    gap: SPACING.md,
  },
  heroTextGroup: {
    flex: 1,
    gap: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.title,
    fontSize: 22,
    color: COLORS.slate[900],
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.slate[600],
  },
  tabWrap: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.emerald[50],
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.slate[100],
    borderRadius: BORDER_RADIUS.full,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.slate[600],
  },
  metaNote: {
    fontSize: 12,
    color: COLORS.slate[500],
    marginTop: SPACING.xs,
  },
  wageText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.emerald[700],
  },
  paidText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.emerald[600],
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  ratingSection: {
    padding: SPACING.sm,
    backgroundColor: COLORS.slate[100],
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  ratingLabel: {
    fontSize: 12,
    color: COLORS.slate[600],
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.slate[700],
    fontStyle: "italic",
    marginTop: SPACING.xs,
  },
});
