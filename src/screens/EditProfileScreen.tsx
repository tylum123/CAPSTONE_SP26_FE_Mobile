/* AI CONTEXT:
 * Action: Allows users to modify their profile information and skills.
 * Inputs: Form data (name, location, avatar, skills).
 * Outputs: API request to save user profile changes.
 * Dependencies: User service, Location service, Auth context, Media service. */

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Platform, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { User, MapPin, Calendar, Camera, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { hapticFeedback } from "../utils/haptic";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { LocationPicker } from "../components/profile/LocationPicker";
import { ExperienceSelector } from "../components/profile/ExperienceSelector";
import { DayPicker } from "../components/profile/DayPicker";
import { SkillSelectionModal } from "../components/profile/SkillSelectionModal";
import { mediaService, workerProfileService, skillService } from "../services/export_services";
import { useAuth } from "../context/AuthContext";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import { parseLocation, formatLocation } from "../utils/locationUtils";
import { formatSchedule, DAYS_ORDER } from "../utils/scheduleUtils";
import { getErrorMessage } from "../utils/error_handling";
import { UpdateWorkerProfileRequest } from "../types/export_type_definitions";

export function EditProfileScreen({ navigation, route }: any) {
  useAuth();
  const { currentProfile } = route.params || {};
  const insets = useSafeAreaInsets();

  const getInitialDOB = useCallback(() => {
    const dob = currentProfile?.date_of_birth || currentProfile?.dateOfBirth;
    if (!dob) return "";
    
    // If already in DD/MM/YYYY format, return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return dob;
    
    try {
      const datePart = dob.split("T")[0];
      // Handle YYYY-MM-DD or YYYY/MM/DD
      const separator = datePart.includes("-") ? "-" : "/";
      const parts = datePart.split(separator);
      
      if (parts.length === 3) {
        const [p1, p2, p3] = parts;
        // Check if YYYY-MM-DD
        if (p1.length === 4) return `${p3}/${p2}/${p1}`;
        // Check if DD-MM-YYYY
        if (p3.length === 4) return `${p1}/${p2}/${p3}`;
      }
    } catch (e) { console.warn("Error parsing DOB:", dob, e); }
    return "";
  }, [currentProfile]);

  const [formData, setFormData] = useState({
    fullName: currentProfile?.fullName || "",
    dateOfBirth: getInitialDOB(),
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
    genderId: currentProfile?.genderId || 1,
  });

  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ 
    visible: boolean; 
    title: string; 
    message: string; 
    variant: "success" | "error" | "info"; 
    onConfirm?: () => void;
    onClose?: () => void;
  }>({ visible: false, title: "", message: "", variant: "info" as "success" | "error" | "info" });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await skillService.getSkills();
        setAvailableSkills(skills);
      } catch (err) { console.error("Error fetching skills:", err); }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    if (!currentProfile) return;
    const updates: any = {};
    if (currentProfile.availabilitySchedule) updates.availabilitySchedule = currentProfile.availabilitySchedule;
    if (currentProfile.experienceLevelId) updates.experienceLevelId = currentProfile.experienceLevelId;
    if (currentProfile.skills) updates.skillIds = currentProfile.skills.map((s: any) => s.id);
    if (currentProfile.genderId) updates.genderId = currentProfile.genderId;
    
    const dob = getInitialDOB();
    if (dob) updates.dateOfBirth = dob;

    if (currentProfile.primaryLocation) Object.assign(updates, parseLocation(currentProfile.primaryLocation));
    setFormData(prev => ({ ...prev, ...updates }));
  }, [currentProfile, getInitialDOB]);

  const updateField = useCallback((field: string, value: any) => setFormData(p => ({ ...p, [field]: value })), []);

  const handleSave = async () => {
    const primaryLocation = formatLocation(formData);
    const { fullName, dateOfBirth, availabilitySchedule, experienceLevelId, travelRadiusKmPreference, avatarUrl, skillIds } = formData;
    if (!fullName || !dateOfBirth || dateOfBirth.length < 10 || !primaryLocation) {
      hapticFeedback.error();
      setFeedback({ visible: true, title: "Thiếu thông tin", message: "Vui lòng nhập đầy đủ các trường bắt buộc.", variant: "error" });
      return;
    }
    setLoading(true);
    hapticFeedback.medium();
    try {
      const payload: UpdateWorkerProfileRequest = {
        fullName,
        dateOfBirth, // Use DD/MM/YYYY as shown in successful test
        primaryLocation,
        travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : 0,
        experienceLevelId,
        availabilitySchedule,
        avatarUrl,
        skillIds,
        genderId: formData.genderId
      };

      await workerProfileService.updateProfile(payload);
      DeviceEventEmitter.emit("REFRESH_DATA");
      hapticFeedback.success();
      setFeedback({ 
        visible: true, 
        title: "Thành công", 
        message: "Hồ sơ đã được cập nhật.", 
        variant: "success" 
      });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      setFeedback({ visible: true, title: "Lỗi cập nhật", message: errorMessage, variant: "error" });
    } finally { setLoading(false); }
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      const uploaded = await mediaService.uploadImage({ uri: result.assets[0].uri, name: "avatar.jpg", type: "image/jpeg" });
      updateField("avatarUrl", uploaded);
    } catch { setFeedback({ visible: true, title: "Lỗi", message: "Không thể tải ảnh lên.", variant: "error" }); }
  };

  const toggleDay = useCallback((dayId: string) => {
    hapticFeedback.light();
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
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 110 }}
        className="flex-1"
      >
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
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Bán kính di chuyển (km)</Text>
            <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3 mb-6">
              <MapPin size={18} color={COLORS.slate[400]} />
              <TextInput 
                className="flex-1 text-[15px] font-bold" 
                value={formData.travelRadiusKmPreference} 
                onChangeText={t => updateField("travelRadiusKmPreference", t.replace(/[^0-9]/g, ""))} 
                placeholder="Ví dụ: 10" 
                keyboardType="number-pad" 
              />
            </View>
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Giới tính</Text>
            <View className="flex-row gap-3 mb-6">
              {[
                { id: 1, label: "Nam" },
                { id: 2, label: "Nữ" }
              ].map(g => (
                <TouchableOpacity 
                  key={g.id}
                  onPress={() => { hapticFeedback.light(); updateField("genderId", g.id); }}
                  className={[
                    "flex-1 items-center justify-center py-3.5 rounded-2xl border",
                    formData.genderId === g.id ? "bg-primary-50 border-primary-500" : "bg-slate-50 border-slate-100"
                  ].join(" ")}
                >
                  <Text className={["text-[15px] font-bold", formData.genderId === g.id ? "text-primary-700" : "text-slate-500"].join(" ")}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Kỹ năng của bạn</Text>
            <TouchableOpacity onPress={() => { hapticFeedback.light(); setShowSkillModal(true); }} 
              className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] mb-6"
            >
              <View className="flex-row flex-1 flex-wrap py-2 gap-1.5 items-center">
                {formData.skillIds.length === 0 ? (
                  <Text className="text-[15px] font-bold text-slate-400">Chọn kỹ năng của bạn</Text>
                ) : (
                  <>
                    {formData.skillIds.slice(0, 3).map(id => {
                      const skill = availableSkills.find(s => s.id === id);
                      return (
                        <View key={id} className="bg-primary-100 px-2 py-1 rounded-lg">
                          <Text className="text-[12px] font-bold text-primary-700">{skill?.name || "..."}</Text>
                        </View>
                      );
                    })}
                    {formData.skillIds.length > 3 && (
                      <View className="bg-slate-200 px-2 py-1 rounded-lg">
                        <Text className="text-[12px] font-bold text-slate-600">+{formData.skillIds.length - 3} nữa</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
              <ChevronRight size={18} color={COLORS.slate[300]} />
            </TouchableOpacity>
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
      <View className="absolute bottom-0 left-0 right-0">
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.9)", "rgba(255,255,255,1)"]}
          className="h-8"
        />
        <View 
          className="flex-row items-center gap-3 px-6 py-4 bg-white border-t border-slate-100 shadow-2xl"
          style={{ 
            paddingBottom: Math.max(insets.bottom, 16),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 20
          }}
        >
          <Button variant="outline" className="flex-1 h-[52px]" style={{ flex: 1 }} onPress={() => { hapticFeedback.light(); navigation.goBack(); }}>Hủy</Button>
          <Button className="flex-1 h-[52px]" style={{ flex: 1 }} onPress={handleSave} loading={loading}>Lưu hồ sơ</Button>
        </View>
      </View>
      <FeedbackModal 
        visible={feedback.visible} 
        title={feedback.title} 
        message={feedback.message} 
        variant={feedback.variant} 
        onClose={() => {
          setFeedback({ ...feedback, visible: false });
          if (feedback.variant === "success") {
            DeviceEventEmitter.emit("REFRESH_DATA");
            navigation.goBack();
          }
        }} 
        onConfirm={() => {
          setFeedback({ ...feedback, visible: false });
          if (feedback.variant === "success") {
            DeviceEventEmitter.emit("REFRESH_DATA");
            navigation.goBack();
          }
        }} 
      />
      <LocationPicker visible={showLocationPicker} onClose={() => setShowLocationPicker(false)} initialValues={formData} onSelect={loc => setFormData(p => ({ ...p, ...loc }))} />
      <SkillSelectionModal visible={showSkillModal} onClose={() => setShowSkillModal(false)} selectedSkillIds={formData.skillIds} onSave={ids => updateField("skillIds", ids)} />
    </SafeAreaView>
  );
}

export default EditProfileScreen;
