import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { User, MapPin, Briefcase, Calendar, Clock, Camera } from "lucide-react-native";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { mediaService, workerProfileService } from "../services";
import { useAuth } from "../context/AuthContext";

export function EditProfileScreen({ navigation, route }: any) {
  const { isAuthenticated, user } = useAuth();
  const { currentProfile, onUpdated } = route.params || {};

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
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 bg-slate-50">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
            <Text className="text-xl font-bold text-slate-900">Chỉnh sửa hồ sơ</Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Avatar */}
            <View className="items-center py-8 bg-white border-b border-slate-200">
              <View className="relative">
                <Avatar source={avatarUrl ? { uri: avatarUrl } : undefined} fallback={fullName[0] || "M"} size={80} />
                <TouchableOpacity
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full justify-center items-center border-2 border-slate-200"
                  onPress={handlePickAvatar} disabled={avatarUploading}
                >
                  <Camera size={18} color="#111827" />
                </TouchableOpacity>
              </View>
              {avatarUploading && <Text className="mt-2 text-[13px] text-slate-500">Đang tải ảnh lên...</Text>}
            </View>

            {/* Form */}
            <View className="p-6">
              {formFields.map((field, i) => (
                <View key={i} className="mb-6">
                  <Text className="text-sm font-semibold text-slate-700 mb-2">
                    {field.label} {(field as any).required && <Text className="text-red-600">*</Text>}
                  </Text>
                  <View className="flex-row items-center bg-white px-4 border border-slate-200 min-h-[48px] gap-2">
                    <field.Icon size={18} color="#9ca3af" />
                    <TextInput
                      className="flex-1 text-[15px] text-slate-900 py-2"
                      value={field.value} onChangeText={field.onChangeText}
                      placeholder={field.placeholder} placeholderTextColor="#9ca3af"
                      keyboardType={(field as any).keyboardType}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="flex-row gap-4 p-6 bg-white border-t border-slate-200">
            <Button variant="outline" style={{ flex: 1 }} onPress={() => navigation.goBack()}>Hủy</Button>
            <Button style={{ flex: 2 }} onPress={handleSave} loading={loading || avatarUploading}>Lưu thay đổi</Button>
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
