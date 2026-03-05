import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Camera,
} from "lucide-react-native";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { COLORS, SPACING } from "../constants/theme";
import { mediaService, workerProfileService } from "../services";

export function EditProfileScreen({ navigation, route }: any) {
  const { currentProfile, onUpdated } = route.params || {};

  const [fullName, setFullName] = useState(currentProfile?.fullName || "");
  const [ageRange, setAgeRange] = useState(currentProfile?.ageRange || "");
  const [primaryLocation, setPrimaryLocation] = useState(
    currentProfile?.primaryLocation || "",
  );
  const [travelRadiusKmPreference, setTravelRadiusKmPreference] = useState(
    currentProfile?.travelRadiusKmPreference?.toString() || "",
  );
  const [experienceLevelId, setExperienceLevelId] = useState(
    currentProfile?.experienceLevelId?.toString() || "",
  );
  const [availabilitySchedule, setAvailabilitySchedule] = useState(
    currentProfile?.availabilitySchedule || "",
  );
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatarUrl || "");
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info";
    onConfirm?: () => void;
  }>({ visible: false, title: "", message: "", variant: "info" });

  const showFeedback = (params: {
    title: string;
    message: string;
    variant?: "success" | "error" | "info";
    onConfirm?: () => void;
  }) => {
    setFeedback({
      visible: true,
      title: params.title,
      message: params.message,
      variant: params.variant || "info",
      onConfirm: params.onConfirm,
    });
  };

  const closeFeedback = () => {
    const cb = feedback.onConfirm;
    setFeedback((prev) => ({ ...prev, visible: false }));
    cb?.();
  };

  const handleSave = async () => {
    if (
      !fullName ||
      !ageRange ||
      !primaryLocation ||
      !experienceLevelId ||
      !availabilitySchedule
    ) {
      showFeedback({
        title: "Thiếu thông tin",
        message: "Vui lòng điền đầy đủ các trường bắt buộc.",
        variant: "error",
      });
      return;
    }

    const parsedExperienceLevelId = Number(experienceLevelId);
    if (
      Number.isNaN(parsedExperienceLevelId) ||
      parsedExperienceLevelId < 1 ||
      parsedExperienceLevelId > 3
    ) {
      showFeedback({
        title: "Dữ liệu chưa hợp lệ",
        message: "Mức kinh nghiệm phải là số từ 1 đến 3.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = await workerProfileService.updateProfile({
        fullName,
        ageRange,
        primaryLocation,
        travelRadiusKmPreference: travelRadiusKmPreference
          ? Number(travelRadiusKmPreference)
          : undefined,
        experienceLevelId: parsedExperienceLevelId,
        availabilitySchedule,
        avatarUrl: avatarUrl || "",
      });

      onUpdated?.(updatedProfile);

      showFeedback({
        title: "Thành công",
        message: "Hồ sơ của bạn đã được cập nhật.",
        variant: "success",
        onConfirm: () => navigation.goBack(),
      });
    } catch (error) {
      showFeedback({
        title: "Có lỗi xảy ra",
        message: "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    setAvatarUploading(true);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showFeedback({
          title: "Thiếu quyền truy cập",
          message: "Vui lòng cấp quyền truy cập thư viện ảnh để chọn avatar.",
          variant: "error",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      const file = {
        uri: asset.uri,
        name: asset.fileName || "avatar.jpg",
        type: asset.mimeType || "image/jpeg",
      } as const;

      const uploadedUrl = await mediaService.uploadImage(file);
      setAvatarUrl(uploadedUrl);
    } catch (error) {
      showFeedback({
        title: "Tải ảnh thất bại",
        message: "Không thể tải lên ảnh. Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Avatar
                  source={avatarUrl ? { uri: avatarUrl } : undefined}
                  fallback={fullName[0] || "M"}
                  size={80}
                />
                <TouchableOpacity
                  style={styles.changeAvatarButton}
                  onPress={handlePickAvatar}
                  disabled={avatarUploading}
                >
                  <Camera size={18} color={COLORS.gray[900]} />
                </TouchableOpacity>
              </View>
              {avatarUploading ? (
                <Text style={styles.hintText}>Đang tải ảnh lên...</Text>
              ) : null}
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
              loading={loading || avatarUploading}
            >
              Lưu thay đổi
            </Button>
          </View>
        </View>
      </SafeAreaView>

      <FeedbackModal
        visible={feedback.visible}
        title={feedback.title}
        message={feedback.message}
        variant={feedback.variant}
        onClose={closeFeedback}
      />
    </>
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
  hintText: {
    marginTop: SPACING.sm,
    color: COLORS.gray[500],
    fontSize: 13,
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
