/* AI CONTEXT:
 * Action: Guides new users through initial profile completion after registration.
 * Inputs: Basic personal details, role preferences.
 * Outputs: Completed profile state payload.
 * Dependencies: Auth context, User service. */

import React, { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { User, MapPin, Calendar, Clock, Camera, ChevronRight, CheckCircle2, Check } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { LocationPicker } from "../components/profile/LocationPicker";
import { mediaService, workerProfileService } from "../services/export_services";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import { formatLocation } from "../utils/locationUtils";
import { WelcomeModal } from "../components/ui/WelcomeModal";
import { useAuth } from "../context/AuthContext";

// ── Constants ─────────────────────────────────────────────────────────────────
const EXPERIENCE_LEVELS = [
  { id: 1, label: "Dưới 6 tháng" },
  { id: 2, label: "Dưới 12 tháng" },
  { id: 3, label: "Trên 12 tháng" },
];

const DAYS = [
  { id: "T2", label: "T2" }, { id: "T3", label: "T3" },
  { id: "T4", label: "T4" }, { id: "T5", label: "T5" },
  { id: "T6", label: "T6" }, { id: "T7", label: "T7" },
  { id: "CN", label: "CN" },
];
const DAYS_ORDER = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const LABELS_MAP: Record<string, string> = {
  T2: "Thứ 2", T3: "Thứ 3", T4: "Thứ 4", T5: "Thứ 5",
  T6: "Thứ 6", T7: "Thứ 7", CN: "Chủ nhật",
};

function formatSchedule(schedule: string): string {
  if (!schedule || !schedule.trim()) return "";
  const selectedIds = schedule.split(", ").map(s => s.trim()).filter(id => !!LABELS_MAP[id]);
  if (selectedIds.length === 0) return "";
  if (selectedIds.length === 7) return "Cả tuần";
  const sorted = [...selectedIds].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
  if (sorted.length === 1) return LABELS_MAP[sorted[0]];
  const indices = sorted.map(id => DAYS_ORDER.indexOf(id));
  let consecutive = true;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) { consecutive = false; break; }
  }
  if (consecutive) return `${LABELS_MAP[sorted[0]]} đến ${LABELS_MAP[sorted[sorted.length - 1]].toLowerCase()}`;
  return sorted.map(id => LABELS_MAP[id]).join(", ");
}

