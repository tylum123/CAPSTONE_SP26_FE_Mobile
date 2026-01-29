import React from "react";
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
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import {
  Heart,
  CreditCard,
  Users,
  Tag,
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
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export function WorkerProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: logout },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", {
      currentProfile: {
        name: user?.name || "Minh Nguyen",
        phone: "0123456789",
        email: "minh@example.com",
        address: "Cần Thơ, Việt Nam",
        bio: "Có kinh nghiệm 5 năm làm việc trong lĩnh vực nông nghiệp",
        skills: "Thu hoạch, Chăm sóc cây trồng, Phun thuốc, Làm đất",
      },
    });
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
        {/* Profile Info */}
        <View style={styles.profileSection}>
          {/* Avatar, Name and Edit Button Row */}
          <View style={styles.profileHeader}>
            <Avatar fallback={user?.name?.[0] || "MN"} size={80} />
            <View style={styles.profileNameContainer}>
              <Text style={styles.name}>{user?.name || "Minh Nguyen"}</Text>
              <Text style={styles.role}>Người lao động</Text>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={handleEditProfile}
            >
              <Edit size={22} color={COLORS.gray[700]} />
            </TouchableOpacity>
          </View>

          {/* Contact Info - Đơn giản, sát với profile */}
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <Phone size={16} color={COLORS.gray[500]} />
              <Text style={styles.contactText}>0123 456 789</Text>
            </View>
            <View style={styles.contactItem}>
              <Mail size={16} color={COLORS.gray[500]} />
              <Text style={styles.contactText}>
                {user?.email || "minh.nguyen@email.com"}
              </Text>
            </View>
          </View>

          {/* Stats Grid - Border ở giữa chia 4 mục */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              {/* Row 1 */}
              <View style={styles.statItem}>
                <Wallet size={24} color={COLORS.emerald[600]} />
                <Text style={styles.statValue}>2.500.000đ</Text>
                <Text style={styles.statLabel}>Ví tiền</Text>
              </View>
              <View style={[styles.statItem, styles.statBorderLeft]}>
                <Briefcase size={24} color={COLORS.blue[600]} />
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Việc làm</Text>
              </View>
              {/* Row 2 */}
              <View style={[styles.statItem, styles.statBorderTop]}>
                <Star size={24} color={COLORS.amber[600]} />
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Đánh giá</Text>
              </View>
              <View
                style={[
                  styles.statItem,
                  styles.statBorderLeft,
                  styles.statBorderTop,
                ]}
              >
                <Award size={24} color={COLORS.pink[500]} />
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>Hoàn thành</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: COLORS.blue[50] },
                  ]}
                >
                  <item.icon size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: COLORS.red[50] },
                ]}
              >
                <LogOut size={20} color={COLORS.rose[500]} />
              </View>
              <Text style={[styles.menuLabel, { color: COLORS.rose[500] }]}>
                Đăng xuất
              </Text>
            </View>
          </TouchableOpacity>
        </View>
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
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  profileNameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  role: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  editIconButton: {
    padding: SPACING.sm,
  },
  contactContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statItem: {
    width: "50%",
    paddingVertical: SPACING.xl,
    alignItems: "center",
    gap: SPACING.xs,
  },
  statBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray[200],
  },
  statBorderTop: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  menuContainer: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 16,
    color: COLORS.gray[900],
    fontWeight: "500",
  },
});
