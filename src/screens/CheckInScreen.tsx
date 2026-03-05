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
import { ArrowLeft, Clock, CheckCircle } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { attendanceService } from "../services";
import { useAuth } from "../context/AuthContext";

export function CheckInScreen({ navigation, route }: any) {
  const { isAuthenticated } = useAuth();

  // jobApplicationId bắt buộc phải được truyền qua navigation params
  const jobApplicationId: string = route?.params?.jobApplicationId ?? "";

  const [checkInNotes, setCheckInNotes] = useState("");
  // attendanceId: nhận từ params (nếu đã check-in trước đó) hoặc set sau khi check-in thành công
  const [attendanceId, setAttendanceId] = useState<string>(
    route?.params?.attendanceId ?? "",
  );
  const [checkOutNotes, setCheckOutNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(!!route?.params?.attendanceId);
  const [checkedOut, setCheckedOut] = useState(false);

  // Nếu không có jobApplicationId từ params thì hiển thị lỗi
  if (!jobApplicationId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={COLORS.gray[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chấm công</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Không tìm thấy thông tin đơn ứng tuyển.{"\n"}Vui lòng mở màn hình
            này từ danh sách công việc của bạn.
          </Text>
          <Button variant="outline" onPress={() => navigation.goBack()}>
            Quay lại
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleCheckIn = async () => {
    if (!isAuthenticated) {
      Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để check in.");
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
      setCheckedIn(true);
      Alert.alert("Thành công", "Check in thành công!");
    } catch {
      Alert.alert("Lỗi", "Không thể check in. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!isAuthenticated) {
      Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để check out.");
      return;
    }
    if (!attendanceId) {
      Alert.alert("Chưa check in", "Bạn cần check in trước khi check out.");
      return;
    }

    setLoading(true);
    try {
      await attendanceService.checkOut({
        attendanceId,
        checkOutTime: new Date().toISOString(),
        checkOutNotes: checkOutNotes || undefined,
      });
      setCheckedOut(true);
      Alert.alert("Thành công", "Check out thành công!");
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
        <Text style={styles.headerTitle}>Chấm công</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.container}>
        {/* Thông tin đơn ứng tuyển (read-only, từ navigation params) */}
        <View style={styles.infoChip}>
          <Text style={styles.infoChipLabel}>Đơn ứng tuyển</Text>
          <Text style={styles.infoChipValue} numberOfLines={1}>
            {jobApplicationId}
          </Text>
        </View>

        {/* Card Check in */}
        <View style={[styles.card, checkedIn && styles.cardDone]}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Check in</Text>
            {checkedIn && <CheckCircle size={18} color={COLORS.emerald[600]} />}
          </View>

          {checkedIn ? (
            <View style={styles.doneChip}>
              <Text style={styles.doneChipLabel}>Attendance ID</Text>
              <Text style={styles.doneChipValue} numberOfLines={1}>
                {attendanceId}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập ghi chú check in..."
                placeholderTextColor={COLORS.gray[400]}
                value={checkInNotes}
                onChangeText={setCheckInNotes}
                multiline
              />
              <Button onPress={handleCheckIn} loading={loading}>
                Check in ngay
              </Button>
            </>
          )}
        </View>

        {/* Card Check out */}
        <View style={[styles.card, checkedOut && styles.cardDone]}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Check out</Text>
            {checkedOut && (
              <CheckCircle size={18} color={COLORS.emerald[600]} />
            )}
          </View>

          {checkedOut ? (
            <Text style={styles.doneText}>Đã check out thành công.</Text>
          ) : (
            <>
              {!checkedIn && (
                <Text style={styles.hintText}>
                  Hãy check in trước để mở chức năng này.
                </Text>
              )}
              <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập ghi chú check out..."
                placeholderTextColor={COLORS.gray[400]}
                value={checkOutNotes}
                onChangeText={setCheckOutNotes}
                multiline
                editable={checkedIn}
              />
              <Button
                variant="outline"
                onPress={handleCheckOut}
                loading={loading}
                disabled={!checkedIn}
              >
                Check out
              </Button>
            </>
          )}

          <View style={styles.hintRow}>
            <Clock size={14} color={COLORS.gray[500]} />
            <Text style={styles.hintText}>
              Thời gian lấy theo đồng hồ thiết bị.
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
  // Info chip hiện jobApplicationId (read-only)
  infoChip: {
    backgroundColor: COLORS.gray[50] ?? "#f9fafb",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    padding: SPACING.sm,
    gap: 2,
  },
  infoChipLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoChipValue: {
    fontSize: 13,
    color: COLORS.gray[700],
    fontFamily: "monospace" as any,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: SPACING.sm,
  },
  cardDone: {
    borderColor: COLORS.emerald[600],
    backgroundColor: "#f0fdf4",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray[900],
  },
  // Attendance ID chip sau khi check-in thành công
  doneChip: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.emerald[600],
    padding: SPACING.sm,
    gap: 2,
  },
  doneChipLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.emerald[600],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  doneChipValue: {
    fontSize: 13,
    color: COLORS.gray[700],
    fontFamily: "monospace" as any,
  },
  doneText: {
    fontSize: 14,
    color: COLORS.emerald[600],
    fontWeight: "600",
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
  // Error state khi không có jobApplicationId từ params
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl ?? 32,
    gap: SPACING.md,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.gray[600],
    textAlign: "center",
    lineHeight: 22,
  },
});
