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
import { Phone, Lock, Eye, EyeOff, Mail } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { CONFIG } from "../config";

WebBrowser.maybeCompleteAuthSession();

const EXPO_GO_REDIRECT_URI =
  "https://auth.expo.io/@tylum123/CAPSTONE_SP26_FE_Mobile";

type LoginTab = "phone" | "email";

export function LoginScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<LoginTab>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login, loginWithGoogle, demoLogin } = useAuth();
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === "storeClient";

  const [googleRequest, googleResponse, promptGoogleAuth] =
    Google.useIdTokenAuthRequest({
      webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID || undefined,
      androidClientId: CONFIG.GOOGLE_ANDROID_CLIENT_ID || undefined,
      redirectUri: isExpoGo
        ? EXPO_GO_REDIRECT_URI
        : makeRedirectUri({ scheme: "agrotemp" }),
      selectAccount: true,
      scopes: ["openid", "profile", "email"],
    });

  useEffect(() => {
    const doGoogleLogin = async () => {
      if (!googleResponse) return;
      if (googleResponse.type === "error") {
        const oauthError =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (googleResponse.params as any)?.error_description ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (googleResponse.params as any)?.error ||
          "Google OAuth request failed.";
        Alert.alert("Google Login lỗi", String(oauthError));
        return;
      }
      if (googleResponse.type !== "success") return;
      const idToken = googleResponse.params?.id_token;
      if (!idToken) {
        Alert.alert("Lỗi", "Không lấy được Google ID token.");
        return;
      }
      setLoading(true);
      try {
        await loginWithGoogle(idToken, 3);
      } catch {
        Alert.alert("Lỗi", "Đăng nhập Google thất bại. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    doGoogleLogin().catch(() => undefined);
  }, [googleResponse, loginWithGoogle]);

  const handleLogin = async () => {
    const identifier =
      activeTab === "phone" ? phoneNumber.trim() : email.trim();
    if (!identifier || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (activeTab === "phone") {
      if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(identifier)) {
        Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        Alert.alert("Lỗi", "Email không hợp lệ");
        return;
      }
    }
    setLoading(true);
    try {
      await login(identifier, password);
    } catch {
      Alert.alert("Lỗi", "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!googleRequest) {
      Alert.alert("Lỗi", "Google Sign-In chưa sẵn sàng.");
      return;
    }
    await promptGoogleAuth();
  };

  const handleDemoLogin = () => {
    demoLogin(); // Kích hoạt chế độ demo, user truy cập toàn bộ màn hình
  };

  return (
    <ImageBackground
      source={require("../../assets/login.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header text (No Logo) */}
          <View style={styles.headerArea}>
            <Text style={styles.title}>Chào mừng trở lại! 👋</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để tìm việc nông nghiệp
            </Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {/* Tab switcher */}
            <View style={styles.tabs}>
              {(["phone", "email"] as LoginTab[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  {tab === "phone" ? (
                    <Phone
                      size={15}
                      color={
                        activeTab === tab
                          ? COLORS.emerald[600]
                          : COLORS.slate[400]
                      }
                    />
                  ) : (
                    <Mail
                      size={15}
                      color={
                        activeTab === tab
                          ? COLORS.emerald[600]
                          : COLORS.slate[400]
                      }
                    />
                  )}
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.tabTextActive,
                    ]}
                  >
                    {tab === "phone" ? "Điện thoại" : "Email"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Identifier input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                {activeTab === "phone" ? "Số điện thoại" : "Email"}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  phoneFocused && styles.inputRowFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  {activeTab === "phone" ? (
                    <Phone
                      size={17}
                      color={
                        phoneFocused ? COLORS.emerald[600] : COLORS.slate[400]
                      }
                    />
                  ) : (
                    <Mail
                      size={17}
                      color={
                        phoneFocused ? COLORS.emerald[600] : COLORS.slate[400]
                      }
                    />
                  )}
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    activeTab === "phone" ? "0912 345 678" : "email@example.com"
                  }
                  placeholderTextColor={COLORS.slate[300]}
                  value={activeTab === "phone" ? phoneNumber : email}
                  onChangeText={
                    activeTab === "phone" ? setPhoneNumber : setEmail
                  }
                  keyboardType={
                    activeTab === "phone" ? "phone-pad" : "email-address"
                  }
                  autoCapitalize="none"
                  maxLength={activeTab === "phone" ? 11 : undefined}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password input */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Mật khẩu</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text style={styles.forgotLink}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputRow,
                  passwordFocused && styles.inputRowFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <Lock
                    size={17}
                    color={
                      passwordFocused ? COLORS.emerald[600] : COLORS.slate[400]
                    }
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.slate[300]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={17} color={COLORS.slate[400]} />
                  ) : (
                    <Eye size={17} color={COLORS.slate[400]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login button */}
            <Button onPress={handleLogin} loading={loading} fullWidth size="lg">
              Đăng nhập
            </Button>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>hoặc</Text>
              <View style={styles.divLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              activeOpacity={0.88}
            >
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
                }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Tiếp tục với Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.demoBtn} onPress={handleDemoLogin}>
            <Text style={styles.demoText}>
              Xem bản demo (không cần đăng nhập) →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 100, 75, 0.78)",
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl, // increased padding to compensate missing logo
    paddingBottom: SPACING.xl,
    justifyContent: "center",
  },

  /* Header without logo */
  headerArea: { alignItems: "center", marginBottom: SPACING.xl },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
  },

  /* Card */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },

  /* Tabs */
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.slate[100],
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.xs,
  },
  tabText: { fontSize: 13, fontWeight: "600", color: COLORS.slate[400] },
  tabTextActive: { color: COLORS.emerald[600] },

  /* Form fields */
  fieldGroup: { marginBottom: SPACING.md },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.slate[600],
    marginBottom: 6,
  },
  forgotLink: { fontSize: 13, fontWeight: "600", color: COLORS.emerald[600] },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.slate[50],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.slate[200],
    height: 52,
    paddingHorizontal: SPACING.md,
  },
  inputRowFocused: {
    borderColor: COLORS.emerald[500],
    backgroundColor: "#f0fdf4",
  },
  inputIcon: { marginRight: 10 },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.slate[800],
    height: "100%",
  },
  eyeBtn: { padding: 4 },

  /* Divider */
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.slate[200] },
  divText: { fontSize: 12, color: COLORS.slate[400], fontWeight: "500" },

  /* Google */
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.slate[300],
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
  },
  googleIcon: { width: 20, height: 20 },
  googleText: { fontSize: 15, fontWeight: "600", color: COLORS.slate[700] },

  /* Footer */
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  footerText: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  registerLink: { color: COLORS.white, fontSize: 14, fontWeight: "800" },
  demoBtn: { alignItems: "center", paddingVertical: SPACING.sm },
  demoText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
