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

export function RegisterScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { register, loginWithGoogle } = useAuth();
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
          (googleResponse.params as any)?.error_description ||
          (googleResponse.params as any)?.error ||
          "Google OAuth request failed.";
        Alert.alert("Google Signup lỗi", String(oauthError));
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
        Alert.alert("Lỗi", "Đăng ký bằng Google thất bại. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    doGoogleLogin().catch(() => undefined);
  }, [googleResponse, loginWithGoogle]);

  const handleRegister = async () => {
    if (!phoneNumber || !email || !address || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phoneNumber)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      await register({
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        address: address.trim(),
        roleId: 3,
      });
      Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
        { text: "Đăng nhập ngay", onPress: () => navigation.navigate("Login") },
      ]);
    } catch {
      Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!googleRequest) {
      Alert.alert("Lỗi", "Google Sign-In chưa sẵn sàng.");
      return;
    }
    await promptGoogleAuth();
  };

  const fields = [
    {
      key: "phone",
      label: "Số điện thoại",
      placeholder: "0912 345 678",
      icon: Phone,
      value: phoneNumber,
      onChangeText: setPhoneNumber,
      keyboardType: "phone-pad" as const,
      maxLength: 11,
      secureTextEntry: false,
    },
    {
      key: "email",
      label: "Email",
      placeholder: "email@example.com",
      icon: Mail,
      value: email,
      onChangeText: setEmail,
      keyboardType: "email-address" as const,
      autoCapitalize: "none" as const,
      secureTextEntry: false,
    },
    {
      key: "address",
      label: "Địa chỉ",
      placeholder: "Số nhà, đường, phường, tỉnh...",
      icon: MapPin,
      value: address,
      onChangeText: setAddress,
      secureTextEntry: false,
    },
    {
      key: "password",
      label: "Mật khẩu",
      placeholder: "Tối thiểu 6 ký tự",
      icon: Lock,
      value: password,
      onChangeText: setPassword,
      secureTextEntry: !showPassword,
      showToggle: true,
      toggleState: showPassword,
      onToggle: () => setShowPassword(!showPassword),
    },
    {
      key: "confirm",
      label: "Xác nhận mật khẩu",
      placeholder: "Nhập lại mật khẩu",
      icon: Lock,
      value: confirmPassword,
      onChangeText: setConfirmPassword,
      secureTextEntry: !showConfirmPassword,
      showToggle: true,
      toggleState: showConfirmPassword,
      onToggle: () => setShowConfirmPassword(!showConfirmPassword),
    },
  ];

  return (
    <ImageBackground
      source={require("../../assets/register.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header text (No Logo) */}
          <View style={styles.headerArea}>
            <Text style={styles.title}>Tạo tài khoản 🌱</Text>
            <Text style={styles.subtitle}>
              Bắt đầu hành trình tìm việc nông nghiệp
            </Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {fields.map((field) => {
              const IconComp = field.icon;
              const isFocused = focusedField === field.key;
              return (
                <View key={field.key} style={styles.fieldGroup}>
                  <Text style={styles.label}>{field.label}</Text>
                  <View
                    style={[
                      styles.inputRow,
                      isFocused && styles.inputRowFocused,
                    ]}
                  >
                    <View style={styles.inputIcon}>
                      <IconComp
                        size={17}
                        color={
                          isFocused ? COLORS.emerald[600] : COLORS.slate[400]
                        }
                      />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder={field.placeholder}
                      placeholderTextColor={COLORS.slate[300]}
                      value={field.value}
                      onChangeText={field.onChangeText}
                      keyboardType={field.keyboardType}
                      autoCapitalize={field.autoCapitalize || "sentences"}
                      maxLength={field.maxLength}
                      secureTextEntry={field.secureTextEntry}
                      onFocus={() => setFocusedField(field.key)}
                      onBlur={() => setFocusedField(null)}
                      returnKeyType="next"
                    />
                    {field.showToggle && (
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={field.onToggle}
                      >
                        {field.toggleState ? (
                          <EyeOff size={17} color={COLORS.slate[400]} />
                        ) : (
                          <Eye size={17} color={COLORS.slate[400]} />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            <Button
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
            >
              Tạo tài khoản
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
              onPress={handleGoogleSignup}
              activeOpacity={0.88}
            >
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
                }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Đăng ký với Google</Text>
            </TouchableOpacity>
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
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 100, 75, 0.78)",
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },

  /* Header area without logo */
  headerArea: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  title: {
    fontSize: 26,
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
    marginBottom: SPACING.xs,
  },

  /* Card */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },

  /* Form fields */
  fieldGroup: { marginBottom: SPACING.md },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.slate[600],
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.slate[50],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.slate[200],
    height: 50,
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
  },
  footerText: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  loginLink: { color: COLORS.white, fontSize: 14, fontWeight: "800" },
});
