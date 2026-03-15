import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui";
import { attendanceService } from "../services";
import { WorkerAttendanceDTO } from "../services/attendance.service";
import { useAuth } from "../context/AuthContext";

const MOCK: Record<string, WorkerAttendanceDTO> = {
  "1": { id: "1", jobApplicationId: "app1", checkInTime: "06:00", checkOutTime: "14:00", workDate: "18/01/2026", checkInNotes: "Đủ thiết bị", checkOutNotes: "Hoàn thiện 100%", totalHoursWorked: 8, isApproved: true, createdAt: "2026-01-18T06:00:00Z" },
  "2": { id: "2", jobApplicationId: "app2", checkInTime: "07:30", checkOutTime: "11:30", workDate: "15/01/2026", checkInNotes: "", checkOutNotes: "Kết thúc sớm do mưa", totalHoursWorked: 4, isApproved: false, createdAt: "2026-01-15T07:30:00Z" },
  "3": { id: "3", jobApplicationId: "app2", checkInTime: "13:00", checkOutTime: "17:00", workDate: "15/01/2026", checkInNotes: "", checkOutNotes: "", totalHoursWorked: 4, isApproved: false, createdAt: "2026-01-15T13:00:00Z" },
};

export function AttendanceDetailScreen({ navigation, route }: any) {
  const { isAuthenticated, user } = useAuth();
  const { attendanceId } = route.params || {};
  const [record, setRecord] = useState<WorkerAttendanceDTO | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) {
      setRecord(MOCK[attendanceId] ?? MOCK["1"]); return;
    }
    (async () => {
      if (!attendanceId) return;
      try { setRecord(await attendanceService.getAttendance(attendanceId)); }
      catch { setRecord(null); }
    })().catch(() => undefined);
  }, [attendanceId, isAuthenticated, user?.isDemo]);

  const Row = ({ label, value }: { label: string; value?: string | number | null }) => (
    <View className="gap-0.5">
      <Text className="text-[13px] font-semibold text-slate-600">{label}</Text>
      <Text className="text-slate-700">{value ?? "--"}</Text>
    </View>
  );

  if (!record) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
        <View className="flex-1 p-4 gap-4">
          <Text className="text-xl font-bold text-slate-900">Chi tiết chấm công</Text>
          <View className="bg-white rounded-2xl p-4 border border-slate-200">
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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-1 p-4 gap-4">
        <Text className="text-xl font-bold text-slate-900">Chi tiết chấm công</Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-200 gap-1">
          <Row label="Ngày làm việc"   value={record.workDate} />
          <Row label="Giờ check in"    value={record.checkInTime} />
          <Row label="Giờ check out"   value={record.checkOutTime} />
          <Row label="Ghi chú check in"  value={record.checkInNotes} />
          <Row label="Ghi chú check out" value={record.checkOutNotes} />
          <Row label="Tổng giờ làm"    value={record.totalHoursWorked} />
          <Row label="Trạng thái duyệt" value={record.isApproved ? "Đã duyệt" : "Chưa duyệt"} />
        </View>
        <Button onPress={() => navigation.navigate("CheckIn", { attendanceId: record.id })}>Check out</Button>
      </View>
    </SafeAreaView>
  );
}
