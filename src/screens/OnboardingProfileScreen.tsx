import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, MapPin, Briefcase, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { LocationPicker } from "../components/profile/LocationPicker";
import { workerProfileService } from "../services";
import { COLORS, TYPOGRAPHY } from "../constants/theme";
import { formatLocation } from "../utils/locationUtils";
import { WelcomeModal } from "../components/ui/WelcomeModal";
import { useAuth } from "../context/AuthContext";

export function OnboardingProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!!user?.isNewUser);
  
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
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

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = async () => {
    const primaryLocation = formatLocation(formData);
    const { fullName, age, availabilitySchedule, experienceLevelId, travelRadiusKmPreference, avatarUrl } = formData;

    if (!fullName || !age || !primaryLocation || !availabilitySchedule) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    setLoading(true);
    try {
      await workerProfileService.updateProfile({
        fullName,
        ageRange: age,
        primaryLocation,
        travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : undefined,
        experienceLevelId,
        availabilitySchedule,
        avatarUrl: avatarUrl || "",
      });
      navigation.replace("Worker");
    } catch { 
      Alert.alert("Lỗi", "Không thể tạo hồ sơ. Vui lòng thử lại."); 
    } finally { 
      setLoading(false); 
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
        <View className="px-6 py-6 bg-white border-b border-slate-100">
          <Text style={TYPOGRAPHY.title} className="text-slate-900">Thiết lập hồ sơ 🚀</Text>
          <Text className="text-slate-500 mt-1">Hoàn thiện thông tin để bắt đầu nhận việc</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
            {formFields.map((field, i) => (
              <View key={i} className="mb-6">
                <Text className="text-[14px] font-bold text-slate-800 mb-2 ml-1">
                  {field.label} {field.required && <Text className="text-rose-500">*</Text>}
                </Text>
                {field.type === "select" ? (
                  <TouchableOpacity 
                    className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[56px] gap-3"
                    onPress={field.onPress}
                  >
                    <field.Icon size={18} color={COLORS.slate[400]} />
                    <Text className={["flex-1 text-[15px] font-medium", field.value ? "text-slate-900" : "text-slate-400"].join(" ")}>
                      {field.value || `Chọn ${field.label.toLowerCase()}`}
                    </Text>
                    <ChevronRight size={18} color={COLORS.slate[300]} />
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 min-h-[56px] gap-3">
                    <field.Icon size={18} color={COLORS.slate[400]} />
                    <TextInput
                      className="flex-1 text-[15px] text-slate-900 py-2 font-medium"
                      value={field.value} onChangeText={field.onChangeText}
                      placeholder={field.placeholder} placeholderTextColor={COLORS.slate[400]}
                      keyboardType={field.keyboardType}
                    />
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
        </ScrollView>

        <View className="px-6 py-6 bg-white border-t border-slate-100 shadow-lg">
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
