/* AI CONTEXT:
 * Action: Guides new users through initial profile completion after registration.
 * Inputs: Basic personal details, role preferences.
 * Outputs: Completed profile state payload.
 * Dependencies: Auth context, User service. */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { User, MapPin, Calendar, Clock, Camera, ChevronRight, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { hapticFeedback } from "../utils/haptic";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { WelcomeModal } from "../components/ui/WelcomeModal";
import { LocationPicker } from "../components/profile/LocationPicker";
import { ExperienceSelector } from "../components/profile/ExperienceSelector";
import { DayPicker } from "../components/profile/DayPicker";
import { SkillSelectionModal } from "../components/profile/SkillSelectionModal";
import { mediaService, workerProfileService, skillService } from "../services/export_services";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import { formatLocation } from "../utils/locationUtils";
import { formatSchedule } from "../utils/scheduleUtils";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/error_handling";

// ── Main screen ───────────────────────────────────────────────────────────────
export function OnboardingProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!!user?.isNewUser);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [feedback, setFeedback] = useState({ visible: false, title: "", message: "", variant: "info" as "success" | "error" | "info" });

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    dateOfBirth: "", // DD/MM/YYYY
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
    genderId: 1,
    skillIds: [] as string[],
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await skillService.getSkills();
        setAvailableSkills(skills);
      } catch (err) { console.error("Error fetching skills:", err); }
    };
    fetchSkills();
  }, []);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePickAvatar = async () => {
    setAvatarUploading(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { 
        setFeedback({ visible: true, title: "Thiếu quyền", message: "Cần quyền truy cập thư viện ảnh.", variant: "error" });
        return; 
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const uploaded = await mediaService.uploadImage({ uri: asset.uri, name: asset.fileName || "avatar.jpg", type: asset.mimeType || "image/jpeg" });
      updateField("avatarUrl", uploaded);
      hapticFeedback.success();
    } catch { 
      setFeedback({ visible: true, title: "Lỗi", message: "Không thể tải ảnh lên.", variant: "error" });
    }
    finally { setAvatarUploading(false); }
  };

  const getParsedDate = useCallback(() => {
    if (formData.dateOfBirth && formData.dateOfBirth.includes("/")) {
      const [d, m, y] = formData.dateOfBirth.split("/").map(Number);
      if (d && m && y) return new Date(y, m - 1, d);
    }
    return new Date(2000, 0, 1);
  }, [formData.dateOfBirth]);

  const handleContinue = async () => {
    const primaryLocation = formatLocation(formData);
    const { fullName, dateOfBirth, availabilitySchedule, experienceLevelId, travelRadiusKmPreference, avatarUrl, skillIds } = formData;
    
    if (!fullName || !dateOfBirth || dateOfBirth.length < 10 || !primaryLocation || !availabilitySchedule) {
      hapticFeedback.error();
      setFeedback({ visible: true, title: "Thiếu thông tin", message: "Vui lòng nhập đầy đủ các trường bắt buộc.", variant: "error" });
      return;
    }

    setLoading(true);
    hapticFeedback.medium();
    
    try {
      await workerProfileService.updateProfile({ 
        fullName, 
        dateOfBirth, // Use DD/MM/YYYY as shown in successful test (matches EditProfileScreen)
        primaryLocation, 
        travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : 0, 
        experienceLevelId, 
        availabilitySchedule, 
        avatarUrl: avatarUrl || "",
        genderId: formData.genderId,
        skillIds
      });
      hapticFeedback.success();
      navigation.replace("Worker");
    } catch (err: any) { 
      const errorMessage = getErrorMessage(err, "Không thể tạo hồ sơ. Vui lòng thử lại.");
      setFeedback({ visible: true, title: "Lỗi khởi tạo", message: errorMessage, variant: "error" });
    }
    finally { setLoading(false); }
  };

  const toggleDay = useCallback((dayId: string) => {
    hapticFeedback.light();
    setFormData(prev => {
      const current = (prev.availabilitySchedule || "").trim() ? prev.availabilitySchedule.split(", ") : [];
      const next = current.includes(dayId)
        ? current.filter(d => d !== dayId)
        : [...current, dayId]; // Sorting handled in DayPicker utils if needed or just alphabetical check
      return { ...prev, availabilitySchedule: next.join(", ") };
    });
  }, []);

  const scheduleSummary = useMemo(() => formatSchedule(formData.availabilitySchedule), [formData.availabilitySchedule]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <View className="px-6 py-6 bg-white border-b border-slate-100">
        <Text style={TYPOGRAPHY.title} className="text-slate-900 text-2xl">Thiết lập hồ sơ 🚀</Text>
        <Text className="text-slate-500 mt-1 font-medium">Hoàn thiện thông tin để bắt đầu nhận việc</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        className="flex-1"
      >
        {/* Avatar Section */}
        <View className="items-center mb-8 py-4">
          <View className="relative">
            <Avatar 
              source={formData.avatarUrl ? { uri: formData.avatarUrl } : undefined} 
              fallback={formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "M"}
              size={110} 
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full justify-center items-center border-4 border-white shadow-sm"
              onPress={handlePickAvatar} 
              disabled={avatarUploading}
            >
              <Camera size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="mt-4 text-[13px] text-slate-500 font-bold uppercase tracking-widest">
            {avatarUploading ? "Đang tải ảnh..." : "Ảnh đại diện (Tùy chọn)"}
          </Text>
        </View>

        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
          {/* Tên */}
          <View className="mb-6">
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Họ và tên <Text className="text-rose-500">*</Text></Text>
            <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
              <User size={18} color={COLORS.slate[400]} />
              <TextInput 
                className="flex-1 text-[15px] text-slate-900 py-2 font-bold" 
                value={formData.fullName} 
                onChangeText={t => updateField("fullName", t)} 
                placeholder="Nhập họ và tên" 
                placeholderTextColor={COLORS.slate[400]} 
              />
              {formData.fullName.length > 2 && <Check size={16} color={COLORS.primary[500]} />}
            </View>
          </View>

          {/* Ngày sinh */}
          <View className="mb-6">
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Ngày sinh <Text className="text-rose-500">*</Text></Text>
            <TouchableOpacity 
              onPress={() => { hapticFeedback.light(); setShowDatePicker(true); }} 
              className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3"
            >
              <Calendar size={18} color={COLORS.slate[400]} />
              <Text className={["flex-1 text-[15px] font-bold", formData.dateOfBirth ? "text-slate-900" : "text-slate-400"].join(" ")}>
                {formData.dateOfBirth || "Chọn ngày sinh"}
              </Text>
              <ChevronRight size={18} color={COLORS.slate[300]} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker 
                value={getParsedDate()} 
                mode="date" 
                display={Platform.OS === "ios" ? "spinner" : "default"} 
                onChange={(_: any, d?: Date) => { 
                  setShowDatePicker(false); 
                  if (d) updateField("dateOfBirth", `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`); 
                }} 
                maximumDate={new Date()} 
              />
            )}
          </View>

          {/* Giới tính */}
          <View className="mb-6">
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Giới tính</Text>
            <View className="flex-row gap-3">
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
          </View>

          {/* Kỹ năng */}
          <View className="mb-6">
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Kỹ năng chuyên môn</Text>
            <TouchableOpacity onPress={() => { hapticFeedback.light(); setShowSkillModal(true); }} 
              className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px]"
            >
              <View className="flex-row flex-1 flex-wrap py-3 gap-1.5 items-center">
                {formData.skillIds.length === 0 ? (
                  <Text className="text-[15px] font-bold text-slate-400">Chọn tối thiểu 1 kỹ năng</Text>
                ) : (
                  <>
                    {formData.skillIds.slice(0, 3).map(id => {
                      const skill = availableSkills.find(s => s.id === id);
                      return (
                        <View key={id} className="bg-primary-100 px-2 py-1 rounded-lg border border-primary-200">
                          <Text className="text-[11px] font-bold text-primary-700">{skill?.name || "..."}</Text>
                        </View>
                      );
                    })}
                    {formData.skillIds.length > 3 && (
                      <View className="bg-slate-200 px-2 py-1 rounded-lg">
                        <Text className="text-[11px] font-bold text-slate-600">+{formData.skillIds.length - 3} nữa</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
              <ChevronRight size={18} color={COLORS.slate[300]} />
            </TouchableOpacity>
          </View>

          {/* Địa chỉ */}
          <View className="mb-6">
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Địa chỉ <Text className="text-rose-500">*</Text></Text>
            <TouchableOpacity 
              className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3" 
              onPress={() => { hapticFeedback.light(); setShowLocationPicker(true); }}
            >
              <MapPin size={18} color={COLORS.slate[400]} />
              <Text className={["flex-1 text-[15px] font-bold", formatLocation(formData) ? "text-slate-900" : "text-slate-400"].join(" ")} numberOfLines={1}>
                {formatLocation(formData) || "Chọn địa chỉ của bạn"}
              </Text>
              <ChevronRight size={18} color={COLORS.slate[300]} />
            </TouchableOpacity>
          </View>
          
          <View className="mb-6">
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Bán kính di chuyển (km)</Text>
            <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
              <MapPin size={18} color={COLORS.slate[400]} />
              <TextInput 
                className="flex-1 text-[15px] text-slate-900 py-2 font-bold" 
                value={formData.travelRadiusKmPreference} 
                onChangeText={t => updateField("travelRadiusKmPreference", t.replace(/[^0-9]/g, ""))} 
                placeholder="Ví dụ: 10" 
                placeholderTextColor={COLORS.slate[400]} 
                keyboardType="number-pad" 
              />
            </View>
          </View>

          {/* Lịch làm việc */}
          <View className="mb-6">
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Lịch làm việc bạn rảnh <Text className="text-rose-500">*</Text></Text>
            <DayPicker 
              schedule={formData.availabilitySchedule} 
              summary={scheduleSummary} 
              onToggle={toggleDay} 
              onSelectAll={() => { hapticFeedback.light(); updateField("availabilitySchedule", "T2, T3, T4, T5, T6, T7, CN"); }} 
              onClear={() => { hapticFeedback.light(); updateField("availabilitySchedule", ""); }} 
            />
          </View>

          {/* Kinh nghiệm */}
          <View className="mb-2">
            <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Kinh nghiệm của bạn</Text>
            <ExperienceSelector selected={formData.experienceLevelId} onSelect={id => { hapticFeedback.light(); updateField("experienceLevelId", id); }} />
          </View>
        </View>
      </ScrollView>

      {/* Button & Footer */}
      <View className="absolute bottom-0 left-0 right-0">
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.9)", "rgba(255,255,255,1)"]}
          className="h-10"
        />
        <View 
          className="px-6 py-4 bg-white border-t border-slate-100 shadow-2xl"
          style={{ 
            paddingBottom: Math.max(insets.bottom, 20),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.05,
            shadowRadius: 15,
            elevation: 20
          }}
        >
          <Button onPress={handleContinue} loading={loading} className="h-14 rounded-2xl shadow-lg shadow-primary-200">
            Bắt đầu nhận việc ngay 🚀
          </Button>
        </View>
      </View>

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        initialValues={formData}
        onSelect={(loc) => { hapticFeedback.success(); setFormData(prev => ({ ...prev, ...loc })); }}
      />

      <SkillSelectionModal 
        visible={showSkillModal} 
        onClose={() => setShowSkillModal(false)} 
        selectedSkillIds={formData.skillIds} 
        onSave={ids => { hapticFeedback.success(); updateField("skillIds", ids); }} 
      />

      <FeedbackModal 
        visible={feedback.visible} 
        title={feedback.title} 
        message={feedback.message} 
        variant={feedback.variant} 
        onClose={() => setFeedback(f => ({ ...f, visible: false }))} 
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
