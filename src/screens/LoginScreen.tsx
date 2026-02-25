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
import { Phone, Lock, Eye, EyeOff, Mail } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

type LoginTab = "phone" | "email";

export function LoginScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<LoginTab>("phone");

  // Phone login states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneCountdown, setPhoneCountdown] = useState(0);

  // Email login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setTimeout(
        () => setPhoneCountdown(phoneCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [phoneCountdown]);

  const handleSendPhoneOtp = async () => {
    if (!phoneNumber) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPhoneOtpSent(true);
      setPhoneCountdown(60);
      Alert.alert("Thành công", "Mã OTP đã được gửi đến số điện thoại của bạn");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phoneOtp || phoneOtp.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP 6 số");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to verify OTP and login
      await login(phoneNumber, phoneOtp);
    } catch (error) {
      Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng kiểm tra lại mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      Alert.alert("Đăng Nhập Thành Công");
    } catch (error) {
      Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (phoneCountdown === 0) {
      handleSendPhoneOtp();
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/login.jpg")}
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
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>
              Tìm kiếm cơ hội việc làm nông nghiệp
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "phone" && styles.activeTab]}
              onPress={() => setActiveTab("phone")}
            >
              <Phone
                size={20}
                color={activeTab === "phone" ? COLORS.white : COLORS.gray[600]}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "phone" && styles.activeTabText,
                ]}
              >
                Số điện thoại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "email" && styles.activeTab]}
              onPress={() => setActiveTab("email")}
            >
              <Mail
                size={20}
                color={activeTab === "email" ? COLORS.white : COLORS.gray[600]}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "email" && styles.activeTabText,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {activeTab === "phone" ? (
              // Phone Login Form
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
                    editable={!phoneOtpSent}
                  />
                </View>

                {phoneOtpSent && (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Lock size={20} color={COLORS.gray[500]} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mã OTP (6 số)"
                      placeholderTextColor={COLORS.gray[400]}
                      value={phoneOtp}
                      onChangeText={setPhoneOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                )}

                {phoneOtpSent ? (
                  <>
                    <Button
                      onPress={handlePhoneLogin}
                      loading={loading}
                      style={styles.loginButton}
                    >
                      Đăng nhập
                    </Button>

                    <View style={styles.resendContainer}>
                      <Text style={styles.resendText}>
                        Không nhận được mã?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={phoneCountdown > 0}
                      >
                        <Text
                          style={[
                            styles.resendLink,
                            phoneCountdown > 0 && styles.resendDisabled,
                          ]}
                        >
                          {phoneCountdown > 0
                            ? `Gửi lại (${phoneCountdown}s)`
                            : "Gửi lại mã"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setPhoneOtpSent(false);
                        setPhoneOtp("");
                        setPhoneCountdown(0);
                      }}
                      style={styles.changeNumberButton}
                    >
                      <Text style={styles.changeNumberText}>
                        Đổi số điện thoại
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Button
                    onPress={handleSendPhoneOtp}
                    loading={loading}
                    style={styles.loginButton}
                  >
                    Gửi mã OTP
                  </Button>
                )}
              </>
            ) : (
              // Email Login Form
              <>
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
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={COLORS.gray[500]} />
                    ) : (
                      <Eye size={20} color={COLORS.gray[500]} />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={styles.forgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <Button
                  onPress={handleEmailLogin}
                  loading={loading}
                  style={styles.loginButton}
                >
                  Đăng nhập
                </Button>
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.demoLinkContainer}
            onPress={() => navigation.navigate("WorkerDemo")}
          >
            <Text style={styles.demoLinkText}>
              Xem demo không cần đăng nhập
            </Text>
          </TouchableOpacity>
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
    paddingTop: SPACING.md * -3,
    paddingBottom: SPACING.md * 2,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  logoWrapper: {
    width: 340,
    height: 340,
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
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: COLORS.emerald[600],
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[600],
  },
  activeTabText: {
    color: COLORS.white,
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
  changeNumberButton: {
    marginTop: SPACING.md,
    alignItems: "center",
  },
  changeNumberText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
  },
  loginButton: {
    height: 56,
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
  registerLink: {
    fontSize: 14,
    color: COLORS.emerald[100],
    fontWeight: "600",
  },
  demoLinkContainer: {
    marginTop: SPACING.sm,
    alignItems: "center",
  },
  demoLinkText: {
    fontSize: 14,
    color: COLORS.white,
    textDecorationLine: "underline",
  },
});
