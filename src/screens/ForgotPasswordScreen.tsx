import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";

export function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Địa chỉ email không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to send reset password link
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);

      // Show success and navigate back after 3 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi email. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={COLORS.white} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quên mật khẩu</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!isSuccess ? (
            <>
              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <View style={styles.iconCircle}>
                  <Mail size={32} color={COLORS.emerald[600]} />
                </View>
                <Text style={styles.instructionsTitle}>Đặt lại mật khẩu</Text>
                <Text style={styles.instructionsText}>
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi liên kết để đặt
                  lại mật khẩu
                </Text>
              </View>

              {/* Email Input */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Mail size={20} color={COLORS.gray[500]} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email của bạn"
                    placeholderTextColor={COLORS.gray[400]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled,
                ]}
                onPress={handleSendResetLink}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "Đang gửi..." : "Gửi liên kết"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // Success State
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <CheckCircle size={64} color={COLORS.emerald[500]} />
              </View>
              <Text style={styles.successTitle}>Email đã được gửi!</Text>
              <Text style={styles.successText}>
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt
                lại mật khẩu
              </Text>
              <Text style={styles.emailSent}>{email}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.emerald[600],
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  instructionsContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl * 2,
    marginTop: SPACING.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  instructionsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  instructionsText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 56,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  submitButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.emerald[600],
    fontSize: 18,
    fontWeight: "bold",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl * 2,
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  emailSent: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
});
