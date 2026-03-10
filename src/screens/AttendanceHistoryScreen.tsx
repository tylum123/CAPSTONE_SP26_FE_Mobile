import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Clock } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { EmptyState } from "../components/ui";
import { COLORS, SPACING } from "../constants/theme";
import { attendanceService } from "../services";
import { WorkerAttendanceDTO } from "../services/attendance.service";

import { useAuth } from "../context/AuthContext";

const mockAttendanceHistory: WorkerAttendanceDTO[] = [
  {
    id: "1",
    jobApplicationId: "app1",
    checkInTime: "06:00",
    checkOutTime: "14:00",
    workDate: "18/01/2026",
    checkInNotes: "",
    checkOutNotes: "",
    isApproved: true,
    createdAt: "2026-01-18T06:00:00Z",
  },
  {
    id: "2",
    jobApplicationId: "app2",
    checkInTime: "07:30",
    checkOutTime: "11:30",
    workDate: "15/01/2026",
    checkInNotes: "",
    checkOutNotes: "",
    isApproved: true,
    createdAt: "2026-01-15T07:30:00Z",
  },
  {
    id: "3",
    jobApplicationId: "app2",
    checkInTime: "13:00",
    checkOutTime: "17:00",
    workDate: "15/01/2026",
    checkInNotes: "",
    checkOutNotes: "",
    isApproved: true,
    createdAt: "2026-01-15T13:00:00Z",
  },
];

export function AttendanceHistoryScreen({ navigation }: any) {
  const { isAuthenticated, user } = useAuth();
  const [records, setRecords] = useState<WorkerAttendanceDTO[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) {
      setRecords(mockAttendanceHistory);
      return;
    }
    const loadHistory = async () => {
      try {
        const result = await attendanceService.getMyWorkerAttendance();
        setRecords(result);
      } catch {
        setRecords([]);
      }
    };

    loadHistory().catch(() => undefined);
  }, [isAuthenticated, user?.isDemo]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Lịch sử chấm công</Text>
        {records.length === 0 ? (
          <Card style={styles.card}>
            <CardContent>
              <EmptyState
                title="Chưa có lịch sử chấm công"
                description="Khi bạn bắt đầu check in cho các ca làm việc, lịch sử sẽ hiển thị tại đây."
              />
            </CardContent>
          </Card>
        ) : (
          records.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() =>
                navigation.navigate("AttendanceDetail", {
                  attendanceId: item.id,
                })
              }
            >
              <Card style={styles.card}>
                <CardContent>
                  <View style={styles.row}>
                    <Calendar size={16} color={COLORS.emerald[600]} />
                    <Text style={styles.text}>{item.workDate}</Text>
                  </View>
                  <View style={styles.row}>
                    <Clock size={16} color={COLORS.gray[500]} />
                    <Text style={styles.text}>
                      In: {item.checkInTime}
                      {item.checkOutTime ? ` | Out: ${item.checkOutTime}` : ""}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))
        )}
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
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  text: {
    color: COLORS.gray[700],
  },
});
