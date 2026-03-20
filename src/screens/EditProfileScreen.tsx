import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Platform } from "react-native";
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
  const [age, setAge]                             = useState(currentProfile?.age || currentProfile?.ageRange || "");
  const [primaryLocation, setPrimaryLocation]               = useState(currentProfile?.primaryLocation || "");
  const [travelRadiusKmPreference, setTravelRadiusKmPreference] = useState(currentProfile?.travelRadiusKmPreference?.toString() || "");
  // ExperienceLevelId: 1=Mới bắt đầu, 2=Có kinh nghiệm, 3=Chuyên nghiệp (BE validates range 1-3)
  const [experienceLevelId, setExperienceLevelId]           = useState<number>(currentProfile?.experienceLevelId || 1);
  const [availabilitySchedule, setAvailabilitySchedule]     = useState(currentProfile?.availabilitySchedule || "");
  const [avatarUrl, setAvatarUrl]                           = useState(currentProfile?.avatarUrl || "string");
  const [loading, setLoading]                               = useState(false);
  const [avatarUploading, setAvatarUploading]               = useState(false);
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const handleSave = async () => {
    if (!fullName || !age || !primaryLocation || !availabilitySchedule) {
      showFeedback({ title: "Thiếu thông tin", message: "Vui lòng điền đầy đủ các trường bắt buộc.", variant: "error" }); return;
    }
    if (experienceLevelId < 1 || experienceLevelId > 3) {
      showFeedback({ title: "Dữ liệu chưa hợp lệ", message: "Mức kinh nghiệm không hợp lệ.", variant: "error" }); return;
    }
    setLoading(true);
    if (!isAuthenticated || user?.isDemo) {
      setTimeout(() => {
        const demo: any = { id: "demo", userId: "demo", fullName, age: age, ageRange: age, primaryLocation, travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : null, experienceLevelId, experienceLevel: ["Mới bắt đầu","Có kinh nghiệm","Chuyên nghiệp"][experienceLevelId - 1], averageRating: 0, availabilitySchedule, totalJobsCompleted: 0, avatarUrl: avatarUrl || "", createdAt: "", updatedAt: "" };
        onUpdated?.(demo);
        showFeedback({ title: "Thành công (Demo)", message: "Hồ sơ của bạn đã được cập nhật mô phỏng.", variant: "success", onConfirm: () => navigation.goBack() });
        setLoading(false);
      }, 1000);
      return;
    }
    try {
      const updated = await workerProfileService.updateProfile({ fullName, ageRange: age, primaryLocation, travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : null, experienceLevelId, availabilitySchedule, avatarUrl: avatarUrl || "" });
      onUpdated?.(updated);
      showFeedback({ title: "Thành công", message: "Hồ sơ của bạn đã được cập nhật.", variant: "success", onConfirm: () => navigation.goBack() });
    } catch (err: any) { 
      console.error("Update profile error:", JSON.stringify(err?.response?.data || err.message || err, null, 2));
      showFeedback({ title: "Có lỗi xảy ra", message: "Không thể cập nhật hồ sơ. Vui lòng thử lại.", variant: "error" }); 
    }
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

  const EXPERIENCE_LEVELS = [
    { id: 1, label: "Mới bắt đầu" },
    { id: 2, label: "Có kinh nghiệm" },
    { id: 3, label: "Chuyên nghiệp" },
  ];

  const basicFields = [
    { label: "Họ và tên", required: true, Icon: User, value: fullName, onChangeText: setFullName, placeholder: "Nhập họ và tên" },
    { label: "Tuổi", required: true, Icon: Calendar, value: age, onChangeText: setAge, placeholder: "Nhập số tuổi", keyboardType: "number-pad" as const },
    { label: "Khu vực chính", required: true, Icon: MapPin, value: primaryLocation, onChangeText: setPrimaryLocation, placeholder: "Nhập khu vực chính" },
    { label: "Bán kính di chuyển (km)", Icon: MapPin, value: travelRadiusKmPreference, onChangeText: setTravelRadiusKmPreference, placeholder: "Ví dụ: 10", keyboardType: "number-pad" as const },
    { label: "Lịch làm việc", required: true, Icon: Clock, value: availabilitySchedule, onChangeText: setAvailabilitySchedule, placeholder: "Ví dụ: T2-T7" },
  ];

  return (
    <>
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        {/* FIX SCROLL WEB: cần height tường minh để ScrollView có thể cuộn trên React Native Web */}
        <View style={Platform.OS === 'web'
          ? { height: '100vh' as any, display: 'flex' as any, flexDirection: 'column' as any, backgroundColor: '#f8fafc' }
          : { flex: 1, backgroundColor: '#f8fafc' }
        }>
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

          <ScrollView
            style={Platform.OS === 'web' ? { flex: 1, overflowY: 'scroll' } as any : { flex: 1 }}
            showsVerticalScrollIndicator={false}
            // NOTE: overflowY: 'scroll' bắt buộc phải có trên React Native Web để kéo cuộn hoạt động
          >
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
                {basicFields.map((field, i) => (
                  <View key={i} className="mb-6">
                    <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">
                      {field.label} {(field as any).required && <Text className="text-rose-500">*</Text>}
                    </Text>
                    <View className="flex-row items-center bg-slate-50/80 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
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

                {/* Experience Level Picker - thay vì nhập số thủ công */}
                <View>
                  <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">
                    Mức kinh nghiệm <Text className="text-rose-500">*</Text>
                  </Text>
                  <View className="flex-row gap-2">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <TouchableOpacity
                        key={level.id}
                        onPress={() => setExperienceLevelId(level.id)}
                        className={[
                          "flex-1 py-3 rounded-2xl border-2 items-center",
                          experienceLevelId === level.id
                            ? "bg-primary-600 border-primary-700"
                            : "bg-slate-50 border-slate-200"
                        ].join(" ")}
                      >
                        <Briefcase size={16} color={experienceLevelId === level.id ? "#fff" : COLORS.slate[400]} />
                        <Text className={["text-[11px] font-bold mt-1", experienceLevelId === level.id ? "text-white" : "text-slate-600"].join(" ")}>
                          {level.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
            
            {/* Multi-edge bottom padding for scroll content */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer */}
          <View
            style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 24, paddingTop: 16, paddingBottom: Math.max(insets.bottom, 24), backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'stretch' }}
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
