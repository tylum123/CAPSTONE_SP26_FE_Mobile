import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MapPin,
  Clock,
  Banknote,
  Star,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
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
        contentContainerStyle={{ paddingBottom: 120 }}
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
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Briefcase size={20} color={COLORS.white} />
            </View>
            <Text style={styles.statValue}>{totalJobsCompleted ?? 0}</Text>
            <Text style={styles.statLabel}>Việc đã làm</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: COLORS.amber[400] }]}
            >
              <Star size={20} color={COLORS.white} />
            </View>
            <Text style={styles.statValue}>{profileRating ?? "--"}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: COLORS.teal[600] }]}
            >
              <TrendingUp size={20} color={COLORS.white} />
            </View>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Thu nhập</Text>
          </View>
        </View>

        {/* Upcoming Jobs */}
        {upcomingJobs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Việc sắp tới</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {upcomingJobs.map((job) => (
              <Card key={job.id} style={styles.upcomingCard}>
                <CardContent>
                  <View style={styles.upcomingContent}>
                    <View style={styles.upcomingLeft}>
                      <View style={styles.dateBox}>
                        <Text style={styles.dateDay}>15</Text>
                        <Text style={styles.dateMonth}>Th 1</Text>
                      </View>
                    </View>
                    <View style={styles.upcomingRight}>
                      <Text style={styles.upcomingTitle}>{job.title}</Text>
                      <Text style={styles.upcomingFarmer}>{job.farmer}</Text>
                      <View style={styles.upcomingTime}>
                        <Clock size={14} color={COLORS.gray[500]} />
                        <Text style={styles.upcomingTimeText}>{job.time}</Text>
                      </View>
                    </View>
                    <Badge variant="success">Đã xác nhận</Badge>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* Nearby Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Zap size={20} color={COLORS.emerald[600]} />
              <Text style={styles.sectionTitle}>Việc gần bạn</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Search")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {nearbyJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() =>
                navigation.navigate("JobDetail", { jobId: job.id })
              }
            >
              <Card style={styles.jobCard}>
                <CardContent>
                  {job.urgent && (
                    <Badge variant="danger" style={styles.urgentBadge}>
                      🔥 Cần gấp
                    </Badge>
                  )}
                  <View style={styles.jobHeader}>
                    <Avatar fallback={job.farmer[0]} size={48} />
                    <View style={styles.jobHeaderInfo}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.farmerName}>{job.farmer}</Text>
                      <View style={styles.ratingRow}>
                        <Star
                          size={12}
                          color={COLORS.amber[400]}
                          fill={COLORS.amber[400]}
                        />
                        <Text style={styles.ratingText}>{job.rating}</Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={COLORS.gray[500]} />
                  </View>
                  <View style={styles.jobDetails}>
                    <View style={styles.jobDetailItem}>
                      <MapPin size={16} color={COLORS.gray[500]} />
                      <Text style={styles.jobDetailText}>{job.location}</Text>
                      <Text style={styles.jobDetailTextMuted}>
                        • {job.distance}
                      </Text>
                    </View>
                    <View style={styles.jobDetailItem}>
                      <Banknote size={16} color={COLORS.emerald[600]} />
                      <Text style={styles.jobWage}>{job.wage}đ</Text>
                      <Text style={styles.jobDetailTextMuted}>
                        / {job.duration}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
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
    backgroundColor: COLORS.emerald[50],
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.emerald[50],
  },
  welcomeCard: {
    // margin: SPACING.md,
    // marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    // borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.emerald[600],
    padding: SPACING.lg,
    position: "relative",
    overflow: "hidden",
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
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.emerald[600],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray[900],
    paddingHorizontal: 5,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.emerald[600],
    fontWeight: "600",
    paddingHorizontal: 5,
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
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.emerald[600],
  },
  dateMonth: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  upcomingRight: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  upcomingFarmer: {
    fontSize: 14,
    color: COLORS.gray[600],
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
    color: COLORS.gray[500],
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  urgentBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  jobHeaderInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  farmerName: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray[600],
  },
  jobDetails: {
    gap: 8,
  },
  jobDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobDetailText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  jobDetailTextMuted: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
  jobWage: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.emerald[600],
  },
  bottomSpacing: {
    height: 100,
  },
});
