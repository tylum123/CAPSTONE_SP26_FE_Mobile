/* AI CONTEXT:
 * Action: Allows users to modify their profile information and skills.
 * Inputs: Form data (name, location, avatar, skills).
 * Outputs: API request to save user profile changes.
 * Dependencies: User service, Location service, Auth context, Media service. */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Platform, DeviceEventEmitter, PanResponder, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { User, MapPin, Calendar, Clock, Camera, ChevronLeft, Check, ChevronRight, CheckCircle2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { LocationPicker } from "../components/profile/LocationPicker";
import { mediaService, workerProfileService } from "../services/export_services";
import { useAuth } from "../context/AuthContext";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import { parseLocation, formatLocation } from "../utils/locationUtils";

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

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// Short format for the TextInput (no overflow)
function formatScheduleShort(schedule: string): string {
  if (!schedule || !schedule.trim()) return "";
  const selectedIds = schedule.split(", ").map(s => s.trim()).filter(id => !!LABELS_MAP[id]);
  if (selectedIds.length === 0) return "";
  if (selectedIds.length === 7) return "Cả tuần";
  const sorted = [...selectedIds].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
  if (sorted.length > 1) {
    const indices = sorted.map(id => DAYS_ORDER.indexOf(id));
    let consecutive = true;
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) { consecutive = false; break; }
    }
    if (consecutive) return `${sorted[0]} – ${sorted[sorted.length - 1]}`;
  }
  return sorted.join(", ");
}

// ── ExperienceSelector (top-level, stable component type) ────────────────────
interface ExperienceSelectorProps {
  selected: number;
  onSelect: (id: number) => void;
}
function ExperienceSelector({ selected, onSelect }: ExperienceSelectorProps) {
  const TRACK_WIDTH = 280; // slightly wider
  const THUMB_SIZE = 28;
  const SNAP_MAX = TRACK_WIDTH - THUMB_SIZE;
  const snapPositions = [0, TRACK_WIDTH / 2 - THUMB_SIZE / 2, SNAP_MAX];
  const labelCenters = [0, TRACK_WIDTH / 2, TRACK_WIDTH];

  const thumbX = useRef(new Animated.Value(snapPositions[selected - 1] ?? 0)).current;
  const currentX = useRef(snapPositions[selected - 1] ?? 0);
  const [fillWidth, setFillWidth] = React.useState(labelCenters[selected - 1] ?? labelCenters[0]);

  const getIdForX = (x: number) => {
    let best = 0;
    let bestDist = Infinity;
    snapPositions.forEach((p, i) => { const d = Math.abs(p - x); if (d < bestDist) { bestDist = d; best = i; } });
    return best + 1;
  };

  useEffect(() => {
    const target = snapPositions[selected - 1] ?? 0;
    Animated.spring(thumbX, { toValue: target, useNativeDriver: true, tension: 120, friction: 8 }).start();
    currentX.current = target;
    setFillWidth(labelCenters[selected - 1] ?? labelCenters[0]);
  }, [selected]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        thumbX.stopAnimation(val => { currentX.current = val; });
        thumbX.setOffset(currentX.current);
        thumbX.setValue(0);
      },
      onPanResponderMove: (_, gs) => {
        const raw = Math.max(0, Math.min(SNAP_MAX, currentX.current + gs.dx));
        thumbX.setValue(raw - currentX.current);
        setFillWidth(raw + THUMB_SIZE / 2); // fill follows thumb center
      },
      onPanResponderRelease: (_, gs) => {
        thumbX.flattenOffset();
        thumbX.stopAnimation();
        const rawX = Math.max(0, Math.min(SNAP_MAX, currentX.current + gs.dx));
        const snappedId = getIdForX(rawX);
        const snappedX = snapPositions[snappedId - 1];
        currentX.current = snappedX;
        Animated.spring(thumbX, { toValue: snappedX, useNativeDriver: true, tension: 150, friction: 10 }).start();
        setFillWidth(labelCenters[snappedId - 1]);
        onSelect(snappedId);
      },
    })
  ).current;

  return (
    <View style={{ paddingVertical: 12, paddingHorizontal: 4 }}>
      {/* Labels */}
      <View style={{ width: TRACK_WIDTH, alignSelf: "center", flexDirection: "row", marginBottom: 18 }}>
        {EXPERIENCE_LEVELS.map((level, i) => (
          <TouchableOpacity
            key={level.id}
            onPress={() => onSelect(level.id)}
            style={{
              flex: 1,
              alignItems: i === 0 ? "flex-start" : i === 2 ? "flex-end" : "center",
            }}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: selected === level.id ? "800" : "600",
              color: selected === level.id ? "#059669" : "#94A3B8",
              textAlign: i === 0 ? "left" : i === 2 ? "right" : "center",
            }}>
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Track container */}
      <View style={{ width: TRACK_WIDTH, alignSelf: "center", height: THUMB_SIZE, justifyContent: "center" }}>
        {/* Background track */}
        <View style={{ height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, width: "100%", position: "absolute" }} />
        {/* Active fill */}
        <View style={{ height: 6, backgroundColor: "#059669", borderRadius: 3, width: fillWidth, position: "absolute", left: 0 }} />
        
        {/* Snap-point dots */}
        {snapPositions.map((_, i) => (
          <View key={i} style={{
            position: "absolute",
            left: labelCenters[i] - 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "#FFFFFF",
            borderWidth: 2,
            borderColor: selected - 1 >= i ? "#059669" : "#CBD5E1",
          }} />
        ))}

        {/* Draggable thumb */}
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2,
            position: "absolute", left: 0,
            backgroundColor: "#059669",
            borderWidth: 3, borderColor: "#ffffff",
            elevation: 8,
            shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
            transform: [{ translateX: thumbX }],
          }}
        />
      </View>
    </View>
  );
}

