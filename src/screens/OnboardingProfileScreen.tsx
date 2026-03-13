import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { workerProfileService } from "../services";

export function OnboardingProfileScreen({ navigation }: any) {
  const [fullName, setFullName]                             = useState("");
  const [ageRange, setAgeRange]                             = useState("");
  const [primaryLocation, setPrimaryLocation]               = useState("");
  const [travelRadiusKmPreference, setTravelRadiusKmPreference] = useState("");
  const [experienceLevelId, setExperienceLevelId]           = useState("");
  const [availabilitySchedule, setAvailabilitySchedule]     = useState("");
  const [avatarUrl, setAvatarUrl]                           = useState("");
  const [loading, setLoading]                               = useState(false);

  const handleContinue = async () => {
    if (!fullName || !ageRange || !primaryLocation || !experienceLevelId || !availabilitySchedule) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc"); return;
    }
    const parsedLevelId = Number(experienceLevelId);
    if (Number.isNaN(parsedLevelId) || parsedLevelId < 1 || parsedLevelId > 3) {
      Alert.alert("Lỗi", "ExperienceLevelId phải là số từ 1 đến 3"); return;
    }
    setLoading(true);
    try {
      await workerProfileService.updateProfile({
        fullName, ageRange, primaryLocation,
        travelRadiusKmPreference: travelRadiusKmPreference ? Number(travelRadiusKmPreference) : undefined,
        experienceLevelId: parsedLevelId, availabilitySchedule, avatarUrl: avatarUrl || "",
      });
      navigation.replace("Worker");
    } catch { Alert.alert("Lỗi", "Không thể tạo hồ sơ. Vui lòng thử lại."); }
    finally { setLoading(false); }
  };

  const fields = [
    { placeholder: "Họ và tên", value: fullName,                      onChangeText: setFullName },
    { placeholder: "Độ tuổi (vd: 18-25)", value: ageRange,            onChangeText: setAgeRange },
    { placeholder: "Khu vực chính", value: primaryLocation,           onChangeText: setPrimaryLocation },
    { placeholder: "Bán kính di chuyển (km)", value: travelRadiusKmPreference, onChangeText: setTravelRadiusKmPreference, keyboardType: "number-pad" as const },
    { placeholder: "ExperienceLevelId (1-3)", value: experienceLevelId, onChangeText: setExperienceLevelId },
    { placeholder: "Lịch làm việc (vd: T2-T7)", value: availabilitySchedule, onChangeText: setAvailabilitySchedule },
    { placeholder: "Avatar URL (tuỳ chọn)", value: avatarUrl,         onChangeText: setAvatarUrl },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 p-6 gap-4">
        <Text className="text-xl font-bold text-slate-900">Tạo hồ sơ lao động</Text>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {fields.map((field, i) => (
            <TextInput
              key={i}
              className="border border-slate-200 rounded-[10px] px-4 py-2 text-slate-900 text-[15px]"
              placeholder={field.placeholder} placeholderTextColor="#9ca3af"
              value={field.value} onChangeText={field.onChangeText}
              keyboardType={(field as any).keyboardType}
            />
          ))}
        </ScrollView>
        <Button onPress={handleContinue} loading={loading}>Tiếp tục</Button>
      </View>
    </SafeAreaView>
  );
}
