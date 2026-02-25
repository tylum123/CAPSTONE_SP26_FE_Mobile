import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING } from "../constants/theme";
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
          <Text style={styles.title}>Chi tiet cham cong</Text>
          <Text style={styles.emptyText}>Khong co du lieu</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Chi tiet cham cong</Text>
        <Text style={styles.text}>Ngay: {record.workDate}</Text>
        <Text style={styles.text}>Check in: {record.checkInTime}</Text>
        <Text style={styles.text}>
          Check out: {record.checkOutTime || "--"}
        </Text>
        <Text style={styles.text}>
          Ghi chu in: {record.checkInNotes || "--"}
        </Text>
        <Text style={styles.text}>
          Ghi chu out: {record.checkOutNotes || "--"}
        </Text>
        <Text style={styles.text}>
          Tong gio: {record.totalHoursWorked ?? "--"}
        </Text>
        <Text style={styles.text}>
          Duyet: {record.isApproved ? "Da duyet" : "Chua duyet"}
        </Text>

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
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.gray[900],
  },
  text: {
    color: COLORS.gray[700],
  },
  emptyText: {
    color: COLORS.gray[500],
  },
  button: {
    marginTop: SPACING.md,
  },
});