// ── DayPicker (top-level) ─────────────────────────────────────────────────────
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
      <View className="flex-row justify-between mb-4 mt-2">
        {DAYS.map(day => {
          const isSelected = selected.includes(day.id);
          return (
            <TouchableOpacity
              key={day.id}
              onPress={() => onToggle(day.id)}
              className={["w-9 h-9 rounded-full items-center justify-center border", isSelected ? "bg-primary-600 border-primary-600" : "bg-white border-slate-200"].join(" ")}
            >
              <Text className={["text-[11px] font-extrabold", isSelected ? "text-white" : "text-slate-500"].join(" ")}>{day.label}</Text>
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
export function EditProfileScreen({ navigation, route }: any) {
  const { isAuthenticated, user } = useAuth();
  const { currentProfile, onUpdated } = route.params || {};
  const insets = useSafeAreaInsets();

  const initialDate = (() => {
    const d_obj = currentProfile as any;
    const val = d_obj?.date_of_birth || d_obj?.dateOfBirth || d_obj?.ageRange;
    if (!val) return "";
    if (val.includes("-")) {
      const raw = val.split("T")[0];
      const parts = raw.split("-");
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (val.includes("/")) return val;
    return "";
  })();

  const [formData, setFormData] = useState({
    fullName: currentProfile?.fullName || "",
    dateOfBirth: initialDate,
    provinceId: null as number | null,
    districtId: null as number | null,
    provinceName: "",
    districtName: "",
    ward: "",
    street: "",
    travelRadiusKmPreference: currentProfile?.travelRadiusKmPreference?.toString() || "",
    experienceLevelId: currentProfile?.experienceLevelId || 1,
    availabilitySchedule: currentProfile?.availabilitySchedule || "",
    avatarUrl: currentProfile?.avatarUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const selectedDate = useMemo(() => {
    if (!formData.dateOfBirth) return new Date(2000, 0, 1);
    const parts = formData.dateOfBirth.split("/");
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    return new Date(2000, 0, 1);
  }, [formData.dateOfBirth]);

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type === "dismissed") return;
    if (date) {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      updateField("dateOfBirth", `${dd}/${mm}/${yyyy}`);
    }
  };

  // Sync ALL fields from currentProfile (handles async navigation param updates)
  useEffect(() => {
    if (!currentProfile) return;
    const updates: Partial<typeof formData> = {};
    if (currentProfile.availabilitySchedule) updates.availabilitySchedule = currentProfile.availabilitySchedule;
    if (currentProfile.experienceLevelId) updates.experienceLevelId = currentProfile.experienceLevelId;
    const d_obj = currentProfile as any;
    const dobVal = d_obj.date_of_birth || d_obj.dateOfBirth || d_obj.ageRange;
    if (dobVal) {
      if (dobVal.includes("-")) {
        const raw = dobVal.split("T")[0];
        const parts = raw.split("-");
        if (parts.length === 3) updates.dateOfBirth = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else if (dobVal.includes("/")) {
        updates.dateOfBirth = dobVal;
      }
    }
    if (currentProfile.primaryLocation) {
      const parsed = parseLocation(currentProfile.primaryLocation);
      Object.assign(updates, parsed);
    }
    if (Object.keys(updates).length > 0) setFormData(prev => ({ ...prev, ...updates }));
  }, [currentProfile]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const showFeedback = useCallback((params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm }), []);

  const closeFeedback = useCallback(() => {
    setFeedback(p => {
      const cb = p.onConfirm;
      setTimeout(() => cb?.(), 0);
      return { ...p, visible: false };
    });
  }, []);

  const handleDateChange = useCallback((text: string) => {
    let clean = text.replace(/[^0-9]/g, "");
    if (clean.length > 8) clean = clean.slice(0, 8);
    let formatted = clean;
    if (clean.length > 2) formatted = clean.slice(0, 2) + "/" + clean.slice(2);
    if (clean.length > 4) formatted = formatted.slice(0, 5) + "/" + clean.slice(4);
    updateField("dateOfBirth", formatted);
  }, [updateField]);

  const handleSave = async () => {
    const primaryLocation = formatLocation(formData);
    const { fullName, dateOfBirth, availabilitySchedule, experienceLevelId, travelRadiusKmPreference, avatarUrl } = formData;

    if (!fullName || !dateOfBirth || dateOfBirth.length < 10 || !primaryLocation || !availabilitySchedule) {
      showFeedback({ title: "Thiếu thông tin", message: "Vui lòng nhập đầy đủ các trường bắt buộc, ngày sinh định dạng DD/MM/YYYY.", variant: "error" });
      return;
    }

    const [dd, mm, yyyy] = dateOfBirth.split("/");
    const dateOnly = `${yyyy}-${mm}-${dd}`;

    setLoading(true);
    if (!isAuthenticated || user?.isDemo) {
      setTimeout(() => {
        const demo: any = {
          ...currentProfile, id: "demo", fullName, dateOfBirth: dateOnly, primaryLocation,
          travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : null,
          experienceLevelId, experienceLevel: ["Mới bắt đầu", "Có kinh nghiệm", "Chuyên nghiệp"][experienceLevelId - 1],
          availabilitySchedule, avatarUrl,
        };
        DeviceEventEmitter.emit("REFRESH_DATA");
        showFeedback({ title: "Thành công (Demo)", message: "Hồ sơ đã được cập nhật mô phỏng.", variant: "success", onConfirm: () => navigation.goBack() });
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const updated = await workerProfileService.updateProfile({
        fullName, dateOfBirth: dateOnly, primaryLocation,
        travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : undefined,
        experienceLevelId, availabilitySchedule, avatarUrl,
      });
      DeviceEventEmitter.emit("REFRESH_DATA");
      showFeedback({ title: "Thành công", message: "Hồ sơ đã được cập nhật.", variant: "success", onConfirm: () => navigation.goBack() });
    } catch (err: any) {
      showFeedback({ title: "Lỗi", message: err.message || "Không thể cập nhật hồ sơ.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    setAvatarUploading(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { showFeedback({ title: "Thiếu quyền", message: "Cần quyền truy cập thư viện ảnh.", variant: "error" }); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const uploaded = await mediaService.uploadImage({ uri: asset.uri, name: asset.fileName || "avatar.jpg", type: asset.mimeType || "image/jpeg" });
      updateField("avatarUrl", uploaded);
    } catch {
      showFeedback({ title: "Lỗi", message: "Không thể tải ảnh lên.", variant: "error" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const toggleDay = useCallback((dayId: string) => {
    setFormData(prev => {
      const current = (prev.availabilitySchedule || "").trim() ? prev.availabilitySchedule.split(", ") : [];
      const next = current.includes(dayId)
        ? current.filter((d: string) => d !== dayId)
        : [...current, dayId].sort((a: string, b: string) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
      return { ...prev, availabilitySchedule: next.join(", ") };
    });
  }, []);

  const selectAllDays = useCallback(() => updateField("availabilitySchedule", "T2, T3, T4, T5, T6, T7, CN"), [updateField]);
  const clearDays = useCallback(() => updateField("availabilitySchedule", ""), [updateField]);
  const handleSelectExperience = useCallback((id: number) => updateField("experienceLevelId", id), [updateField]);

  const scheduleSummary = useMemo(() => formatSchedule(formData.availabilitySchedule), [formData.availabilitySchedule]);
  const scheduleShort = useMemo(() => formatScheduleShort(formData.availabilitySchedule), [formData.availabilitySchedule]);

  const textFields = [
    { label: "Họ và tên", required: true, Icon: User, value: formData.fullName, onChangeText: (t: string) => updateField("fullName", t), placeholder: "Nhập họ và tên" },
    { label: "Bán kính di chuyển (km)", Icon: MapPin, value: formData.travelRadiusKmPreference, onChangeText: (t: string) => updateField("travelRadiusKmPreference", t.replace(/[^0-9]/g, "")), placeholder: "Ví dụ: 10", keyboardType: "number-pad" as const },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <View className="flex-1">
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
            <ChevronLeft size={24} color={COLORS.slate[900]} />
          </TouchableOpacity>
          <Text style={TYPOGRAPHY.title} className="ml-3 text-slate-900">Chỉnh sửa hồ sơ</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Avatar */}
          <View className="items-center py-10 bg-white border-b border-slate-100 mb-4">
            <View className="relative">
              <Avatar source={formData.avatarUrl ? { uri: formData.avatarUrl } : undefined} fallback={formData.fullName[0] || "M"} size={100} />
              <TouchableOpacity
                className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 rounded-full justify-center items-center border-4 border-white"
                onPress={handlePickAvatar} disabled={avatarUploading}
              >
                <Camera size={18} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="mt-4 text-[13px] text-slate-500 font-medium uppercase tracking-wider">
              {avatarUploading ? "Đang tải..." : "Cập nhật ảnh đại diện"}
            </Text>
          </View>

          <View className="px-5">
            <View className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">

              {/* Text fields */}
              {textFields.map((field, i) => (
                <View key={i} className="mb-6">
                  <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">
                    {field.label} {field.required && <Text className="text-rose-500">*</Text>}
                  </Text>
                  <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
                    <field.Icon size={18} color={COLORS.slate[400]} />
                    <TextInput
                      className="flex-1 text-[15px] text-slate-900 py-2 font-bold"
                      value={field.value} onChangeText={field.onChangeText}
                      placeholder={field.placeholder} placeholderTextColor={COLORS.slate[400]}
                      keyboardType={field.keyboardType}
                    />
                    {field.value?.length > 0 && <Check size={16} color={COLORS.primary[500]} />}
                  </View>
                </View>
              ))}

              {/* Date of Birth */}
              <View className="mb-6">
                <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Ngày sinh <Text className="text-rose-500">*</Text></Text>
                <TouchableOpacity
                  className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={18} color={COLORS.slate[400]} />
                  <Text className={["flex-1 text-[15px] font-bold", formData.dateOfBirth ? "text-slate-900" : "text-slate-400"].join(" ")}>
                    {formData.dateOfBirth || "Chọn ngày sinh"}
                  </Text>
                  <ChevronRight size={18} color={COLORS.slate[300]} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}

              {/* Location */}
              <View className="mb-6">
                <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Địa chỉ <Text className="text-rose-500">*</Text></Text>
                <TouchableOpacity
                  className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3"
                  onPress={() => setShowLocationPicker(true)}
                >
                  <MapPin size={18} color={COLORS.slate[400]} />
                  <Text className={["flex-1 text-[15px] font-medium", formatLocation(formData) ? "text-slate-900" : "text-slate-400"].join(" ")}>
                    {formatLocation(formData) || "Chọn địa chỉ"}
                  </Text>
                  <ChevronRight size={18} color={COLORS.slate[300]} />
                </TouchableOpacity>
              </View>

              {/* Schedule */}
              <View className="mb-6">
                <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Lịch làm việc <Text className="text-rose-500">*</Text></Text>
                <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3 mb-3">
                  <Clock size={18} color={COLORS.slate[400]} />
                  <TextInput
                    className="flex-1 text-[15px] text-slate-900 py-2 font-bold"
                    value={scheduleShort} placeholder="Chọn lịch làm việc..." placeholderTextColor={COLORS.slate[400]}
                    editable={false}
                  />
                  {scheduleShort.length > 0 && <Check size={16} color={COLORS.primary[500]} />}
                </View>
                <DayPicker
                  schedule={formData.availabilitySchedule}
                  summary={scheduleSummary}
                  onToggle={toggleDay}
                  onSelectAll={selectAllDays}
                  onClear={clearDays}
                />
              </View>

              {/* Experience */}
              <View className="mb-2">
                <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Kinh nghiệm <Text className="text-rose-500">*</Text></Text>
                <ExperienceSelector selected={formData.experienceLevelId} onSelect={handleSelectExperience} />
              </View>

            </View>
          </View>
        </ScrollView>

        <View className="flex-row justify-center gap-3 px-2 pt-4 pb-2 bg-white border-t border-slate-100">
          <Button variant="outline" style={{ width: 150 }} onPress={() => navigation.goBack()}>Hủy</Button>
          <Button style={{ width: 150 }} onPress={handleSave} loading={loading || avatarUploading}>Lưu thay đổi</Button>
        </View>
      </View>

      <FeedbackModal
        visible={feedback.visible} title={feedback.title} message={feedback.message} variant={feedback.variant}
        onClose={closeFeedback}
      />

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        initialValues={formData}
        onSelect={(loc) => setFormData(prev => ({ ...prev, ...loc }))}
      />
    </SafeAreaView>
  );
}

export default EditProfileScreen;
