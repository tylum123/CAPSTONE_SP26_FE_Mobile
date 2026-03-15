import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { User, MapPin, Briefcase, Calendar, Clock, Camera, ChevronLeft, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { mediaService, workerProfileService } from "../services";
import { useAuth } from "../context/AuthContext";
import { COLORS, TYPOGRAPHY } from "../constants/theme";

export function EditProfileScreen({ navigation, route }: any) {
  const { isAuthenticated, user } = useAuth();
  const { currentProfile, onUpdated } = route.params || {};
  const insets = useSafeAreaInsets();
  const [fullName, setFullName]                             = useState(currentProfile?.fullName || "");
  const [ageRange, setAgeRange]                             = useState(currentProfile?.ageRange || "");
  const [primaryLocation, setPrimaryLocation]               = useState(currentProfile?.primaryLocation || "");
  const [travelRadiusKmPreference, setTravelRadiusKmPreference] = useState(currentProfile?.travelRadiusKmPreference?.toString() || "");
  const [experienceLevelId, setExperienceLevelId]           = useState(currentProfile?.experienceLevelId?.toString() || "");
  const [availabilitySchedule, setAvailabilitySchedule]     = useState(currentProfile?.availabilitySchedule || "");
  const [avatarUrl, setAvatarUrl]                           = useState(currentProfile?.avatarUrl || "");
  const [loading, setLoading]                               = useState(false);
  const [avatarUploading, setAvatarUploading]               = useState(false);
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const handleSave = async () => {
    if (!fullName || !ageRange || !primaryLocation || !experienceLevelId || !availabilitySchedule) {
      showFeedback({ title: "Thiếu thông tin", message: "Vui lòng điền đầy đủ các trường bắt buộc.", variant: "error" }); return;
    }
    const parsedLevelId = Number(experienceLevelId);
    if (Number.isNaN(parsedLevelId) || parsedLevelId < 1 || parsedLevelId > 3) {
      showFeedback({ title: "Dữ liệu chưa hợp lệ", message: "Mức kinh nghiệm phải là số từ 1 đến 3.", variant: "error" }); return;
    }
    setLoading(true);
    if (!isAuthenticated || user?.isDemo) {
      setTimeout(() => {
        onUpdated?.({ id: "demo", userId: "demo", fullName, ageRange, primaryLocation, travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : null, experienceLevelId: parsedLevelId, experienceLevel: "Demo", averageRating: 0, availabilitySchedule, totalJobsCompleted: 0, avatarUrl: avatarUrl || "", createdAt: "", updatedAt: "" });
        showFeedback({ title: "Thành công (Demo)", message: "Hồ sơ của bạn đã được cập nhật mô phỏng.", variant: "success", onConfirm: () => navigation.goBack() });
        setLoading(false);
      }, 1000);
      return;
    }
    try {
      const updated = await workerProfileService.updateProfile({ fullName, ageRange, primaryLocation, travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : undefined, experienceLevelId: parsedLevelId, availabilitySchedule, avatarUrl: avatarUrl || "" });
      onUpdated?.(updated);
      showFeedback({ title: "Thành công", message: "Hồ sơ của bạn đã được cập nhật.", variant: "success", onConfirm: () => navigation.goBack() });
    } catch { showFeedback({ title: "Có lỗi xảy ra", message: "Không thể cập nhật hồ sơ. Vui lòng thử lại.", variant: "error" }); }
    finally { if (isAuthenticated) setLoading(false); }
  };

  const handlePickAvatar = async () => {
    setAvatarUploading(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { showFeedback({ title: "Thiếu quyền truy cập", message: "Vui lòng cấp quyền truy cập thư viện ảnh.", variant: "error" }); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.85 });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;
      const uploaded = await mediaService.uploadImage({ uri: asset.uri, name: asset.fileName || "avatar.jpg", type: asset.mimeType || "image/jpeg" } as const);
      setAvatarUrl(uploaded);
    } catch { showFeedback({ title: "Tải ảnh thất bại", message: "Không thể tải lên ảnh. Vui lòng thử lại.", variant: "error" }); }
    finally { setAvatarUploading(false); }
  };

  const formFields = [
    { label: "Họ và tên", required: true, Icon: User, value: fullName, onChangeText: setFullName, placeholder: "Nhập họ và tên" },
    { label: "Độ tuổi", required: true, Icon: Calendar, value: ageRange, onChangeText: setAgeRange, placeholder: "Ví dụ: 18-25" },
    { label: "Khu vực chính", required: true, Icon: MapPin, value: primaryLocation, onChangeText: setPrimaryLocation, placeholder: "Nhập khu vực chính" },
    { label: "Bán kính di chuyển (km)", Icon: MapPin, value: travelRadiusKmPreference, onChangeText: setTravelRadiusKmPreference, placeholder: "Ví dụ: 10", keyboardType: "number-pad" as const },
    { label: "Mức kinh nghiệm", required: true, Icon: Briefcase, value: experienceLevelId, onChangeText: setExperienceLevelId, placeholder: "Nhập experienceLevelId" },
    { label: "Lịch làm việc", required: true, Icon: Clock, value: availabilitySchedule, onChangeText: setAvailabilitySchedule, placeholder: "Ví dụ: T2-T7" },
  ];

  return (
    <>
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <View className="flex-1 bg-slate-50/50">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
              >
                <ChevronLeft size={24} color={COLORS.slate[900]} />
              </TouchableOpacity>
              <Text style={TYPOGRAPHY.title} className="text-slate-900">Chỉnh sửa hồ sơ</Text>
            </View>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <Text className="text-primary-600 font-bold text-base">Lưu</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Avatar Section */}
            <View className="items-center py-10 bg-white border-b border-slate-100 mb-2">
              <View className="relative shadow-md">
                <View className="p-1 bg-rice-100 rounded-full">
                  <Avatar source={avatarUrl ? { uri: avatarUrl } : undefined} fallback={fullName[0] || "M"} size={100} />
                </View>
                <TouchableOpacity
                  className="absolute bottom-1 right-1 w-9 h-9 bg-primary-600 rounded-full justify-center items-center border-4 border-white shadow-lg"
                  onPress={handlePickAvatar} disabled={avatarUploading}
                >
                  <Camera size={18} color="white" />
                </TouchableOpacity>
              </View>
              {avatarUploading ? (
                <Text className="mt-4 text-[13px] text-primary-600 font-medium">Đang tải ảnh lên...</Text>
              ) : (
                <Text className="mt-4 text-[13px] text-slate-500 font-medium uppercase tracking-wider">Cập nhật ảnh đại diện</Text>
              )}
            </View>

            {/* Form */}
            <View className="p-5">
              <View className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
                {formFields.map((field, i) => (
                  <View key={i} className={i === formFields.length - 1 ? "" : "mb-6"}>
                    <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">
                      {field.label} {(field as any).required && <Text className="text-rose-500">*</Text>}
                    </Text>
                    <View className="flex-row items-center bg-slate-50/80 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3 focus:border-primary-500">
                      <field.Icon size={18} color={COLORS.slate[400]} />
                      <TextInput
                        className="flex-1 text-[15px] text-slate-900 py-2 font-medium"
                        value={field.value} onChangeText={field.onChangeText}
                        placeholder={field.placeholder} placeholderTextColor={COLORS.slate[400]}
                        keyboardType={(field as any).keyboardType}
                      />
                      {field.value.length > 0 && <Check size={16} color={COLORS.primary[500]} />}
                    </View>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Multi-edge bottom padding for scroll content */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer - Fixed Safe Area Issue */}
          <View 
            className="flex-row gap-4 px-6 pt-4 bg-white border-t border-slate-100 shadow-lg"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            <Button 
              variant="outline" 
              style={{ flex: 1 }} 
              onPress={() => navigation.goBack()}
            >
              Hủy
            </Button>
            <Button 
              style={{ flex: 2 }} 
              onPress={handleSave} 
              loading={loading || avatarUploading}
            >
              Lưu thay đổi
            </Button>
          </View>
        </View>
      </SafeAreaView>

      <FeedbackModal
        visible={feedback.visible} title={feedback.title}
        message={feedback.message} variant={feedback.variant}
        onClose={closeFeedback}
      />
    </>
  );
}
