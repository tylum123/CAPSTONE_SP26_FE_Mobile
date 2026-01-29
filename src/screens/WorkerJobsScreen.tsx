import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import {
  Clock,
  MapPin,
  Banknote,
  Calendar,
  CheckCircle2,
  Star,
} from "lucide-react-native";

type TabType = "applied" | "upcoming" | "completed";

export function WorkerJobsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>("applied");

  const appliedJobs = [
    {
      id: 1,
      title: "Thu hoạch lúa",
      farmer: "Nguyễn Văn A",
      location: "Cần Thơ",
      date: "22/01/2026",
      time: "06:00 - 12:00",
      wage: 250000,
      status: "pending" as const,
      appliedDate: "20/01/2026",
    },
    {
      id: 2,
      title: "Chăm sóc vườn cam",
      farmer: "Trần Thị B",
      location: "Vĩnh Long",
      date: "23/01/2026",
      time: "07:00 - 11:00",
      wage: 200000,
      status: "accepted" as const,
      appliedDate: "19/01/2026",
    },
  ];

  const upcomingJobs = [
    {
      id: 3,
      title: "Chăm sóc vườn cam",
      farmer: "Trần Thị B",
      location: "Vĩnh Long",
      date: "23/01/2026",
      time: "07:00 - 11:00",
      wage: 200000,
      status: "confirmed" as const,
    },
    {
      id: 4,
      title: "Phun thuốc sâu",
      farmer: "Lê Văn C",
      location: "Tiền Giang",
      date: "25/01/2026",
      time: "06:00 - 09:00",
      wage: 150000,
      status: "confirmed" as const,
    },
  ];

  const completedJobs = [
    {
      id: 5,
      title: "Làm đất trồng rau",
      farmer: "Phạm Thị D",
      location: "An Giang",
      date: "18/01/2026",
      completedDate: "18/01/2026",
      wage: 180000,
      rating: 5,
      review: "Công việc tốt, người thuê nhiệt tình",
      paidAmount: 180000,
    },
    {
      id: 6,
      title: "Thu hoạch rau",
      farmer: "Nguyễn Văn E",
      location: "Đồng Tháp",
      date: "15/01/2026",
      completedDate: "15/01/2026",
      wage: 200000,
      rating: 4,
      review: null,
      paidAmount: 200000,
    },
  ];

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "applied" && styles.tabActive]}
        onPress={() => setActiveTab("applied")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "applied" && styles.tabTextActive,
          ]}
        >
          Đã apply
        </Text>
        <Badge variant={activeTab === "applied" ? "default" : "secondary"}>
          {appliedJobs.length}
        </Badge>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
        onPress={() => setActiveTab("upcoming")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "upcoming" && styles.tabTextActive,
          ]}
        >
          Sắp tới
        </Text>
        <Badge variant={activeTab === "upcoming" ? "default" : "secondary"}>
          {upcomingJobs.length}
        </Badge>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "completed" && styles.tabActive]}
        onPress={() => setActiveTab("completed")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "completed" && styles.tabTextActive,
          ]}
        >
          Đã hoàn thành
        </Text>
        <Badge variant={activeTab === "completed" ? "default" : "secondary"}>
          {completedJobs.length}
        </Badge>
      </TouchableOpacity>
    </View>
  );

  const renderAppliedJobs = () => (
    <>
      {appliedJobs.map((job) => (
        <TouchableOpacity
          key={job.id}
          onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
          activeOpacity={0.7}
        >
          <Card style={styles.jobCard}>
            <CardContent>
              <View style={styles.cardHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Badge
                  variant={job.status === "accepted" ? "success" : "warning"}
                >
                  {job.status === "accepted" ? "Đã chấp nhận" : "Chờ xác nhận"}
                </Badge>
              </View>

              <Text style={styles.farmerName}>{job.farmer}</Text>

              <View style={styles.jobInfo}>
                <View style={styles.infoRow}>
                  <MapPin size={16} color={COLORS.gray[500]} />
                  <Text style={styles.infoText}>{job.location}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Calendar size={16} color={COLORS.gray[500]} />
                  <Text style={styles.infoText}>
                    {job.date} • {job.time}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Banknote size={16} color={COLORS.emerald[600]} />
                  <Text style={styles.wageText}>
                    {job.wage.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </View>
              </View>

              <Text style={styles.appliedDate}>Applied: {job.appliedDate}</Text>
            </CardContent>
          </Card>
        </TouchableOpacity>
      ))}
    </>
  );

  const renderUpcomingJobs = () => (
    <>
      {upcomingJobs.map((job) => (
        <Card key={job.id} style={styles.jobCard}>
          <CardContent>
            <View style={styles.cardHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Badge variant="success">Đã xác nhận</Badge>
            </View>

            <Text style={styles.farmerName}>{job.farmer}</Text>

            <View style={styles.jobInfo}>
              <View style={styles.infoRow}>
                <MapPin size={16} color={COLORS.gray[500]} />
                <Text style={styles.infoText}>{job.location}</Text>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={16} color={COLORS.emerald[600]} />
                <Text style={styles.highlightText}>
                  {job.date} • {job.time}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Banknote size={16} color={COLORS.emerald[600]} />
                <Text style={styles.wageText}>
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
      ))}
    </>
  );

  const renderCompletedJobs = () => (
    <>
      {completedJobs.map((job) => (
        <Card key={job.id} style={styles.jobCard}>
          <CardContent>
            <View style={styles.cardHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <CheckCircle2 size={20} color={COLORS.emerald[600]} />
            </View>

            <Text style={styles.farmerName}>{job.farmer}</Text>

            <View style={styles.jobInfo}>
              <View style={styles.infoRow}>
                <MapPin size={16} color={COLORS.gray[500]} />
                <Text style={styles.infoText}>{job.location}</Text>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={16} color={COLORS.gray[500]} />
                <Text style={styles.infoText}>
                  Hoàn thành: {job.completedDate}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Banknote size={16} color={COLORS.emerald[600]} />
                <Text style={styles.paidText}>
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
                onPress={() => navigation.navigate("Review", { jobId: job.id })}
              >
                Đánh giá công việc
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {renderTabBar()}

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
    backgroundColor: COLORS.emerald[50],
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.emerald[50],
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    elevation: 2,
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: COLORS.emerald[600],
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray[600],
  },
  tabTextActive: {
    color: COLORS.emerald[700],
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  jobTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  farmerName: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  jobInfo: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  highlightText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.emerald[700],
  },
  wageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.emerald[700],
  },
  paidText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.emerald[600],
  },
  appliedDate: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  ratingSection: {
    padding: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    gap: SPACING.xs,
  },
  ratingLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.gray[700],
    fontStyle: "italic",
    marginTop: SPACING.xs,
  },
});
