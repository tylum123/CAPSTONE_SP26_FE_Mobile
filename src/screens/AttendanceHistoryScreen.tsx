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
import { COLORS, SPACING } from "../constants/theme";
import { attendanceService, workerProfileService } from "../services";
import { WorkerAttendanceDTO } from "../services/attendance.service";

export function AttendanceHistoryScreen({ navigation }: any) {
  const [records, setRecords] = useState<WorkerAttendanceDTO[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const profile = await workerProfileService.getProfile();
        const result = await attendanceService.getWorkerAttendance(profile.id);
        setRecords(result);
      } catch {
        setRecords([]);
      }
    };

    loadHistory().catch(() => undefined);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Lich su cham cong</Text>
        {records.length === 0 ? (
          <Text style={styles.emptyText}>Chua co du lieu</Text>
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
    backgroundColor: COLORS.emerald[50],
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
  },
  emptyText: {
    color: COLORS.gray[500],
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
