import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { attendanceService } from "../services";
import { useAuth } from "../context/AuthContext";

export function CheckInScreen({ navigation, route }: any) {
  const { isAuthenticated, user } = useAuth();
  const jobApplicationId: string = route?.params?.jobApplicationId ?? "";

  const [checkInNotes, setCheckInNotes]   = useState("");
  const [attendanceId, setAttendanceId]   = useState<string>(route?.params?.attendanceId ?? "");
  const [checkOutNotes, setCheckOutNotes] = useState("");
  const [loading, setLoading]             = useState(false);
  const [checkedIn, setCheckedIn]         = useState(!!route?.params?.attendanceId);
  const [checkedOut, setCheckedOut]       = useState(false);

  if (!jobApplicationId) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 py-2">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Chấm công</Text>
          <View style={{ width: 22 }} />
        </View>
        <View className="flex-1 justify-center items-center p-8 gap-4">
          <Text className="text-[15px] text-slate-600 text-center leading-[22px]">
            Không tìm thấy thông tin đơn ứng tuyển.{"\n"}Vui lòng mở màn hình này từ danh sách công việc.
          </Text>
          <Button variant="outline" onPress={() => navigation.goBack()}>Quay lại</Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleCheckIn = async () => {
    if (!isAuthenticated || user?.isDemo) {
      setLoading(true);
      setTimeout(() => { setAttendanceId("mock-attendance-123"); setCheckedIn(true); Alert.alert("Thành công (Demo)", "Check in giả lập thành công!"); setLoading(false); }, 1000);
      return;
    }
    setLoading(true);
    try {
      const response = await attendanceService.checkIn({ jobApplicationId, checkInTime: new Date().toISOString(), checkInNotes: checkInNotes || undefined });
      setAttendanceId(response.id); setCheckedIn(true); Alert.alert("Thành công", "Check in thành công!");
    } catch { Alert.alert("Lỗi", "Không thể check in. Vui lòng thử lại."); }
    finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    if (!isAuthenticated || user?.isDemo) {
      setLoading(true);
      setTimeout(() => { setCheckedOut(true); Alert.alert("Thành công (Demo)", "Check out giả lập thành công!"); setLoading(false); }, 1000);
      return;
    }
    if (!attendanceId) { Alert.alert("Chưa check in", "Bạn cần check in trước khi check out."); return; }
    setLoading(true);
    try {
      await attendanceService.checkOut({ attendanceId, checkOutTime: new Date().toISOString(), checkOutNotes: checkOutNotes || undefined });
      setCheckedOut(true); Alert.alert("Thành công", "Check out thành công!");
    } catch { Alert.alert("Lỗi", "Không thể check out. Vui lòng thử lại."); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Chấm công</Text>
        <View style={{ width: 22 }} />
      </View>

      <View className="flex-1 p-4 gap-4">
        {/* Info chip */}
        <View className="bg-slate-50 rounded-xl border border-slate-200 p-2 gap-0.5">
          <Text className="text-[11px] font-semibold text-slate-500 uppercase" style={{ letterSpacing: 0.5 }}>Đơn ứng tuyển</Text>
          <Text className="text-[13px] text-slate-700" numberOfLines={1}>{jobApplicationId}</Text>
        </View>

        {/* Check in card */}
        <View className={["bg-white rounded-2xl p-4 border gap-2", checkedIn ? "border-primary-600 bg-primary-50" : "border-slate-200"].join(" ")}>
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-slate-900">Check in</Text>
            {checkedIn && <CheckCircle size={18} color="#059669" />}
          </View>
          {checkedIn ? (
            <View className="bg-white rounded-xl border border-primary-600 p-2 gap-0.5">
              <Text className="text-[11px] font-semibold text-primary-600 uppercase" style={{ letterSpacing: 0.5 }}>Attendance ID</Text>
              <Text className="text-[13px] text-slate-700" numberOfLines={1}>{attendanceId}</Text>
            </View>
          ) : (
            <>
              <Text className="text-sm font-semibold text-slate-700">Ghi chú (tuỳ chọn)</Text>
              <TextInput
                className="border border-slate-200 rounded-xl px-2 py-2 text-slate-900 min-h-[80px]"
                placeholder="Nhập ghi chú check in..." placeholderTextColor="#9ca3af"
                value={checkInNotes} onChangeText={setCheckInNotes} multiline
                textAlignVertical="top"
              />
              <Button onPress={handleCheckIn} loading={loading}>Check in ngay</Button>
            </>
          )}
        </View>

        {/* Check out card */}
        <View className={["bg-white rounded-2xl p-4 border gap-2", checkedOut ? "border-primary-600 bg-primary-50" : "border-slate-200"].join(" ")}>
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-slate-900">Check out</Text>
            {checkedOut && <CheckCircle size={18} color="#059669" />}
          </View>
          {checkedOut ? (
            <Text className="text-sm text-primary-600 font-semibold">Đã check out thành công.</Text>
          ) : (
            <>
              {!checkedIn && <Text className="text-xs text-slate-500">Hãy check in trước để mở chức năng này.</Text>}
              <Text className="text-sm font-semibold text-slate-700">Ghi chú (tuỳ chọn)</Text>
              <TextInput
                className="border border-slate-200 rounded-xl px-2 py-2 text-slate-900 min-h-[80px]"
                placeholder="Nhập ghi chú check out..." placeholderTextColor="#9ca3af"
                value={checkOutNotes} onChangeText={setCheckOutNotes} multiline
                textAlignVertical="top" editable={checkedIn}
              />
              <Button variant="outline" onPress={handleCheckOut} loading={loading} disabled={!checkedIn}>Check out</Button>
            </>
          )}
          <View className="flex-row items-center gap-1.5 mt-1">
            <Clock size={14} color="#6b7280" />
            <Text className="text-xs text-slate-500">Thời gian lấy theo đồng hồ thiết bị.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
