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
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Camera,
  X,
} from "lucide-react-native";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING } from "../constants/theme";

export function EditProfileScreen({ navigation, route }: any) {
  const { currentProfile } = route.params || {};

  const [name, setName] = useState(currentProfile?.name || "Minh Nguyen");
  const [phoneNumber, setPhoneNumber] = useState(
    currentProfile?.phone || "0123456789",
  );
  const [email, setEmail] = useState(
    currentProfile?.email || "minh@example.com",
  );
  const [address, setAddress] = useState(
    currentProfile?.address || "Cần Thơ, Việt Nam",
  );
  const [bio, setBio] = useState(
    currentProfile?.bio ||
      "Có kinh nghiệm 5 năm làm việc trong lĩnh vực nông nghiệp",
  );
  const [skills, setSkills] = useState(
    currentProfile?.skills ||
      "Thu hoạch, Chăm sóc cây trồng, Phun thuốc, Làm đất",
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !phoneNumber) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    // Validate phone number
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
              <Avatar fallback={name[0] || "M"} size={80} />
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
                  value={name}
                  onChangeText={setName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Số điện thoại <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Phone size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Nhập email"
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Địa chỉ</Text>
              <View style={styles.inputContainer}>
                <MapPin size={18} color={COLORS.gray[400]} />
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Nhập địa chỉ"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Giới thiệu bản thân</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Mô tả ngắn về bản thân và kinh nghiệm"
                  placeholderTextColor={COLORS.gray[400]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Kỹ năng</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={skills}
                  onChangeText={setSkills}
                  placeholder="Các kỹ năng của bạn (cách nhau bởi dấu phẩy)"
                  placeholderTextColor={COLORS.gray[400]}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
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
