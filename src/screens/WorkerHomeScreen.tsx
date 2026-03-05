import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SectionHeader, ListItem, EmptyState } from "../components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MapPin,
  Banknote,
  Star,
  Briefcase,
  TrendingUp,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from "../constants/theme";
import { Job, UpcomingJob } from "../types";
import { jobService, JobPostDTO, workerProfileService } from "../services";
import { useAuth } from "../context/AuthContext";

export function WorkerHomeScreen({ navigation }: any) {
  const { user, isAuthenticated } = useAuth();
  const [nearbyJobs, setNearbyJobs] = useState<Job[]>([]);
  const [profileRating, setProfileRating] = useState<number | null>(null);
  const [totalJobsCompleted, setTotalJobsCompleted] = useState<number | null>(
    null,
  );

  const demoNearbyJobs: Job[] = [
    {
      id: 1,
      title: "Thu hoạch lúa",
      farmer: "Nguyễn Văn A",
      location: "Cần Thơ",
      distance: "2.5 km",
      wage: "250,000",
      duration: "1 ngày",
      rating: 4.8,
      urgent: true,
    },
    {
      id: 2,
      title: "Chăm sóc vườn cam",
      farmer: "Trần Thị B",
      location: "Vĩnh Long",
      distance: "5 km",
      wage: "200,000",
      duration: "3 ngày",
      rating: 4.5,
      urgent: false,
    },
    {
      id: 3,
      title: "Làm đất trồng rau",
      farmer: "Lê Văn C",
      location: "Sóc Trăng",
      distance: "8 km",
      wage: "300,000",
      duration: "2 ngày",
      rating: 4.9,
      urgent: false,
    },
  ];

  const demoUpcomingJobs: UpcomingJob[] = [
    {
      id: 1,
      title: "Phun thuốc trừ sâu",
      farmer: "Phạm Văn D",
      date: "15/01/2026",
      time: "06:00",
      status: "confirmed",
    },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      setNearbyJobs(demoNearbyJobs);
      setProfileRating(null);
      setTotalJobsCompleted(null);
      return;
    }

    const loadJobs = async () => {
      try {
        const jobs = await jobService.getJobPosts();
        const mappedJobs = jobs.map(
          (job: JobPostDTO): Job => ({
            id: job.id,
            title: job.title,
            farmer: "Chủ nông trại",
            location: job.address,
            distance: "N/A",
            wage: job.wageAmount ? job.wageAmount.toLocaleString("vi-VN") : "0",
            duration: job.estimatedHours ? `${job.estimatedHours} giờ` : "N/A",
            rating: 0,
            urgent: job.isUrgent,
          }),
        );
        setNearbyJobs(mappedJobs);
      } catch {
        setNearbyJobs([]);
      }
    };

    loadJobs().catch(() => undefined);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadProfile = async () => {
      try {
        const profile = await workerProfileService.getProfile();
        setProfileRating(profile.averageRating);
        setTotalJobsCompleted(profile.totalJobsCompleted);
      } catch {
        setProfileRating(null);
        setTotalJobsCompleted(null);
      }
    };

    loadProfile().catch(() => undefined);
  }, [isAuthenticated]);

  const upcomingJobs = useMemo(
    () => (isAuthenticated ? [] : demoUpcomingJobs),
    [isAuthenticated],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: SPACING.md,
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <View style={styles.gradientOverlay} />
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeLeft}>
              <Text style={styles.welcomeGreeting}>Xin chào</Text>
              <Text style={styles.welcomeName}>{user?.name || "Khách"}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Star
                    size={14}
                    color={COLORS.amber[400]}
                    fill={COLORS.amber[400]}
                  />
                  <Text style={styles.statText}>{profileRating ?? "--"}</Text>
                </View>
                <View style={styles.statBadge}>
                  <Briefcase size={14} color={COLORS.white} />
                  <Text style={styles.statText}>
                    {totalJobsCompleted ?? 0} việc
                  </Text>
                </View>
              </View>
            </View>
            <Avatar
              fallback={(user?.name || "Kh")[0]}
              size={64}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View style={styles.statIcon}>
                <Briefcase size={20} color={COLORS.white} />
              </View>
              <Text style={styles.statValue}>{totalJobsCompleted ?? 0}</Text>
              <Text style={styles.statLabel}>Việc đã làm</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: COLORS.amber[400] },
                ]}
              >
                <Star size={20} color={COLORS.white} />
              </View>
              <Text style={styles.statValue}>{profileRating ?? "--"}</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View
                style={[styles.statIcon, { backgroundColor: COLORS.teal[600] }]}
              >
                <TrendingUp size={20} color={COLORS.white} />
              </View>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Thu nhập</Text>
            </CardContent>
          </Card>
        </View>

        {/* Upcoming Jobs */}
        <View style={styles.section}>
          <SectionHeader
            title="Việc sắp tới"
            actionLabel={upcomingJobs.length > 0 ? "Xem tất cả" : undefined}
            onPressAction={() => {}}
          />
          {upcomingJobs.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  title="Chưa có việc sắp tới"
                  description="Khi có lịch đã nhận, chúng tôi sẽ hiển thị ở đây."
                />
              </CardContent>
            </Card>
          ) : (
            upcomingJobs.map((job) => (
              <Card key={job.id} style={styles.upcomingCard}>
                <CardContent>
                  <ListItem
                    title={job.title}
                    subtitle={job.farmer}
                    meta={job.time}
                    leftSlot={
                      <View style={styles.dateBox}>
                        <Text style={styles.dateDay}>15</Text>
                        <Text style={styles.dateMonth}>Th 1</Text>
                      </View>
                    }
                    rightSlot={<Badge variant="success">Đã xác nhận</Badge>}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </View>

        {/* Nearby Jobs */}
        <View style={styles.section}>
          <SectionHeader
            title="Việc gần bạn"
            subtitle="Công việc gợi ý quanh khu vực"
            actionLabel="Xem tất cả"
            onPressAction={() => navigation.navigate("Search")}
          />
          {nearbyJobs.map((job) => (
            <Card key={job.id} style={styles.jobCard}>
              <CardContent>
                <ListItem
                  title={job.title}
                  subtitle={`${job.farmer} • ${job.location}`}
                  meta={`${job.distance} • ${job.duration}`}
                  leftSlot={<Avatar fallback={job.farmer[0]} size={48} />}
                  rightSlot={
                    <View style={styles.jobMetaRight}>
                      {job.urgent ? (
                        <Badge variant="danger" style={styles.urgentBadge}>
                          🔥 Cần gấp
                        </Badge>
                      ) : null}
                      <Text style={styles.wageText}>{job.wage}đ</Text>
                    </View>
                  }
                  onPress={() =>
                    navigation.navigate("JobDetail", { jobId: job.id })
                  }
                />
                <View style={styles.jobMetaRow}>
                  <View style={styles.metaChip}>
                    <MapPin size={14} color={COLORS.slate[500]} />
                    <Text style={styles.metaChipText}>{job.location}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Banknote size={14} color={COLORS.emerald[600]} />
                    <Text style={styles.metaChipText}>{job.duration}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  welcomeCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.emerald[600],
    padding: SPACING.lg,
    position: "relative",
    overflow: "hidden",
    borderRadius: BORDER_RADIUS.lg,
  },
  gradientOverlay: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeGreeting: {
    color: COLORS.emerald[100],
    fontSize: 14,
    fontWeight: "500",
  },
  welcomeName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  statText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  avatar: {
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  quickStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.emerald[600],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.slate[900],
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.slate[600],
  },
  section: {
    marginBottom: SPACING.xl,
  },
  upcomingCard: {
    marginBottom: SPACING.md,
  },
  upcomingContent: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "center",
  },
  upcomingLeft: {
    width: 60,
  },
  dateBox: {
    backgroundColor: COLORS.emerald[50],
    padding: 8,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.emerald[600],
  },
  dateMonth: {
    fontSize: 12,
    color: COLORS.slate[600],
  },
  upcomingRight: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.slate[900],
  },
  upcomingFarmer: {
    fontSize: 14,
    color: COLORS.slate[600],
    marginTop: 2,
  },
  upcomingTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  upcomingTimeText: {
    fontSize: 12,
    color: COLORS.slate[500],
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  urgentBadge: {
    alignSelf: "flex-start",
    marginBottom: SPACING.xs,
  },
  jobMetaRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  jobMetaRight: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.slate[100],
    borderRadius: BORDER_RADIUS.full,
  },
  metaChipText: {
    fontSize: 12,
    color: COLORS.slate[600],
  },
  wageText: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.emerald[700],
  },
  bottomSpacing: {
    height: 100,
  },
});
