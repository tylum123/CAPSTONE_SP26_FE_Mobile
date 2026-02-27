import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../components/ui/Avatar";
import { Card, CardContent } from "../components/ui/Card";
import { ListItem } from "../components/ui/ListItem";
import { SectionHeader } from "../components/ui/SectionHeader";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from "../constants/theme";
import {
  Heart,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Edit,
  Phone,
  Mail,
  Wallet,
  Briefcase,
  Star,
  Award,
  Bell,
  FileText,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { workerProfileService, WorkerProfileDTO } from "../services";

export function WorkerProfileScreen({ navigation }: any) {
  const { user, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<WorkerProfileDTO | null>(null);

  const demoProfile: WorkerProfileDTO = {
    id: "demo",
    userId: "demo",
    fullName: "Minh Nguyen",
    ageRange: "25-34",
    primaryLocation: "Cần Thơ, Việt Nam",
    travelRadiusKmPreference: 10,
    experienceLevelId: "demo",
    experienceLevel: "Trung cấp",
    averageRating: 4.8,
    availabilitySchedule: "T2-T7",
    totalJobsCompleted: 12,
    avatarUrl: "",
    createdAt: "",
    updatedAt: "",
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(demoProfile);
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await workerProfileService.getProfile();
        setProfile(data);
      } catch {
        setProfile(null);
      }
    };

    loadProfile().catch(() => undefined);
  }, [isAuthenticated]);

  const displayProfile = useMemo(() => {
    if (!isAuthenticated) return demoProfile;
    if (profile) return profile;
    return {
      ...demoProfile,
      fullName: user?.name || "",
      primaryLocation: "",
      experienceLevel: "",
      availabilitySchedule: "",
      averageRating: 0,
      totalJobsCompleted: 0,
      travelRadiusKmPreference: null,
    };
  }, [profile, isAuthenticated, user?.name]);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: logout },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", {
      currentProfile: {
        fullName: displayProfile.fullName || user?.name || "",
        ageRange: displayProfile.ageRange || "",
        primaryLocation: displayProfile.primaryLocation || "",
        travelRadiusKmPreference: displayProfile.travelRadiusKmPreference,
        experienceLevelId: displayProfile.experienceLevelId || "",
        availabilitySchedule: displayProfile.availabilitySchedule || "",
        avatarUrl: displayProfile.avatarUrl || "",
      },
      onUpdated: (updatedProfile: WorkerProfileDTO) =>
        setProfile(updatedProfile),
    });
  };

  const formatValue = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") {
      return "Chưa cập nhật";
    }
    return String(value);
  };

  const menuItems = [
    {
      icon: Bell,
      label: "Thông báo",
      onPress: () => navigation.navigate("Notifications"),
      color: COLORS.amber[600],
    },
    {
      icon: Heart,
      label: "Việc đã lưu",
      onPress: () => {},
      color: COLORS.rose[500],
    },
    {
      icon: FileText,
      label: "Lịch sử ứng tuyển",
      onPress: () => navigation.navigate("Jobs"),
      color: COLORS.blue[600],
    },
    {
      icon: CreditCard,
      label: "Ví & Thanh toán",
      onPress: () => navigation.navigate("Wallet"),
      color: COLORS.emerald[600],
    },
    {
      icon: Users,
      label: "Giới thiệu bạn bè",
      onPress: () => {},
      color: COLORS.teal[400],
    },
    {
      icon: Settings,
      label: "Cài đặt",
      onPress: () => {},
      color: COLORS.gray[600],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <Avatar
              source={
                displayProfile.avatarUrl
                  ? { uri: displayProfile.avatarUrl }
                  : undefined
              }
              fallback={displayProfile.fullName?.[0] || user?.name?.[0] || "M"}
              size={80}
            />
            <View style={styles.heroTextGroup}>
              <Text style={styles.name}>
                {displayProfile.fullName || user?.name || "Minh Nguyen"}
              </Text>
              <Text style={styles.role}>Người lao động</Text>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={handleEditProfile}
            >
              <Edit size={20} color={COLORS.slate[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.contactRow}>
            <View style={styles.contactChip}>
              <Phone size={14} color={COLORS.slate[500]} />
              <Text style={styles.contactText}>
                {isAuthenticated ? "--" : "0123 456 789"}
              </Text>
            </View>
            <View style={styles.contactChip}>
              <Mail size={14} color={COLORS.slate[500]} />
              <Text style={styles.contactText}>
                {user?.email || "minh.nguyen@email.com"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Card>
            <CardContent style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Wallet size={24} color={COLORS.emerald[600]} />
                <Text style={styles.statValue}>
                  {isAuthenticated ? "--" : "2.5M"}
                </Text>
                <Text style={styles.statLabel}>Ví tiền</Text>
              </View>
              <View style={[styles.statItem, styles.statBorderLeft]}>
                <Briefcase size={24} color={COLORS.blue[600]} />
                <Text style={styles.statValue}>
                  {displayProfile.totalJobsCompleted}
                </Text>
                <Text style={styles.statLabel}>Việc làm</Text>
              </View>
              <View style={[styles.statItem, styles.statBorderLeft]}>
                <Star size={24} color={COLORS.amber[400]} />
                <Text style={styles.statValue}>
                  {displayProfile.averageRating}
                </Text>
                <Text style={styles.statLabel}>Đánh giá</Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <SectionHeader title="Thông tin chi tiết" />
          <Card>
            <CardContent style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Độ tuổi</Text>
                <Text style={styles.detailValue}>
                  {formatValue(displayProfile.ageRange)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Khu vực</Text>
                <Text style={styles.detailValue}>
                  {formatValue(displayProfile.primaryLocation)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Kinh nghiệm</Text>
                <Text style={styles.detailValue}>
                  {formatValue(displayProfile.experienceLevel)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Lịch làm</Text>
                <Text style={styles.detailValue}>
                  {formatValue(displayProfile.availabilitySchedule)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bán kính</Text>
                <Text style={styles.detailValue}>
                  {displayProfile.travelRadiusKmPreference !== null &&
                  displayProfile.travelRadiusKmPreference !== undefined
                    ? `${displayProfile.travelRadiusKmPreference} km`
                    : "Chưa cập nhật"}
                </Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <SectionHeader title="Tiện ích" />
          <Card>
            <CardContent style={styles.menuCardContent}>
              {menuItems.map((item, index) => (
                <ListItem
                  key={index}
                  title={item.label}
                  leftSlot={
                    <View
                      style={[
                        styles.menuIconContainer,
                        { backgroundColor: `${item.color}15` },
                      ]}
                    >
                      <item.icon size={20} color={item.color} />
                    </View>
                  }
                  rightSlot={
                    <ChevronRight size={20} color={COLORS.slate[400]} />
                  }
                  onPress={item.onPress}
                  style={
                    index < menuItems.length - 1
                      ? styles.menuItemBorder
                      : undefined
                  }
                />
              ))}
            </CardContent>
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <Card>
            <CardContent style={styles.menuCardContent}>
              <ListItem
                title="Đăng xuất"
                style={{ backgroundColor: COLORS.rose[50] }}
                leftSlot={
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: COLORS.rose[50] },
                    ]}
                  >
                    <LogOut size={20} color={COLORS.rose[500]} />
                  </View>
                }
                onPress={handleLogout}
                isLast
              />
            </CardContent>
          </Card>
        </View>
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
  scrollContent: {
    paddingBottom: 100,
  },
  hero: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
    marginBottom: SPACING.md,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  heroTextGroup: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.title,
    fontSize: 22,
    color: COLORS.slate[900],
  },
  role: {
    ...TYPOGRAPHY.body,
    color: COLORS.slate[600],
    marginTop: 2,
  },
  editIconButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.slate[100],
    borderRadius: BORDER_RADIUS.full,
  },
  contactRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    flexWrap: "wrap",
  },
  contactChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.slate[100],
    borderRadius: BORDER_RADIUS.full,
  },
  contactText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.slate[600],
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: "row",
    padding: 0,
  },
  statItem: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    gap: SPACING.xs,
  },
  statBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.slate[100],
  },
  statValue: {
    ...TYPOGRAPHY.title,
    fontSize: 18,
    color: COLORS.slate[900],
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.slate[500],
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  detailItem: {
    width: "47%",
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.slate[500],
    marginBottom: 2,
  },
  detailValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.slate[900],
    fontWeight: "600",
  },
  menuCardContent: {
    padding: 0,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
