import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Camera,
  X,
} from "lucide-react-native";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING } from "../constants/theme";
import { workerProfileService } from "../services";

export function EditProfileScreen({ navigation, route }: any) {
  const { currentProfile } = route.params || {};

  const [fullName, setFullName] = useState(currentProfile?.fullName || "");
  const [ageRange, setAgeRange] = useState(currentProfile?.ageRange || "");
  const [primaryLocation, setPrimaryLocation] = useState(
    currentProfile?.primaryLocation || "",
  );
  const [travelRadiusKmPreference, setTravelRadiusKmPreference] = useState(
    currentProfile?.travelRadiusKmPreference?.toString() || "",
  );
  const [experienceLevelId, setExperienceLevelId] = useState(
    currentProfile?.experienceLevelId || "",
  );
  const [availabilitySchedule, setAvailabilitySchedule] = useState(
    currentProfile?.availabilitySchedule || "",
  );
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatarUrl || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (
      !fullName ||
      !ageRange ||
      !primaryLocation ||
      !experienceLevelId ||
      !availabilitySchedule
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    try {
      await workerProfileService.updateProfile({
        fullName,
        ageRange,
        primaryLocation,
        travelRadiusKmPreference: travelRadiusKmPreference
          ? Number(travelRadiusKmPreference)
          : undefined,
        experienceLevelId,
        availabilitySchedule,
        avatarUrl,
      });

      Alert.alert("Thành công", "Cập nhật hồ sơ thành công", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Avatar
                source={avatarUrl ? { uri: avatarUrl } : undefined}
                fallback={fullName[0] || "M"}
                size={80}
              />
              <TouchableOpacity style={styles.changeAvatarButton}>
                <Camera size={18} color={COLORS.gray[900]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <User size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Độ tuổi <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Calendar size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={ageRange}
                  onChangeText={setAgeRange}
                  placeholder="Ví dụ: 18-25"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Khu vực chính <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <MapPin size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={primaryLocation}
                  onChangeText={setPrimaryLocation}
                  placeholder="Nhập khu vực chính"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bán kính di chuyển (km)</Text>
              <View style={styles.inputContainer}>
                <MapPin size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={travelRadiusKmPreference}
                  onChangeText={setTravelRadiusKmPreference}
                  placeholder="Ví dụ: 10"
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Mức kinh nghiệm <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Briefcase size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={experienceLevelId}
                  onChangeText={setExperienceLevelId}
                  placeholder="Nhập experienceLevelId"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Lịch làm việc <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Clock size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={availabilitySchedule}
                  onChangeText={setAvailabilitySchedule}
                  placeholder="Ví dụ: T2-T7"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Avatar URL</Text>
              <View style={styles.inputContainer}>
                <Camera size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  placeholder="Nhập URL avatar"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            variant="outline"
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            Hủy
          </Button>
          <Button
            style={styles.saveButton}
            onPress={handleSave}
            loading={loading}
          >
            Lưu thay đổi
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  avatarContainer: {
    position: "relative",
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.gray[200],
  },
  form: {
    padding: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.red[600],
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: SPACING.sm,
    minHeight: 48,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingVertical: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.gray[900],
    paddingVertical: SPACING.sm,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 0,
  },
  footer: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