// ── Sub-components defined at TOP-LEVEL (stable React types) ─────────────────
interface ExperienceSelectorProps {
  selected: number;
  onSelect: (id: number) => void;
}
function ExperienceSelector({ selected, onSelect }: ExperienceSelectorProps) {
  return (
    <View className="flex-row gap-2 mt-2">
      {EXPERIENCE_LEVELS.map(level => (
        <TouchableOpacity
          key={level.id}
          onPress={() => onSelect(level.id)}
          className={[
            "flex-1 py-3 px-1 rounded-2xl border items-center justify-center",
            selected === level.id ? "bg-primary-600 border-primary-600" : "bg-white border-slate-200"
          ].join(" ")}
        >
          <Text className={["text-[11px] font-bold text-center", selected === level.id ? "text-white" : "text-slate-500"].join(" ")}>
            {level.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

interface DayPickerProps {
  schedule: string;
  summary: string;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}
function DayPicker({ schedule, summary, onToggle, onSelectAll, onClear }: DayPickerProps) {
  const selected = schedule ? schedule.split(", ") : [];
  return (
    <View>
      <View className="flex-row justify-between mt-4 mb-4 px-1">
        {DAYS.map(day => {
          const isSelected = selected.includes(day.id);
          return (
            <TouchableOpacity
              key={day.id}
              onPress={() => onToggle(day.id)}
              className={[
                "w-10 h-10 rounded-full items-center justify-center border",
                isSelected ? "bg-primary-600 border-primary-600" : "bg-white border-slate-200"
              ].join(" ")}
            >
              <Text className={["text-[12px] font-extrabold", isSelected ? "text-white" : "text-slate-500"].join(" ")}>
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View className="flex-row items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-dashed border-slate-200">
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <CheckCircle2 size={14} color={schedule ? COLORS.primary[600] : COLORS.slate[400]} />
          <Text className="text-[11px] text-slate-500 font-bold flex-1" numberOfLines={1}>{summary || "Chưa chọn ngày"}</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={onSelectAll}>
            <Text className="text-[10px] text-primary-700 font-extrabold tracking-tight uppercase">Tất cả</Text>
          </TouchableOpacity>
          <View className="w-px h-3 bg-slate-300" />
          <TouchableOpacity onPress={onClear}>
            <Text className="text-[10px] text-rose-600 font-extrabold tracking-tight uppercase">Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function OnboardingProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!!user?.isNewUser);

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    provinceId: null as number | null,
    districtId: null as number | null,
    provinceName: "",
    districtName: "",
    ward: "",
    street: "",
    travelRadiusKmPreference: "10",
    experienceLevelId: 1,
    availabilitySchedule: "",
    avatarUrl: "",
  });

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePickAvatar = async () => {
    setAvatarUploading(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("Thiếu quyền", "Cần quyền truy cập thư viện ảnh."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const uploaded = await mediaService.uploadImage({ uri: asset.uri, name: asset.fileName || "avatar.jpg", type: asset.mimeType || "image/jpeg" });
      updateField("avatarUrl", uploaded);
    } catch { Alert.alert("Lỗi", "Không thể tải ảnh lên."); }
    finally { setAvatarUploading(false); }
  };

  const handleDateChange = useCallback((text: string) => {
    let clean = text.replace(/[^0-9]/g, "");
    if (clean.length > 8) clean = clean.slice(0, 8);
    let formatted = clean;
    if (clean.length > 2) formatted = clean.slice(0, 2) + "/" + clean.slice(2);
    if (clean.length > 4) formatted = formatted.slice(0, 5) + "/" + clean.slice(4);
    updateField("dateOfBirth", formatted);
  }, [updateField]);

  const handleContinue = async () => {
    const primaryLocation = formatLocation(formData);
    const { fullName, dateOfBirth, availabilitySchedule, experienceLevelId, travelRadiusKmPreference, avatarUrl } = formData;
    if (!fullName || !dateOfBirth || dateOfBirth.length < 10 || !primaryLocation || !availabilitySchedule) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường bắt buộc, ngày sinh định dạng DD/MM/YYYY.");
      return;
    }

    const [dd, mm, yyyy] = dateOfBirth.split("/");
    const isoDateOfBirth = `${yyyy}-${mm}-${dd}T00:00:00Z`;
    setLoading(true);
    try {
      await workerProfileService.updateProfile({ fullName, dateOfBirth: isoDateOfBirth, primaryLocation, travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : undefined, experienceLevelId, availabilitySchedule, avatarUrl: avatarUrl || "" });
      navigation.replace("Worker");
    } catch { Alert.alert("Lỗi", "Không thể tạo hồ sơ. Vui lòng thử lại."); }
    finally { setLoading(false); }
  };

  const toggleDay = useCallback((dayId: string) => {
    setFormData(prev => {
      const current = (prev.availabilitySchedule || "").trim() ? prev.availabilitySchedule.split(", ") : [];
      const next = current.includes(dayId)
        ? current.filter(d => d !== dayId)
        : [...current, dayId].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
      return { ...prev, availabilitySchedule: next.join(", ") };
    });
  }, []);

  const selectAllDays = useCallback(() => updateField("availabilitySchedule", "T2, T3, T4, T5, T6, T7, CN"), [updateField]);
  const clearDays = useCallback(() => updateField("availabilitySchedule", ""), [updateField]);
  const handleSelectExperience = useCallback((id: number) => updateField("experienceLevelId", id), [updateField]);

  const scheduleSummary = useMemo(() => formatSchedule(formData.availabilitySchedule), [formData.availabilitySchedule]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <View className="flex-1">
        <View className="px-6 py-6 bg-white border-b border-slate-100">
          <Text style={TYPOGRAPHY.title} className="text-slate-900">Thiết lập hồ sơ 🚀</Text>
          <Text className="text-slate-500 mt-1">Hoàn thiện thông tin để bắt đầu nhận việc</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          {/* Avatar */}
          <View className="items-center mb-8">
            <View className="relative">
              <Avatar source={formData.avatarUrl ? { uri: formData.avatarUrl } : undefined} fallback={formData.fullName[0] || "M"} size={110} />
              <TouchableOpacity
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full justify-center items-center border-4 border-white"
                onPress={handlePickAvatar} disabled={avatarUploading}
              >
                <Camera size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="mt-3 text-[13px] text-slate-500 font-bold uppercase tracking-wider">
              {avatarUploading ? "Đang tải ảnh..." : "Ảnh đại diện"}
            </Text>
          </View>

          <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
            {/* Tên */}
            <View className="mb-6">
              <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Họ và tên <Text className="text-rose-500">*</Text></Text>
              <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
                <User size={18} color={COLORS.slate[400]} />
                <TextInput className="flex-1 text-[15px] text-slate-900 py-2 font-bold" value={formData.fullName} onChangeText={t => updateField("fullName", t)} placeholder="Nhập họ và tên" placeholderTextColor={COLORS.slate[400]} />
                {formData.fullName.length > 0 && <Check size={16} color={COLORS.primary[500]} />}
              </View>
            </View>

            {/* Ngày sinh */}
            <View className="mb-6">
              <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Ngày sinh (DD/MM/YYYY) <Text className="text-rose-500">*</Text></Text>
              <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
                <Calendar size={18} color={COLORS.slate[400]} />
                <TextInput className="flex-1 text-[15px] text-slate-900 py-2 font-bold" value={formData.dateOfBirth} onChangeText={handleDateChange} placeholder="Nhập ngày sinh (VD: 20/05/1995)" placeholderTextColor={COLORS.slate[400]} keyboardType="number-pad" />
                {formData.dateOfBirth.length === 10 && <Check size={16} color={COLORS.primary[500]} />}
              </View>
            </View>

            {/* Địa chỉ */}
            <View className="mb-6">
              <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Địa chỉ <Text className="text-rose-500">*</Text></Text>
              <TouchableOpacity className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3" onPress={() => setShowLocationPicker(true)}>
                <MapPin size={18} color={COLORS.slate[400]} />
                <Text className={["flex-1 text-[15px] font-medium", formatLocation(formData) ? "text-slate-900" : "text-slate-400"].join(" ")}>{formatLocation(formData) || "Chọn địa chỉ"}</Text>
                <ChevronRight size={18} color={COLORS.slate[300]} />
              </TouchableOpacity>
            </View>

            {/* Bán kính */}
            <View className="mb-6">
              <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Bán kính di chuyển (km)</Text>
              <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
                <MapPin size={18} color={COLORS.slate[400]} />
                <TextInput className="flex-1 text-[15px] text-slate-900 py-2 font-bold" value={formData.travelRadiusKmPreference} onChangeText={t => updateField("travelRadiusKmPreference", t.replace(/[^0-9]/g, ""))} placeholder="Ví dụ: 10" placeholderTextColor={COLORS.slate[400]} keyboardType="number-pad" />
              </View>
            </View>

            {/* Lịch làm việc */}
            <View className="mb-6">
              <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Lịch làm việc <Text className="text-rose-500">*</Text></Text>
              <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
                <Clock size={18} color={COLORS.slate[400]} />
                <TextInput className="flex-1 text-[15px] text-slate-900 py-2 font-bold" value={scheduleSummary} placeholder="Chọn lịch làm việc..." placeholderTextColor={COLORS.slate[400]} editable={false} />
                {scheduleSummary.length > 0 && <Check size={16} color={COLORS.primary[500]} />}
              </View>
              <DayPicker
                schedule={formData.availabilitySchedule}
                summary={scheduleSummary}
                onToggle={toggleDay}
                onSelectAll={selectAllDays}
                onClear={clearDays}
              />
            </View>

            {/* Kinh nghiệm */}
            <View className="mb-2">
              <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Kinh nghiệm <Text className="text-rose-500">*</Text></Text>
              <ExperienceSelector selected={formData.experienceLevelId} onSelect={handleSelectExperience} />
            </View>
          </View>
        </ScrollView>

        <View className="px-6 py-6 bg-white border-t border-slate-100">
          <Button onPress={handleContinue} loading={loading} className="h-14 rounded-2xl">Bắt đầu ngay</Button>
        </View>
      </View>

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        initialValues={formData}
        onSelect={(loc) => setFormData(prev => ({ ...prev, ...loc }))}
      />

      <WelcomeModal
        visible={showWelcome}
        userName={user?.name}
        onClose={() => setShowWelcome(false)}
        onAction={() => setShowWelcome(false)}
      />
    </SafeAreaView>
  );
}

export default OnboardingProfileScreen;
