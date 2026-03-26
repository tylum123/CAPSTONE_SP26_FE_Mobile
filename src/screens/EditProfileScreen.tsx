import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Platform, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { User, MapPin, Briefcase, Calendar, Clock, Camera, ChevronLeft, Check, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { LocationPicker } from "../components/profile/LocationPicker";
import { mediaService, workerProfileService } from "../services";
import { useAuth } from "../context/AuthContext";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import { parseLocation, formatLocation } from "../utils/locationUtils";

export function EditProfileScreen({ navigation, route }: any) {
  const { isAuthenticated, user } = useAuth();
  const { currentProfile, onUpdated } = route.params || {};
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    fullName: currentProfile?.fullName || "",
    age: currentProfile?.age?.toString() || currentProfile?.ageRange?.toString() || "",
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

  useEffect(() => {
    if (currentProfile?.primaryLocation) {
      const parsed = parseLocation(currentProfile.primaryLocation);
      setFormData(prev => ({ ...prev, ...parsed }));
    }
  }, [currentProfile]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showFeedback = useCallback((params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm }), []);

  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const handleSave = async () => {
    const primaryLocation = formatLocation(formData);
    const { fullName, age, availabilitySchedule, experienceLevelId, travelRadiusKmPreference, avatarUrl } = formData;

    if (!fullName || !age || !primaryLocation || !availabilitySchedule) {
      showFeedback({ title: "Thiếu thông tin", message: "Vui lòng nhập đầy đủ các trường bắt buộc.", variant: "error" });
      return;
    }

    setLoading(true);
    if (!isAuthenticated || user?.isDemo) {
      setTimeout(() => {
        const demo: any = { 
          ...currentProfile,
          id: "demo", 
          fullName, 
          age, 
          ageRange: age, 
          primaryLocation, 
          travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : null, 
          experienceLevelId, 
          experienceLevel: ["Mới bắt đầu","Có kinh nghiệm","Chuyên nghiệp"][experienceLevelId - 1], 
          availabilitySchedule, 
          avatarUrl 
        };
        onUpdated?.(demo);
        showFeedback({ title: "Thành công (Demo)", message: "Hồ sơ của bạn đã được cập nhật mô phỏng.", variant: "success", onConfirm: () => navigation.goBack() });
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const updated = await workerProfileService.updateProfile({ 
        fullName, 
        ageRange: age, 
        primaryLocation, 
        travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : undefined, 
        experienceLevelId, 
        availabilitySchedule, 
        avatarUrl 
      });
      onUpdated?.(updated);
      DeviceEventEmitter.emit("REFRESH_DATA");
      showFeedback({ title: "Thành công", message: "Hồ sơ của bạn đã được cập nhật.", variant: "success", onConfirm: () => navigation.goBack() });
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
    } catch (error: any) {
      showFeedback({ title: "Lỗi", message: "Không thể tải ảnh lên.", variant: "error" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const EXPERIENCE_LEVELS = [
    { id: 1, label: "Mới bắt đầu" },
    { id: 2, label: "Có kinh nghiệm" },
    { id: 3, label: "Chuyên nghiệp" },
  ];

  const formFields = [
    { label: "Họ và tên", required: true, Icon: User, value: formData.fullName, onChangeText: (t: string) => updateField("fullName", t), placeholder: "Nhập họ và tên" },
    { label: "Tuổi", required: true, Icon: Calendar, value: formData.age, onChangeText: (t: string) => updateField("age", t.replace(/[^0-9]/g, "")), placeholder: "Nhập số tuổi", keyboardType: "number-pad" as const },
    { 
      label: "Địa chỉ", 
      required: true, 
      Icon: MapPin, 
      value: formatLocation(formData), 
      type: "select",
      onPress: () => setShowLocationPicker(true)
    },
    { label: "Bán kính di chuyển (km)", Icon: MapPin, value: formData.travelRadiusKmPreference, onChangeText: (t: string) => updateField("travelRadiusKmPreference", t.replace(/[^0-9]/g, "")), placeholder: "Ví dụ: 10", keyboardType: "number-pad" as const },
    { label: "Lịch làm việc", required: true, Icon: Clock, value: formData.availabilitySchedule, onChangeText: (t: string) => updateField("availabilitySchedule", t), placeholder: "Ví dụ: T2-T7" },
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
          <View className="items-center py-10 bg-white border-b border-slate-100 mb-4">
            <View className="relative shadow-md">
              <Avatar source={formData.avatarUrl ? { uri: formData.avatarUrl } : undefined} fallback={formData.fullName[0] || "M"} size={100} />
              <TouchableOpacity
                className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 rounded-full justify-center items-center border-4 border-white shadow-lg"
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
              {formFields.map((field, i) => (
                <View key={i} className="mb-6">
                  <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">
                    {field.label} {field.required && <Text className="text-rose-500">*</Text>}
                  </Text>
                  {field.type === "select" ? (
                    <TouchableOpacity 
                      className="flex-row items-center bg-slate-50/80 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3"
                      onPress={field.onPress}
                    >
                      <field.Icon size={18} color={COLORS.slate[400]} />
                      <Text className={["flex-1 text-[15px] font-medium", field.value ? "text-slate-900" : "text-slate-400"].join(" ")}>
                        {field.value || `Chọn ${field.label.toLowerCase()}`}
                      </Text>
                      <ChevronRight size={18} color={COLORS.slate[300]} />
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-row items-center bg-slate-50/80 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
                      <field.Icon size={18} color={COLORS.slate[400]} />
                      <TextInput
                        className="flex-1 text-[15px] text-slate-900 py-2 font-medium"
                        value={field.value} onChangeText={field.onChangeText}
                        placeholder={field.placeholder} placeholderTextColor={COLORS.slate[400]}
                        keyboardType={field.keyboardType}
                      />
                      {field.value.length > 0 && <Check size={16} color={COLORS.primary[500]} />}
                    </View>
                  )}
                </View>
              ))}

              <View>
                <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">Mức kinh nghiệm <Text className="text-rose-500">*</Text></Text>
                <View className="flex-row gap-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level.id}
                      onPress={() => updateField("experienceLevelId", level.id)}
                      className={["flex-1 py-3 rounded-2xl border-2 items-center", formData.experienceLevelId === level.id ? "bg-primary-600 border-primary-700" : "bg-slate-50 border-slate-200"].join(" ")}
                    >
                      <Briefcase size={16} color={formData.experienceLevelId === level.id ? "#fff" : COLORS.slate[400]} />
                      <Text className={["text-[11px] font-bold mt-1", formData.experienceLevelId === level.id ? "text-white" : "text-slate-600"].join(" ")}>{level.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
