import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Clock } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { attendanceService } from "../services";
import { useAuth } from "../context/AuthContext";

export function CheckInScreen({ navigation, route }: any) {
  const { isAuthenticated } = useAuth();
  const [jobApplicationId, setJobApplicationId] = useState(
    route?.params?.jobApplicationId || "",
  );
  const [checkInNotes, setCheckInNotes] = useState("");
  const [attendanceId, setAttendanceId] = useState(
    route?.params?.attendanceId || "",
  );
  const [checkOutNotes, setCheckOutNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!isAuthenticated) {
      Alert.alert("Demo", "Vui lòng đăng nhập để check in.");
      return;
    }
    if (!jobApplicationId) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập jobApplicationId.");
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceService.checkIn({
        jobApplicationId,
        checkInTime: new Date().toISOString(),
        checkInNotes: checkInNotes || undefined,
      });
      setAttendanceId(response.id);
      Alert.alert("Thành công", "Check in thành công.");
    } catch {
      Alert.alert("Lỗi", "Không thể check in. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!isAuthenticated) {
      Alert.alert("Demo", "Vui lòng đăng nhập để check out.");
      return;
    }
    if (!attendanceId) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập attendanceId.");
      return;
    }

    setLoading(true);
    try {
      await attendanceService.checkOut({
        attendanceId,
        checkOutTime: new Date().toISOString(),
        checkOutNotes: checkOutNotes || undefined,
      });
      Alert.alert("Thành công", "Check out thành công.");
    } catch {
      Alert.alert("Lỗi", "Không thể check out. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={COLORS.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chấm công (Check in / out)</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Check in</Text>
          <Text style={styles.label}>Mã đơn ứng tuyển (jobApplicationId)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập jobApplicationId"
            placeholderTextColor={COLORS.gray[400]}
            value={jobApplicationId}
            onChangeText={setJobApplicationId}
          />
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ghi chú (tuỳ chọn)"
            placeholderTextColor={COLORS.gray[400]}
            value={checkInNotes}
            onChangeText={setCheckInNotes}
            multiline
          />
          <Button onPress={handleCheckIn} loading={loading}>
            Check in ngay
          </Button>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Check out</Text>
          <Text style={styles.label}>Mã chấm công (attendanceId)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập attendanceId"
            placeholderTextColor={COLORS.gray[400]}
            value={attendanceId}
            onChangeText={setAttendanceId}
          />
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ghi chú (tuỳ chọn)"
            placeholderTextColor={COLORS.gray[400]}
            value={checkOutNotes}
            onChangeText={setCheckOutNotes}
            multiline
          />
          <Button variant="outline" onPress={handleCheckOut} loading={loading}>
            Check out
          </Button>
          <View style={styles.hintRow}>
            <Clock size={14} color={COLORS.gray[500]} />
            <Text style={styles.hintText}>
              Thời gian sẽ lấy theo thời gian hiện tại của thiết bị.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.gray[900],
  },
  container: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray[900],
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[700],
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    color: COLORS.gray[900],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.xs,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
});
