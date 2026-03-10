import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MapPin,
  Banknote,
  Star,
  Briefcase,
  TrendingUp,
  Bell,
  Search,
  Clock,
  ChevronRight,
  Flame,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { SectionHeader } from "../components/ui";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { Job, UpcomingJob } from "../types";
import { jobService, JobPostDTO, workerProfileService } from "../services";
import { useAuth } from "../context/AuthContext";
import { EmptyState } from "../components/ui";

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
    {
      id: 4,
      title: "Phun thuốc sâu",
      farmer: "Phạm Văn D",
      location: "An Giang",
      distance: "12 km",
      wage: "180,000",
      duration: "4 giờ",
      rating: 4.3,
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
    if (!isAuthenticated || user?.isDemo) {
      setNearbyJobs(demoNearbyJobs);
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
    if (!isAuthenticated || user?.isDemo) {
      setProfileRating(4.7);
      setTotalJobsCompleted(12);
      return;
    }
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
    () => (isAuthenticated && !user?.isDemo ? [] : demoUpcomingJobs),
    [isAuthenticated, user?.isDemo],
  );

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Chào buổi sáng";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const displayName = user?.name?.split(" ").pop() || "Bạn";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        data={nearbyJobs}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            {/* ── HERO ── */}
            <View style={styles.hero}>
              {/* decorative circles */}
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />

              {/* top row */}
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroGreet}>{getGreeting()} 👋</Text>
                  <Text style={styles.heroName}>{displayName}</Text>
                </View>
                <View style={styles.heroActions}>
                  <TouchableOpacity
                    style={styles.bellWrap}
                    onPress={() => navigation.navigate("Notifications")}
                  >
                    <Bell size={20} color={COLORS.white} />
                    <View style={styles.bellDot} />
                  </TouchableOpacity>
                  <Avatar
                    fallback={displayName[0]}
                    size={44}
                    style={styles.heroAvatar}
                  />
                </View>
              </View>

              {/* stat pills */}
              <View style={styles.heroPills}>
                <View style={styles.heroPill}>
                  <Star
                    size={13}
                    color={COLORS.amber[300]}
                    fill={COLORS.amber[300]}
                  />
                  <Text style={styles.heroPillText}>
                    {profileRating ?? "—"} sao
                  </Text>
                </View>
                <View style={styles.heroPillDot} />
                <View style={styles.heroPill}>
                  <Briefcase size={13} color={COLORS.emerald[200]} />
                  <Text style={styles.heroPillText}>
                    {totalJobsCompleted ?? 0} việc
                  </Text>
                </View>
              </View>

              {/* search bar */}
              <TouchableOpacity
                style={styles.searchBar}
                onPress={() => navigation.navigate("Search")}
                activeOpacity={0.9}
              >
                <Search size={17} color={COLORS.slate[400]} />
                <Text style={styles.searchPlaceholder}>
                  Tìm kiếm công việc...
                </Text>
                <View style={styles.searchFilter}>
                  <Text style={styles.searchFilterText}>Lọc</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── QUICK STATS ── */}
            <View style={styles.statsRow}>
              {[
                {
                  label: "Việc đã làm",
                  value: String(totalJobsCompleted ?? 0),
                  Icon: Briefcase,
                  color: COLORS.emerald[600],
                  bg: COLORS.emerald[50],
                },
                {
                  label: "Đánh giá",
                  value: String(profileRating ?? "—"),
                  Icon: Star,
                  color: COLORS.amber[500],
                  bg: COLORS.amber[50],
                },
                {
                  label: "Thu nhập",
                  value: "—",
                  Icon: TrendingUp,
                  color: COLORS.teal[600],
                  bg: COLORS.teal[50],
                },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: s.bg }]}>
                    <s.Icon size={18} color={s.color} />
                  </View>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* ── UPCOMING ── */}
            {upcomingJobs.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Lịch sắp tới" />
                {upcomingJobs.map((j) => (
                  <Card
                    key={j.id}
                    variant="elevated"
                    style={styles.upcomingCard}
                  >
                    <CardContent>
                      <View style={styles.upcomingRow}>
                        <View style={styles.dateBox}>
                          <Text style={styles.dateDay}>15</Text>
                          <Text style={styles.dateMon}>Th1</Text>
                        </View>
                        <View style={styles.upcomingInfo}>
                          <Text style={styles.upcomingTitle}>{j.title}</Text>
                          <Text style={styles.upcomingFarmer}>{j.farmer}</Text>
                          <View style={styles.upcomingTime}>
                            <Clock size={12} color={COLORS.emerald[600]} />
                            <Text style={styles.upcomingTimeText}>
                              {j.time}
                            </Text>
                          </View>
                        </View>
                        <Badge variant="success">Xác nhận</Badge>
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}

            {/* ── NEARBY HEADER ── */}
            <View style={styles.section}>
              <SectionHeader
                title="Việc gần bạn"
                subtitle="Phù hợp với khu vực của bạn"
                actionLabel="Xem tất cả"
                onPressAction={() => navigation.navigate("Search")}
              />
            </View>
          </>
        }
        renderItem={({ item: job }) => (
          <TouchableOpacity
            style={styles.jobCardWrap}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
          >
            <View style={styles.jobCard}>
              {/* left accent */}
              <View
                style={[styles.jobAccent, job.urgent && styles.jobAccentUrgent]}
              />

              <View style={styles.jobBody}>
                {/* header */}
                <View style={styles.jobHeader}>
                  <Avatar fallback={job.farmer[0]} size={42} />
                  <View style={styles.jobHeaderText}>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.jobFarmer}>{job.farmer}</Text>
                  </View>
                  {job.urgent && (
                    <View style={styles.urgentChip}>
                      <Flame size={11} color={COLORS.rose[500]} />
                      <Text style={styles.urgentText}>Gấp</Text>
                    </View>
                  )}
                </View>

                {/* divider */}
                <View style={styles.divider} />

                {/* meta */}
                <View style={styles.jobMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={13} color={COLORS.slate[400]} />
                    <Text style={styles.metaText}>{job.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={13} color={COLORS.slate[400]} />
                    <Text style={styles.metaText}>{job.duration}</Text>
                  </View>
                  <View style={[styles.metaItem, styles.wageItem]}>
                    <Banknote size={13} color={COLORS.emerald[600]} />
                    <Text style={styles.wageText}>{job.wage}đ</Text>
                  </View>
                  <ChevronRight
                    size={16}
                    color={COLORS.slate[300]}
                    style={{ marginLeft: "auto" }}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: SPACING.md }}>
            <Card variant="tinted">
              <CardContent>
                <EmptyState
                  title="Chưa có việc gần bạn"
                  description="Khi có việc phù hợp, chúng tôi sẽ gợi ý tại đây."
                />
              </CardContent>
            </Card>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.sage[50] },
  list: { flex: 1 },
  listContent: { paddingBottom: 110 },

  /* ── HERO ── */
  hero: {
    backgroundColor: COLORS.emerald[600],
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl + 8,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
    overflow: "hidden",
    position: "relative",
    marginBottom: SPACING.md,
  },
  heroCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -70,
    right: -50,
  },
  heroCircle2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: 10,
    left: -30,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  heroGreet: {
    color: COLORS.emerald[200],
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  heroName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  heroActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  bellWrap: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  bellDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.amber[400],
    borderWidth: 1.5,
    borderColor: COLORS.emerald[600],
  },
  heroAvatar: { borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" },
  heroPills: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    alignSelf: "flex-start",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: SPACING.md,
    gap: 8,
  },
  heroPill: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroPillDot: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  heroPillText: { color: COLORS.white, fontSize: 12, fontWeight: "600" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingLeft: SPACING.md,
    paddingRight: 6,
    height: 50,
    ...SHADOWS.md,
  },
  searchPlaceholder: { flex: 1, color: COLORS.slate[400], fontSize: 14 },
  searchFilter: {
    backgroundColor: COLORS.emerald[50],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.emerald[600],
  },

  /* ── STATS ROW ── */
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    gap: 10,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: 14,
    alignItems: "center",
    gap: 5,
    ...SHADOWS.xs,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: 18, fontWeight: "800", color: COLORS.slate[800] },
  statLabel: {
    fontSize: 11,
    color: COLORS.slate[500],
    fontWeight: "500",
    textAlign: "center",
  },

  /* ── SECTIONS ── */
  section: { paddingHorizontal: SPACING.md, marginBottom: SPACING.xs },

  /* ── UPCOMING ── */
  upcomingCard: { marginBottom: SPACING.sm },
  upcomingRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  dateBox: {
    backgroundColor: COLORS.emerald[50],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: "center",
    minWidth: 48,
    borderWidth: 1,
    borderColor: COLORS.emerald[100],
  },
  dateDay: { fontSize: 20, fontWeight: "800", color: COLORS.emerald[600] },
  dateMon: { fontSize: 11, color: COLORS.emerald[500], fontWeight: "600" },
  upcomingInfo: { flex: 1 },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.slate[800],
    marginBottom: 2,
  },
  upcomingFarmer: { fontSize: 12, color: COLORS.slate[500], marginBottom: 4 },
  upcomingTime: { flexDirection: "row", alignItems: "center", gap: 4 },
  upcomingTimeText: {
    fontSize: 12,
    color: COLORS.emerald[600],
    fontWeight: "600",
  },

  /* ── JOB CARDS ── */
  jobCardWrap: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: "row",
    overflow: "hidden",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  jobAccent: { width: 4, backgroundColor: COLORS.emerald[400] },
  jobAccentUrgent: { backgroundColor: COLORS.rose[500] },
  jobBody: { flex: 1, padding: SPACING.md },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  jobHeaderText: { flex: 1 },
  jobTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.slate[800],
    marginBottom: 1,
  },
  jobFarmer: { fontSize: 12, color: COLORS.slate[500] },
  urgentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.rose[50],
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.rose[500] + "40",
  },
  urgentText: { fontSize: 11, fontWeight: "700", color: COLORS.rose[500] },
  divider: {
    height: 1,
    backgroundColor: COLORS.slate[100],
    marginBottom: SPACING.sm,
  },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.slate[500] },
  wageItem: {
    backgroundColor: COLORS.emerald[50],
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  wageText: { fontSize: 12, color: COLORS.emerald[700], fontWeight: "700" },
});
