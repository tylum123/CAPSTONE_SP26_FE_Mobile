import React, { useEffect, useState } from "react";
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
import { Eye, EyeOff, Lock, Mail, Phone } from "lucide-react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { CONFIG } from "../config";

// Configure Google Sign-In with your Web Client ID
if (CONFIG.GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
    offlineAccess: true, // required to get an idToken on Android Native
  });
}

type LoginTab = "phone" | "email";

export function LoginScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<LoginTab>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === "storeClient";

  const handleLogin = async () => {
    const identifier =
      activeTab === "phone" ? phoneNumber.trim() : email.trim();

    if (!identifier || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (activeTab === "phone") {
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
      if (!phoneRegex.test(identifier)) {
        Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
        return;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        Alert.alert("Lỗi", "Email không hợp lệ");
        return;
      }
    }

    setLoading(true);
    try {
      await login(identifier, password);
      Alert.alert("Thành công", "Đăng nhập thành công");
    } catch {
      Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Check that Google Client IDs are configured in .env
    if (!CONFIG.GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        "Cấu hình chưa đủ",
        "GOOGLE_WEB_CLIENT_ID chưa được cấu hình trong file .env.",
      );
      return;
    }

    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert("Lỗi", "Không lấy được Google ID token.");
        return;
      }

      await loginWithGoogle(idToken, 3);
      Alert.alert("Thành công", "Đăng nhập Google thành công");
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Lỗi", "Google Play Services không khả dụng trên thiết bị này.");
      } else {
        Alert.alert("Lỗi", "Đăng nhập Google thất bại. Vui lòng thử lại.");
        console.error("Google Sign-In Error:", error);
      }
    } finally {
      setLoading(false);
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

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                {activeTab === "phone" ? (
                  <Phone size={20} color={COLORS.gray[500]} />
                ) : (
                  <Mail size={20} color={COLORS.gray[500]} />
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder={activeTab === "phone" ? "Số điện thoại" : "Email"}
                placeholderTextColor={COLORS.gray[400]}
                value={activeTab === "phone" ? phoneNumber : email}
                onChangeText={activeTab === "phone" ? setPhoneNumber : setEmail}
                keyboardType={
                  activeTab === "phone" ? "phone-pad" : "email-address"
                }
                autoCapitalize="none"
                maxLength={activeTab === "phone" ? 11 : undefined}
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
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            >
              Đăng nhập
            </Button>

            <Text style={styles.orText}>Hoặc đăng nhập Google</Text>
            <Button
              variant="outline"
              onPress={handleGoogleLogin}
              loading={loading}
              style={styles.googleButton}
            >
              Đăng nhập Google
            </Button>
          </View>

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
  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: BORDER_RADIUS.xl,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  activeTab: {
    backgroundColor: COLORS.emerald[600],
  },
  tabText: {
    color: COLORS.gray[100],
    fontWeight: "600",
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.white,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SPACING.sm,
  },
  forgotPasswordText: {
    color: COLORS.white,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  loginButton: {
    marginTop: SPACING.xs,
  },
  orText: {
    color: COLORS.white,
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    fontSize: 13,
    opacity: 0.9,
  },
  googleButton: {
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  footerText: {
    color: COLORS.white,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.emerald[100],
    fontSize: 14,
    fontWeight: "700",
  },
  demoLinkContainer: {
    marginTop: SPACING.md,
    alignItems: "center",
  },
  demoLinkText: {
    color: COLORS.white,
    opacity: 0.9,
    textDecorationLine: "underline",
    fontSize: 13,
  },
});
