import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { attendanceService } from "../services";
import { WorkerAttendanceDTO } from "../services/attendance.service";

export function AttendanceDetailScreen({ navigation, route }: any) {
  const { attendanceId } = route.params || {};
  const [record, setRecord] = useState<WorkerAttendanceDTO | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!attendanceId) return;
      try {
        const data = await attendanceService.getAttendance(attendanceId);
        setRecord(data);
      } catch {
        setRecord(null);
      }
    };

    loadDetail().catch(() => undefined);
  }, [attendanceId]);

  if (!record) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <Text style={styles.title}>Chi tiết chấm công</Text>
          <View style={styles.card}>
            <EmptyState
              title="Không tìm thấy dữ liệu chấm công"
              description="Vui lòng quay lại danh sách và chọn một bản ghi hợp lệ."
              actionLabel="Quay lại lịch sử chấm công"
              onAction={() => navigation.goBack()}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Chi tiết chấm công</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Ngày làm việc</Text>
          <Text style={styles.text}>{record.workDate}</Text>

          <Text style={styles.label}>Giờ check in</Text>
          <Text style={styles.text}>{record.checkInTime}</Text>

          <Text style={styles.label}>Giờ check out</Text>
          <Text style={styles.text}>{record.checkOutTime || "--"}</Text>

          <Text style={styles.label}>Ghi chú check in</Text>
          <Text style={styles.text}>{record.checkInNotes || "--"}</Text>

          <Text style={styles.label}>Ghi chú check out</Text>
          <Text style={styles.text}>{record.checkOutNotes || "--"}</Text>

          <Text style={styles.label}>Tổng giờ làm</Text>
          <Text style={styles.text}>{record.totalHoursWorked ?? "--"}</Text>

          <Text style={styles.label}>Trạng thái duyệt</Text>
          <Text style={styles.text}>
            {record.isApproved ? "Đã duyệt" : "Chưa duyệt"}
          </Text>
        </View>
        <Button
          style={styles.button}
          onPress={() =>
            navigation.navigate("CheckIn", { attendanceId: record.id })
          }
        >
          Check out
        </Button>
      </View>
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
    padding: SPACING.md,
    gap: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.gray[900],
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: SPACING.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray[600],
  },
  text: {
    color: COLORS.gray[700],
  },
  button: {
    marginTop: SPACING.md,
  },
});
