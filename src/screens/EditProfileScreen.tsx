import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { User, MapPin, Briefcase, Calendar, Clock, Camera, ChevronLeft, Check, ChevronRight, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Modal, FlatList } from "react-native";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { mediaService, workerProfileService, locationService } from "../services";
import { useAuth } from "../context/AuthContext";
import { COLORS, TYPOGRAPHY } from "../constants/theme";

export function EditProfileScreen({ navigation, route }: any) {
  const { isAuthenticated, user } = useAuth();
  const { currentProfile, onUpdated } = route.params || {};
  const insets = useSafeAreaInsets();
  const [fullName, setFullName]                             = useState(currentProfile?.fullName || "");
  const [age, setAge]                             = useState(currentProfile?.age?.toString() || currentProfile?.ageRange?.toString() || "");
  
  // Structured location states
  // Structured location states (using numeric codes from API)
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [provinceName, setProvinceName] = useState<string>("");
  const [districtName, setDistrictName] = useState<string>("");
  const [ward, setWard] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  
  const [travelRadiusKmPreference, setTravelRadiusKmPreference] = useState(currentProfile?.travelRadiusKmPreference?.toString() || "");
  // ExperienceLevelId: 1=Mới bắt đầu, 2=Có kinh nghiệm, 3=Chuyên nghiệp (BE validates range 1-3)
  const [experienceLevelId, setExperienceLevelId]           = useState<number>(currentProfile?.experienceLevelId || 1);
  const [availabilitySchedule, setAvailabilitySchedule]     = useState(currentProfile?.availabilitySchedule || "");
  const [avatarUrl, setAvatarUrl]                           = useState(currentProfile?.avatarUrl || "string");
  const [loading, setLoading]                               = useState(false);
  const [avatarUploading, setAvatarUploading]               = useState(false);
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });

  // Selection Modal states
  const [selectionModal, setSelectionModal] = useState<{ visible: boolean; type: "province" | "district" | "ward"; data: any[] }>({ visible: false, type: "province", data: [] });

  // Initialize structured location from existing primaryLocation string
  React.useEffect(() => {
    const initLocation = async () => {
      if (currentProfile?.primaryLocation) {
        const parts = currentProfile.primaryLocation.split(",").map((s: string) => s.trim());
        if (parts.length >= 1) {
          try {
            const pName = parts[parts.length - 1];
            const provinces = await locationService.getProvinces();
            const province = provinces.find((p: any) => p.name.includes(pName) || pName.includes(p.name));
            if (province) {
              setProvinceId(province.code);
              setProvinceName(province.name);
              if (parts.length >= 2) {
                const dName = parts[parts.length - 2];
                const districts = await locationService.getDistricts(province.code);
                const district = districts.find((d: any) => d.name.includes(dName) || dName.includes(d.name));
                if (district) {
                  setDistrictId(district.code);
                  setDistrictName(district.name);
                  if (parts.length >= 3) {
                    const wName = parts[parts.length - 3];
                    const wards = await locationService.getWards(district.code);
                    const wardMatch = wards.find((w: any) => w.name.includes(wName) || wName.includes(w.name));
                    if (wardMatch) setWard(wardMatch.name);
                    if (parts.length >= 4) setStreet(parts.slice(0, parts.length - 3).join(", "));
                  }
                }
              }
            }
          } catch (e) { console.warn("Failed to parse location:", e); }
        }
      }
    };
    initLocation();
  }, [currentProfile]);

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const handleSave = async () => {
    // Assemble primaryLocation string
    const locationParts = [street, ward, districtName, provinceName].filter(p => !!p);
    const primaryLocation = locationParts.join(", ");

    if (!fullName || !age || !provinceId || !districtId || !ward || !availabilitySchedule) {
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
    { label: "Tuổi", required: true, Icon: Calendar, value: age, onChangeText: (t: string) => setAge(t.replace(/[^0-9]/g, "")), placeholder: "Nhập số tuổi", keyboardType: "number-pad" as const },
    { 
      label: "Địa chỉ hiện tại", 
      required: true, 
      Icon: MapPin, 
      value: [street, ward, districtName, provinceName].filter(p => !!p).join(", "), 
      type: "select",
      onPress: async () => {
        setLoading(true);
        try {
          const provinces = await locationService.getProvinces();
          setSelectionModal({ visible: true, type: "province", data: provinces.map((p: any) => ({ id: p.code, name: p.name })) });
        } catch (e) { showFeedback({ title: "Lỗi", message: "Không thể tải danh sách tỉnh thành.", variant: "error" }); }
        finally { setLoading(false); }
      }
    },
    { label: "Bán kính di chuyển (km)", Icon: MapPin, value: travelRadiusKmPreference, onChangeText: (t: string) => setTravelRadiusKmPreference(t.replace(/[^0-9]/g, "")), placeholder: "Ví dụ: 10", keyboardType: "number-pad" as const },
    { label: "Lịch làm việc", required: true, Icon: Clock, value: availabilitySchedule, onChangeText: setAvailabilitySchedule, placeholder: "Ví dụ: T2-T7" },
  ];

  const handleSelect = async (item: any) => {
    if (selectionModal.type === "province") {
      setProvinceId(item.id);
      setProvinceName(item.name);
      setDistrictId(null);
      setDistrictName("");
      setWard("");
      setLoading(true);
      try {
        const districts = await locationService.getDistricts(item.id);
        setSelectionModal({ visible: true, type: "district", data: districts.map((d: any) => ({ id: d.code, name: d.name })) });
      } catch (e) { showFeedback({ title: "Lỗi", message: "Không thể tải danh sách quận huyện.", variant: "error" }); }
      finally { setLoading(false); }
    } else if (selectionModal.type === "district") {
      setDistrictId(item.id);
      setDistrictName(item.name);
      setWard("");
      setLoading(true);
      try {
        const wards = await locationService.getWards(item.id);
        setSelectionModal({ visible: true, type: "ward", data: wards.map((w: any) => ({ id: w.code, name: w.name })) });
      } catch (e) { showFeedback({ title: "Lỗi", message: "Không thể tải danh sách phường xã.", variant: "error" }); }
      finally { setLoading(false); }
    } else {
      setWard(item.name);
      setSelectionModal(p => ({ ...p, visible: false }));
    }
  };

  const handleBackSelection = async () => {
    setLoading(true);
    try {
      if (selectionModal.type === "district") {
        const provinces = await locationService.getProvinces();
        setSelectionModal({ visible: true, type: "province", data: provinces.map((p: any) => ({ id: p.code, name: p.name })) });
      } else if (selectionModal.type === "ward") {
        if (provinceId) {
          const districts = await locationService.getDistricts(provinceId);
          setSelectionModal({ visible: true, type: "district", data: districts.map((d: any) => ({ id: d.code, name: d.name })) });
        }
      }
    } catch (e) { showFeedback({ title: "Lỗi", message: "Kết nối thất bại.", variant: "error" }); }
    finally { setLoading(false); }
  };

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
            <View className="w-10" />
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
                  <View key={i} className={["mb-6", (field as any).disabled ? "opacity-40" : ""].join(" ")}>
                    <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">
                      {field.label} {(field as any).required && <Text className="text-rose-500">*</Text>}
                    </Text>
                    { (field as any).type === "select" ? (
                      <TouchableOpacity 
                        className="flex-row items-start bg-slate-50/80 px-4 rounded-2xl border border-slate-100 min-h-[80px] gap-3 pt-3.5 pb-3.5"
                        disabled={(field as any).disabled}
                        onPress={(field as any).onPress}
                        activeOpacity={0.7}
                      >
                        <View className="pt-0.5">
                          <field.Icon size={18} color={COLORS.slate[400]} />
                        </View>
                        <Text className={["flex-1 text-[15px] font-medium leading-[22px]", field.value ? "text-slate-900" : "text-slate-400"].join(" ")}>
                          {field.value || `Chọn ${field.label.toLowerCase()}`}
                        </Text>
                        <View className="pt-0.5">
                          <ChevronRight size={18} color={COLORS.slate[300]} />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View className="flex-row items-center bg-slate-50/80 px-4 rounded-2xl border border-slate-100 min-h-[52px] gap-3">
                        <field.Icon size={18} color={COLORS.slate[400]} />
                        <TextInput
                          className="flex-1 text-[15px] text-slate-900 py-2 font-medium"
                          value={field.value} onChangeText={(field as any).onChangeText}
                          placeholder={field.placeholder} placeholderTextColor={COLORS.slate[400]}
                          keyboardType={(field as any).keyboardType}
                        />
                        {field.value.length > 0 && <Check size={16} color={COLORS.primary[500]} />}
                      </View>
                    )}
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

      {/* Selection Modal */}
      <Modal visible={selectionModal.visible} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[32px] max-h-[70%]">
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-slate-50">
              <View className="flex-row items-center gap-3">
                {selectionModal.type !== "province" && (
                  <TouchableOpacity onPress={handleBackSelection} className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
                    <ChevronLeft size={18} color={COLORS.slate[600]} />
                  </TouchableOpacity>
                )}
                <View>
                  <Text className="text-xl font-bold text-slate-900">
                    Chọn {selectionModal.type === "province" ? "Tỉnh / Thành phố" : selectionModal.type === "district" ? "Quận / Huyện" : "Phường / Xã"}
                  </Text>
                  {selectionModal.type !== "province" && (
                    <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                      {[provinceName, districtName].filter(p => !!p).join(" > ")}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectionModal(p => ({ ...p, visible: false }))}>
                <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                  <X size={18} color={COLORS.slate[500]} />
                </View>
              </TouchableOpacity>
            </View>

            <View className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <Text className="text-[14px] font-bold text-slate-800 mb-2">Số nhà, tên đường</Text>
              <View className="flex-row items-center bg-white px-4 rounded-2xl border border-slate-200 min-h-[52px] gap-3">
                <MapPin size={18} color={COLORS.slate[400]} />
                <TextInput
                  className="flex-1 text-[15px] text-slate-900 py-2 font-medium"
                  value={street} onChangeText={setStreet}
                  placeholder="Ví dụ: 123 Đường 3/2" placeholderTextColor={COLORS.slate[400]}
                />
              </View>
            </View>

            <FlatList
              data={selectionModal.data}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => {
                const isSelected = 
                  (selectionModal.type === "province" && provinceId === item.id) || 
                  (selectionModal.type === "district" && districtId === item.id) ||
                  (selectionModal.type === "ward" && ward === item.name);
                
                return (
                  <TouchableOpacity 
                    className={["flex-row items-center justify-between py-4 px-4 mb-2 rounded-2xl border transition-all", 
                      isSelected ? "bg-primary-50 border-primary-100" : "bg-white border-slate-100"].join(" ")}
                    onPress={() => handleSelect(item)}
                  >
                    <Text className={["font-semibold text-base", isSelected ? "text-primary-700" : "text-slate-700"].join(" ")}>{item.name}</Text>
                    {isSelected ? (
                      <Check size={20} color={COLORS.primary[600]} />
                    ) : (
                      <ChevronRight size={16} color={COLORS.slate[300]} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
