/* AI CONTEXT:
 * Action: Allows users to modify their profile information and skills.
 * Inputs: Form data (name, location, avatar, skills).
 * Outputs: API request to save user profile changes.
 * Dependencies: User service, Location service, Auth context, Media service. */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Platform, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { User, MapPin, Calendar, Clock, Camera, ChevronLeft, Check, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { LocationPicker } from "../components/profile/LocationPicker";
import { ExperienceSelector } from "../components/profile/ExperienceSelector";
import { DayPicker } from "../components/profile/DayPicker";
import { SkillSelector } from "../components/profile/SkillSelector";
import { mediaService, workerProfileService } from "../services/export_services";
import { useAuth } from "../context/AuthContext";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import { parseLocation, formatLocation } from "../utils/locationUtils";
import { formatSchedule, formatScheduleShort, DAYS_ORDER } from "../utils/scheduleUtils";

export function EditProfileScreen({ navigation, route }: any) {
  const { isAuthenticated, user } = useAuth();
  const { currentProfile } = route.params || {};
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    fullName: currentProfile?.fullName || "",
    dateOfBirth: "",
    provinceId: null as number | null,
    provinceName: "",
    districtId: null as number | null,
    districtName: "",
    ward: "",
    street: "",
    travelRadiusKmPreference: currentProfile?.travelRadiusKmPreference?.toString() || "",
    experienceLevelId: currentProfile?.experienceLevelId || 1,
    availabilitySchedule: currentProfile?.availabilitySchedule || "",
    avatarUrl: currentProfile?.avatarUrl || "",
    skillIds: (currentProfile?.skills || []).map((s: any) => s.id) as string[],
  });

  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, title: "", message: "", variant: "info" as "success" | "error" | "info" });

  useEffect(() => {
    if (!currentProfile) return;
    const updates: any = {};
    if (currentProfile.availabilitySchedule) updates.availabilitySchedule = currentProfile.availabilitySchedule;
    if (currentProfile.experienceLevelId) updates.experienceLevelId = currentProfile.experienceLevelId;
    if (currentProfile.skills) updates.skillIds = currentProfile.skills.map((s: any) => s.id);
    const dobVal = currentProfile.dateOfBirth;
    if (dobVal && dobVal.includes("-")) {
      const [y, m, d] = dobVal.split("T")[0].split("-");
      updates.dateOfBirth = `${d}/${m}/${y}`;
    }
    if (currentProfile.primaryLocation) Object.assign(updates, parseLocation(currentProfile.primaryLocation));
    setFormData(prev => ({ ...prev, ...updates }));
  }, [currentProfile]);

  const updateField = useCallback((field: string, value: any) => setFormData(p => ({ ...p, [field]: value })), []);

  const handleSave = async () => {
    const primaryLocation = formatLocation(formData);
    const { fullName, dateOfBirth, availabilitySchedule, experienceLevelId, travelRadiusKmPreference, avatarUrl, skillIds } = formData;
    if (!fullName || !dateOfBirth || dateOfBirth.length < 10 || !primaryLocation) {
      setFeedback({ visible: true, title: "Thiếu thông tin", message: "Vui lòng nhập đầy đủ các trường bắt buộc.", variant: "error" });
      return;
    }
    const [dd, mm, yyyy] = dateOfBirth.split("/");
    setLoading(true);
    try {
      await workerProfileService.updateProfile({
        fullName, dateOfBirth: `${yyyy}-${mm}-${dd}`, primaryLocation,
        travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : undefined,
        experienceLevelId, availabilitySchedule, avatarUrl, skillIds
      });
      DeviceEventEmitter.emit("REFRESH_DATA");
      setFeedback({ visible: true, title: "Thành công", message: "Hồ sơ đã được cập nhật.", variant: "success" });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err: any) {
      setFeedback({ visible: true, title: "Lỗi", message: err.message || "Không thể cập nhật hồ sơ.", variant: "error" });
    } finally { setLoading(false); }
  };

  const handlePickAvatar = async () => {
    setAvatarUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      const uploaded = await mediaService.uploadImage({ uri: result.assets[0].uri, name: "avatar.jpg", type: "image/jpeg" });
      updateField("avatarUrl", uploaded);
    } catch { setFeedback({ visible: true, title: "Lỗi", message: "Không thể tải ảnh lên.", variant: "error" }); }
    finally { setAvatarUploading(false); }
  };

  const toggleDay = useCallback((dayId: string) => {
    setFormData(p => {
      const curr = p.availabilitySchedule ? p.availabilitySchedule.split(", ") : [];
      const next = curr.includes(dayId) ? curr.filter((d: string) => d !== dayId) : [...curr, dayId].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
      return { ...p, availabilitySchedule: next.join(", ") };
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"><ChevronLeft size={24} color={COLORS.slate[900]} /></TouchableOpacity>
        <Text style={TYPOGRAPHY.title} className="ml-3 text-slate-900">Chỉnh sửa hồ sơ</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="items-center py-8 bg-white border-b border-slate-100 mb-4">
          <View className="relative">
            <Avatar source={formData.avatarUrl ? { uri: formData.avatarUrl } : undefined} size={100} />
            <TouchableOpacity onPress={handlePickAvatar} className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 rounded-full justify-center items-center border-4 border-white"><Camera size={18} color="white" /></TouchableOpacity>
          </View>
        </View>
        <View className="px-5">
          <View className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Họ và tên <Text className="text-rose-500">*</Text></Text>
            <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3 mb-6">
              <User size={18} color={COLORS.slate[400]} /><TextInput className="flex-1 text-[15px] font-bold" value={formData.fullName} onChangeText={t => updateField("fullName", t)} placeholder="Nhập họ và tên" />
            </View>
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Ngày sinh <Text className="text-rose-500">*</Text></Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3 mb-6">
              <Calendar size={18} color={COLORS.slate[400]} /><Text className={["flex-1 text-[15px] font-bold", formData.dateOfBirth ? "text-slate-900" : "text-slate-400"].join(" ")}>{formData.dateOfBirth || "Chọn ngày sinh"}</Text><ChevronRight size={18} color={COLORS.slate[300]} />
            </TouchableOpacity>
            {showDatePicker && <DateTimePicker value={new Date()} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(_: any, d?: Date) => { setShowDatePicker(false); if (d) updateField("dateOfBirth", `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`); }} maximumDate={new Date()} />}
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Kỹ năng của bạn</Text>
            <SkillSelector selectedSkillIds={formData.skillIds} onSelect={ids => updateField("skillIds", ids)} />
            <View className="h-4" />
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Địa chỉ <Text className="text-rose-500">*</Text></Text>
            <TouchableOpacity onPress={() => setShowLocationPicker(true)} className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3 mb-6">
              <MapPin size={18} color={COLORS.slate[400]} /><Text className="flex-1 text-[15px] font-medium" numberOfLines={1}>{formatLocation(formData) || "Chọn địa chỉ"}</Text><ChevronRight size={18} color={COLORS.slate[300]} />
            </TouchableOpacity>
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Lịch làm việc</Text>
            <DayPicker schedule={formData.availabilitySchedule} summary={formatSchedule(formData.availabilitySchedule)} onToggle={toggleDay} onSelectAll={() => updateField("availabilitySchedule", "T2, T3, T4, T5, T6, T7, CN")} onClear={() => updateField("availabilitySchedule", "")} />
            <View className="h-6" />
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Kinh nghiệm</Text>
            <ExperienceSelector selected={formData.experienceLevelId} onSelect={id => updateField("experienceLevelId", id)} />
          </View>
        </View>
      </ScrollView>
      <View className="flex-row justify-center gap-3 px-4 py-4 bg-white border-t border-slate-100">
        <Button variant="outline" className="flex-1" onPress={() => navigation.goBack()}>Hủy</Button>
        <Button className="flex-1" onPress={handleSave} loading={loading}>Lưu hồ sơ</Button>
      </View>
      <FeedbackModal visible={feedback.visible} title={feedback.title} message={feedback.message} variant={feedback.variant} onClose={() => setFeedback({ ...feedback, visible: false })} />
      <LocationPicker visible={showLocationPicker} onClose={() => setShowLocationPicker(false)} initialValues={formData} onSelect={loc => setFormData(p => ({ ...p, ...loc }))} />
    </SafeAreaView>
  );
}

export default EditProfileScreen;
