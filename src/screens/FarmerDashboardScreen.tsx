import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Users,
  Briefcase,
  Banknote,
  TrendingUp,
  Plus,
  Star,
  Clock,
  LogOut,
  Edit2,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export function FarmerDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: logout },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert("Chỉnh sửa hồ sơ", "Chức năng này sẽ được phát triển sau");
  };

  const handleCreateJob = () => {
    Alert.alert("Đăng tin tuyển dụng", "Chức năng này sẽ được phát triển sau");
  };
  const stats = [
    {
      title: "Tin tuyển",
      value: "5",
      change: "+2 tuần này",
      icon: Briefcase,
      color: COLORS.emerald[600],
    },
    {
      title: "Ứng viên",
      value: "12",
      change: "3 mới",
      icon: Users,
      color: COLORS.amber[400],
    },
    {
      title: "Chi phí",
      value: "15.5M",
      change: "+12%",
      icon: Banknote,
      color: COLORS.teal[600],
    },
    {
      title: "Hoàn thành",
      value: "28",
      change: "95%",
      icon: TrendingUp,
      color: COLORS.emerald[600],
    },
  ];

  const recentApplicants = [
    {
      id: 1,
      name: "Trần Minh Đức",
      job: "Thu hoạch lúa",
      appliedAt: "2 giờ trước",
      rating: 4.8,
      completedJobs: 24,
      status: "pending" as const,
    },
    {
      id: 2,
      name: "Lê Thị Hoa",
      job: "Chăm sóc vườn cam",
      appliedAt: "5 giờ trước",
      rating: 4.5,
      completedJobs: 18,
      status: "pending" as const,
    },
  ];

  const activeJobs = [
    {
      id: 1,
      title: "Thu hoạch lúa mùa đông",
      slots: 5,
      filled: 3,
      applicants: 8,
      wage: "250,000",
      status: "active" as const,
      deadline: "15/01/2026",
    },
    {
      id: 2,
      title: "Chăm sóc vườn cam",
      slots: 3,
      filled: 2,
      applicants: 5,
      wage: "200,000",
      status: "active" as const,
      deadline: "18/01/2026",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ImageBackground
          source={require("../../assets/bgFarmer.jpg")}
          style={styles.header}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>Xin chào</Text>
                <Text style={styles.farmerName}>
                  {user?.name || "tylum2901"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCreateJob}
                style={styles.createButton}
                activeOpacity={0.8}
              >
                <Plus size={18} color={COLORS.white} />
                <Text style={styles.createButtonText}>Đăng tin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} style={styles.statCard}>
                <CardContent>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: stat.color + "20" },
                    ]}
                  >
                    <Icon size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  <Text style={styles.statChange}>{stat.change}</Text>
                </CardContent>
              </Card>
            );
          })}
        </View>

        {/* Recent Applicants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ứng viên mới</Text>
            <TouchableOpacity onPress={() => navigation.jumpTo("Applicants")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {recentApplicants.map((applicant) => (
            <Card key={applicant.id} style={styles.applicantCard}>
              <CardContent>
                <View style={styles.applicantHeader}>
                  <Avatar fallback={applicant.name[0]} size={48} />
                  <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>{applicant.name}</Text>
                    <Text style={styles.applicantJob}>{applicant.job}</Text>
                    <View style={styles.applicantMeta}>
                      <Star
                        size={12}
                        color={COLORS.amber[400]}
                        fill={COLORS.amber[400]}
                      />
                      <Text style={styles.applicantRating}>
                        {applicant.rating}
                      </Text>
                      <Text style={styles.applicantMetaText}>
                        • {applicant.completedJobs} việc
                      </Text>
                    </View>
                  </View>
                  <Badge variant="warning">Chờ duyệt</Badge>
                </View>
                <View style={styles.applicantActions}>
                  <Button variant="outline" size="sm" style={{ flex: 1 }}>
                    Từ chối
                  </Button>
                  <Button size="sm" style={{ flex: 1 }}>
                    Chấp nhận
                  </Button>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* Active Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tin tuyển đang hoạt động</Text>
            <TouchableOpacity onPress={() => navigation.jumpTo("Jobs")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {activeJobs.map((job) => (
            <Card key={job.id} style={styles.jobCard}>
              <CardContent>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Badge variant="success">Đang tuyển</Badge>
                </View>
                <View style={styles.jobProgress}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(job.filled / job.slots) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {job.filled}/{job.slots} vị trí
                  </Text>
                </View>
                <View style={styles.jobMeta}>
                  <View style={styles.jobMetaItem}>
                    <Users size={14} color={COLORS.gray[600]} />
                    <Text style={styles.jobMetaText}>
                      {job.applicants} ứng viên
                    </Text>
                  </View>
                  <View style={styles.jobMetaItem}>
                    <Banknote size={14} color={COLORS.emerald[600]} />
                    <Text style={styles.jobWage}>{job.wage}đ/ngày</Text>
                  </View>
                  <View style={styles.jobMetaItem}>
                    <Clock size={14} color={COLORS.gray[600]} />
                    <Text style={styles.jobMetaText}>{job.deadline}</Text>
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
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.emerald[50],
  },
  header: {
    height: 140,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.85,
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.white,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.emerald[600],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    width: "47%",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  statChange: {
    fontSize: 11,
    color: COLORS.emerald[600],
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
  applicantCard: {
    marginBottom: SPACING.md,
  },
  applicantHeader: {
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  applicantJob: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  applicantMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  applicantRating: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray[600],
  },
  applicantMetaText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  applicantActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
    flex: 1,
  },
  jobProgress: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.emerald[100],
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.emerald[600],
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  jobMeta: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  jobMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  jobWage: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.emerald[600],
  },
  bottomSpacing: {
    height: 100,
  },
});
