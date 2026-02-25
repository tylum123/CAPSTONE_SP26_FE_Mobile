import React, { useState, useEffect } from "react";
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
  ImageBackground,
  Image,
} from "react-native";
import { Phone, Lock, Eye, EyeOff, Mail, MapPin } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Form, Step 2: OTP

  // Form data
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP data
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const handleSendOtp = async () => {
    if (!phoneNumber || !email || !address || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    // Validate phone number
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep(2);
      setCountdown(60);
      Alert.alert("Thành công", "Mã OTP đã được gửi đến số điện thoại của bạn");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP 6 số");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to verify OTP and register
      await register({
        email,
        phoneNumber,
        password,
        address,
        roleId: 2,
      });
      Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Xác thực OTP thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      // TODO: Call API to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCountdown(60);
      Alert.alert("Thành công", "Mã OTP mới đã được gửi");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi lại OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/register.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>
              {step === 1 ? "Tạo tài khoản mới" : "Xác thực OTP"}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? "Bắt đầu hành trình tìm việc nông nghiệp"
                : `Mã OTP đã được gửi đến ${phoneNumber}`}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 1 ? (
              // Registration Form
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Phone size={20} color={COLORS.gray[500]} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    placeholderTextColor={COLORS.gray[400]}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Mail size={20} color={COLORS.gray[500]} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={COLORS.gray[400]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <MapPin size={20} color={COLORS.gray[500]} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Địa chỉ"
                    placeholderTextColor={COLORS.gray[400]}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Lock size={20} color={COLORS.gray[500]} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor={COLORS.gray[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={COLORS.gray[500]} />
                    ) : (
                      <Eye size={20} color={COLORS.gray[500]} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Lock size={20} color={COLORS.gray[500]} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor={COLORS.gray[400]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={COLORS.gray[500]} />
                    ) : (
                      <Eye size={20} color={COLORS.gray[500]} />
                    )}
                  </TouchableOpacity>
                </View>

                <Button
                  onPress={handleSendOtp}
                  loading={loading}
                  style={styles.registerButton}
                >
                  Tiếp tục
                </Button>
              </>
            ) : (
              // OTP Verification Step
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Lock size={20} color={COLORS.gray[500]} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mã OTP (6 số)"
                    placeholderTextColor={COLORS.gray[400]}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>

                <Button
                  onPress={handleVerifyOtp}
                  loading={loading}
                  style={styles.registerButton}
                >
                  Xác thực & Đăng ký
                </Button>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Không nhận được mã? </Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={countdown > 0}
                  >
                    <Text
                      style={[
                        styles.resendLink,
                        countdown > 0 && styles.resendDisabled,
                      ]}
                    >
                      {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi lại mã"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setStep(1);
                    setOtp("");
                    setCountdown(60);
                  }}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>
                    ← Quay lại thay đổi thông tin
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md * -1,
    paddingBottom: SPACING.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  logoWrapper: {
    width: 250,
    height: 250,
    overflow: "hidden",
    marginBottom: SPACING.xs * -2,
  },
  logo: {
    width: "110%",
    height: "110%",
    marginLeft: "-5%",
    marginTop: "-5%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  form: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.white,
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.emerald[100],
    fontWeight: "600",
  },
  resendDisabled: {
    color: COLORS.gray[400],
  },
  backButton: {
    marginTop: SPACING.md,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
  },
  registerButton: {
    height: 56,
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: COLORS.white,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.emerald[100],
    fontWeight: "600",
  },
});
