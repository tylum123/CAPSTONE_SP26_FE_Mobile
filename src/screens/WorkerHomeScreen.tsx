import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
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
import { tabBarTranslateY } from "../navigation/WorkerTabNavigator";

export function WorkerHomeScreen({ navigation }: any) {
  const scrollY = useRef(0);
  const lastScrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;

    if (scrollDiff > 5) {
      // Scrolling down - hide tab bar
      Animated.timing(tabBarTranslateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (scrollDiff < -5) {
      // Scrolling up - show tab bar
      Animated.timing(tabBarTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };

  const nearbyJobs: Job[] = [
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

  const upcomingJobs: UpcomingJob[] = [
    {
      id: 1,
      title: "Phun thuốc trừ sâu",
      farmer: "Phạm Văn D",
      date: "15/01/2026",
      time: "06:00",
      status: "confirmed",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeCard}>
        <View style={styles.gradientOverlay} />
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeGreeting}>Xin chào</Text>
            <Text style={styles.welcomeName}>Minh Nguyen</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Star
                  size={14}
                  color={COLORS.amber[400]}
                  fill={COLORS.amber[400]}
                />
                <Text style={styles.statText}>4.8</Text>
              </View>
              <View style={styles.statBadge}>
                <Briefcase size={14} color={COLORS.white} />
                <Text style={styles.statText}>12 việc</Text>
              </View>
            </View>
          </View>
          <Avatar fallback="MN" size={64} style={styles.avatar} />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Briefcase size={20} color={COLORS.white} />
          </View>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Việc đã làm</Text>
        </View>
        <View style={styles.statCard}>
          <View
            style={[styles.statIcon, { backgroundColor: COLORS.amber[400] }]}
          >
            <Star size={20} color={COLORS.white} />
          </View>
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
        <View style={styles.statCard}>
          <View
            style={[styles.statIcon, { backgroundColor: COLORS.teal[600] }]}
          >
            <TrendingUp size={20} color={COLORS.white} />
          </View>
          <Text style={styles.statValue}>6.5M</Text>
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
            onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
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
  );
}

const styles = StyleSheet.create({
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
    borderRadius: BORDER_RADIUS.xl,
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
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
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
    borderRadius: BORDER_RADIUS.md,
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
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
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
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.emerald[600],
    fontWeight: "600",
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
    borderRadius: BORDER_RADIUS.md,
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
