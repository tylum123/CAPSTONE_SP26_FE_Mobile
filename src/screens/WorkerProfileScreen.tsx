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
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SHADOWS,
} from "../constants/theme";
import {
  Heart,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Edit2,
  Phone,
  Mail,
  Wallet,
  Briefcase,
  Star,
  Bell,
  FileText,
  ChevronRight,
  MapPin,
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { workerProfileService, WorkerProfileDTO } from "../services";

export function WorkerProfileScreen({ navigation }: any) {
  const { user, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<WorkerProfileDTO | null>(null);

  const demoProfile: WorkerProfileDTO = {
    id: "demo",
    userId: "demo",
    fullName: "Demo",
    ageRange: "35-44",
    primaryLocation: "Thốt Nốt, Cần Thơ",
    travelRadiusKmPreference: 15,
    experienceLevelId: 2,
    experienceLevel: "Có kinh nghiệm",
    averageRating: 4.9,
    availabilitySchedule: "Thứ 2 - Thứ 7 (Sáng)",
    totalJobsCompleted: 45,
    avatarUrl: "",
    createdAt: "",
    updatedAt: "",
  };

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) {
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
  }, [isAuthenticated, user?.isDemo]);

  const displayProfile = useMemo(() => {
    if (!isAuthenticated || user?.isDemo) return demoProfile;
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
  }, [profile, isAuthenticated, user?.isDemo, user?.name]);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          logout().catch(() => undefined);
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", {
      currentProfile: {
        fullName: displayProfile.fullName || user?.name || "",
        ageRange: displayProfile.ageRange || "",
        primaryLocation: displayProfile.primaryLocation || "",
        travelRadiusKmPreference: displayProfile.travelRadiusKmPreference,
        experienceLevelId: displayProfile.experienceLevelId || 1,
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
      color: COLORS.amber[500],
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
      color: COLORS.teal[600],
    },
    {
      icon: Settings,
      label: "Cài đặt",
      onPress: () => {},
      color: COLORS.slate[500],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO CARD ── */}
        <View style={styles.heroCard}>
          {/* Decorative bubbles */}
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />

          <View style={styles.heroInner}>
            {/* Avatar + Edit button */}
            <View style={styles.avatarRow}>
              <View style={styles.avatarRing}>
                <Avatar
                  source={
                    displayProfile.avatarUrl
                      ? { uri: displayProfile.avatarUrl }
                      : undefined
                  }
                  fallback={
                    displayProfile.fullName?.[0] || user?.name?.[0] || "H"
                  }
                  size={80}
                />
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <Edit2 size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.heroName}>
              {displayProfile.fullName || user?.name || "Mai Thị Hạnh"}
            </Text>
            <Text style={styles.heroRole}>Người lao động nông nghiệp</Text>

            {/* Location chip */}
            <View style={styles.locationChip}>
              <MapPin size={13} color={COLORS.emerald[200]} />
              <Text style={styles.locationText}>
                {displayProfile.primaryLocation || "Chưa cập nhật vị trí"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View
              style={[styles.statIcon, { backgroundColor: COLORS.emerald[50] }]}
            >
              <Wallet size={22} color={COLORS.emerald[600]} />
            </View>
            <Text style={styles.statValue}>
              {isAuthenticated && !user?.isDemo ? "--" : "8.5M"}
            </Text>
            <Text style={styles.statLabel}>Ví tiền</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View
              style={[styles.statIcon, { backgroundColor: COLORS.blue[50] }]}
            >
              <Briefcase size={22} color={COLORS.blue[600]} />
            </View>
            <Text style={styles.statValue}>
              {displayProfile.totalJobsCompleted}
            </Text>
            <Text style={styles.statLabel}>Việc làm</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View
              style={[styles.statIcon, { backgroundColor: COLORS.amber[50] }]}
            >
              <Star size={22} color={COLORS.amber[400]} />
            </View>
            <Text style={styles.statValue}>{displayProfile.averageRating}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
        </View>

        {/* ── CONTACT CHIPS ── */}
        <View style={styles.contactRow}>
          <View style={styles.contactChip}>
            <Phone size={14} color={COLORS.emerald[600]} />
            <Text style={styles.contactText}>
              {isAuthenticated && !user?.isDemo ? "--" : "0123 456 789"}
            </Text>
          </View>
          <View style={styles.contactChip}>
            <Mail size={14} color={COLORS.emerald[600]} />
            <Text style={styles.contactText} numberOfLines={1}>
              {user?.email || "maithihanh.tc@gmail.com"}
            </Text>
          </View>
        </View>

        {/* ── DETAILS ── */}
        <View style={styles.section}>
          <SectionHeader title="Thông tin chi tiết" />
          <Card variant="default">
            <CardContent style={styles.detailGrid}>
              {[
                {
                  label: "Độ tuổi",
                  value: formatValue(displayProfile.ageRange),
                },
                {
                  label: "Khu vực",
                  value: formatValue(displayProfile.primaryLocation),
                },
                {
                  label: "Kinh nghiệm",
                  value: formatValue(displayProfile.experienceLevel),
                },
                {
                  label: "Lịch làm việc",
                  value: formatValue(displayProfile.availabilitySchedule),
                },
                {
                  label: "Bán kính đi lại",
                  value:
                    displayProfile.travelRadiusKmPreference != null
                      ? `${displayProfile.travelRadiusKmPreference} km`
                      : "Chưa cập nhật",
                },
              ].map((item) => (
                <View key={item.label} style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              ))}
            </CardContent>
          </Card>
        </View>

        {/* ── MENU ── */}
        <View style={styles.section}>
          <SectionHeader title="Tiện ích" />
          <Card variant="elevated">
            <CardContent style={styles.menuContent}>
              {menuItems.map((item, index) => (
                <ListItem
                  key={index}
                  title={item.label}
                  leftSlot={
                    <View
                      style={[
                        styles.menuIcon,
                        { backgroundColor: `${item.color}18` },
                      ]}
                    >
                      <item.icon size={20} color={item.color} />
                    </View>
                  }
                  rightSlot={
                    <ChevronRight size={18} color={COLORS.slate[300]} />
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

        {/* ── LOGOUT ── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <LogOut size={18} color={COLORS.rose[500]} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.sage[50],
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },

  /* ── HERO ── */
  heroCard: {
    backgroundColor: COLORS.emerald[600],
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
    overflow: "hidden",
    position: "relative",
    ...SHADOWS.emerald,
  },
  bubble1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -70,
    right: -50,
  },
  bubble2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -30,
    left: -20,
  },
  heroInner: {
    alignItems: "center",
  },
  avatarRow: {
    position: "relative",
    marginBottom: SPACING.md,
  },
  avatarRing: {
    padding: 3,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.emerald[500],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroRole: {
    fontSize: 13,
    color: COLORS.emerald[200],
    fontWeight: "500",
    marginBottom: SPACING.sm,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  locationText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
  },

  /* ── STATS ── */
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.slate[100],
    alignSelf: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.slate[800],
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.slate[500],
    fontWeight: "500",
  },

  /* ── CONTACT ── */
  contactRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    flexWrap: "wrap",
  },
  contactChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.emerald[50],
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
    flex: 1,
  },
  contactText: {
    fontSize: 12,
    color: COLORS.emerald[700],
    fontWeight: "600",
    flex: 1,
  },

  /* ── SECTION ── */
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
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
    fontSize: 11,
    color: COLORS.slate[400],
    fontWeight: "600",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.slate[800],
    fontWeight: "600",
  },

  /* ── MENU ── */
  menuContent: {
    padding: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[50],
  },

  /* ── LOGOUT ── */
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.rose[50],
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.rose[500] + "30",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.rose[500],
  },
});
