import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import {
  Star,
  Briefcase,
  Award,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Edit2,
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export function WorkerProfileScreen() {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView style={styles.container}>
        {/* Header with Edit Button */}
        <ImageBackground
          source={require("../../assets/bgWorker.jpg")}
          style={styles.headerContainer}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay}>
            <View style={styles.header}>
              <View style={styles.avatarSection}>
                <Avatar fallback={user?.name?.[0] || "MN"} size={80} />
                <Text style={styles.name}>{user?.name || "Minh Nguyen"}</Text>
                <Text style={styles.role}>Người lao động</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Edit2 size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Star
                size={20}
                color={COLORS.amber[400]}
                fill={COLORS.amber[400]}
              />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Briefcase size={20} color={COLORS.emerald[600]} />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Việc làm</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Award size={20} color={COLORS.teal[600]} />
            </View>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <CardContent>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <View style={styles.infoRow}>
              <MapPin size={18} color={COLORS.gray[600]} />
              <Text style={styles.infoText}>Cần Thơ, Việt Nam</Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={18} color={COLORS.gray[600]} />
              <Text style={styles.infoText}>0123 456 789</Text>
            </View>
            <View style={styles.infoRow}>
              <Mail size={18} color={COLORS.gray[600]} />
              <Text style={styles.infoText}>
                {user?.email || "minh.nguyen@email.com"}
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardContent>
            <Text style={styles.sectionTitle}>Kỹ năng</Text>
            <View style={styles.skillsContainer}>
              <View style={styles.skillBadge}>
                <Text style={styles.skillText}>Thu hoạch lúa</Text>
              </View>
              <View style={styles.skillBadge}>
                <Text style={styles.skillText}>Chăm sóc cây trồng</Text>
              </View>
              <View style={styles.skillBadge}>
                <Text style={styles.skillText}>Làm đất</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <View style={styles.logoutContainer}>
          <Button
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <LogOut size={15} color={COLORS.rose[500]} />
            <Text style={styles.logoutText}> Đăng xuất</Text>
          </Button>
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
  headerContainer: {
    position: "relative",
  },
  headerOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  header: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    top: SPACING.lg,
    right: SPACING.lg,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 10,
    elevation: 2,
  },
  avatarSection: {
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  role: {
    fontSize: 14,
    color: COLORS.white,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: SPACING.md,
  },
  statItem: {
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.emerald[50],
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
    fontSize: 12,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: COLORS.emerald[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  skillText: {
    fontSize: 12,
    color: COLORS.emerald[700],
    fontWeight: "600",
  },
  logoutContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderColor: COLORS.rose[500],
  },
  logoutText: {
    color: COLORS.rose[500],
    fontWeight: "600",
    fontSize: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});
