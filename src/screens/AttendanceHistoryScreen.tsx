import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Clock } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { EmptyState } from "../components/ui";
import { attendanceService } from "../services";
import { WorkerAttendanceDTO } from "../services/attendance.service";
import { useAuth } from "../context/AuthContext";

const MOCK: WorkerAttendanceDTO[] = [
  { id: "1", jobApplicationId: "app1", checkInTime: "06:00", checkOutTime: "14:00", workDate: "18/01/2026", checkInNotes: "", checkOutNotes: "", isApproved: true, createdAt: "2026-01-18T06:00:00Z" },
  { id: "2", jobApplicationId: "app2", checkInTime: "07:30", checkOutTime: "11:30", workDate: "15/01/2026", checkInNotes: "", checkOutNotes: "", isApproved: true, createdAt: "2026-01-15T07:30:00Z" },
  { id: "3", jobApplicationId: "app2", checkInTime: "13:00", checkOutTime: "17:00", workDate: "15/01/2026", checkInNotes: "", checkOutNotes: "", isApproved: true, createdAt: "2026-01-15T13:00:00Z" },
];

export function AttendanceHistoryScreen({ navigation }: any) {
  const { isAuthenticated, user } = useAuth();
  const [records, setRecords] = useState<WorkerAttendanceDTO[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) { setRecords(MOCK); return; }
    (async () => {
      try { setRecords(await attendanceService.getMyWorkerAttendance()); }
      catch { setRecords([]); }
    })().catch(() => undefined);
  }, [isAuthenticated, user?.isDemo]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold text-slate-900 mb-2">Lịch sử chấm công</Text>
        {records.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                title="Chưa có lịch sử chấm công"
                description="Khi bạn bắt đầu check in cho các ca làm việc, lịch sử sẽ hiển thị tại đây."
              />
            </CardContent>
          </Card>
        ) : (
          records.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => navigation.navigate("AttendanceDetail", { attendanceId: item.id })}>
              <Card className="mb-2">
                <CardContent>
                  <View className="flex-row items-center gap-2">
                    <Calendar size={16} color="#059669" />
                    <Text className="text-slate-700">{item.workDate}</Text>
                  </View>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Clock size={16} color="#6b7280" />
                    <Text className="text-slate-700">
                      In: {item.checkInTime}{item.checkOutTime ? ` | Out: ${item.checkOutTime}` : ""}
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
