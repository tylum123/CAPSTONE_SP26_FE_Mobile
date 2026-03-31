/* AI CONTEXT:
 * Action: Authenticates users into the mobile application.
 * Inputs: User credentials (email/phone and password).
 * Outputs: JWT token, user session state.
 * Dependencies: Auth service, Auth context, Storage utilities. */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
import { useAuth } from "../context/AuthContext";
import { CONFIG } from "../config/export_configurations";
import { FeedbackModal } from "../components/ui/FeedbackModal";

if (CONFIG.GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
    offlineAccess: true,
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
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });
  const { login, loginWithGoogle, demoLogin } = useAuth();

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const handleLogin = async () => {
    const identifier = activeTab === "phone" ? phoneNumber.trim() : email.trim();
    if (!identifier || !password) { showFeedback({ title: "Thiếu thông tin", message: "Vui lòng nhập đầy đủ thông tin", variant: "error" }); return; }
    if (activeTab === "phone") {
      if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(identifier)) { showFeedback({ title: "Lỗi định dạng", message: "Số điện thoại không hợp lệ", variant: "error" }); return; }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) { showFeedback({ title: "Lỗi định dạng", message: "Email không hợp lệ", variant: "error" }); return; }
    }
    setLoading(true);
    try { await login(identifier, password); }
    catch (error: any) { 
      if (error?.message === "UNAUTHORIZED_ROLE") {
        showFeedback({ title: "Không có quyền", message: "Tài khoản của bạn không có quyền đăng nhập vào ứng dụng dành cho Người lao động (Worker).", variant: "error" });
      } else {
        showFeedback({ title: "Đăng nhập thất bại", message: "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.", variant: "error" }); 
      }
    }
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    if (!CONFIG.GOOGLE_WEB_CLIENT_ID) { showFeedback({ title: "Cấu hình thiếu", message: "GOOGLE_WEB_CLIENT_ID chưa được cấu hình.", variant: "error" }); return; }
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) { showFeedback({ title: "Lỗi kết nối", message: "Không lấy được Google ID token.", variant: "error" }); return; }
      await loginWithGoogle(idToken, 3);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error?.message === "UNAUTHORIZED_ROLE") {
        showFeedback({ title: "Không có quyền", message: "Tài khoản của bạn không có quyền đăng nhập vào ứng dụng cho Worker.", variant: "error" });
        return;
      }
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
      else if (error.code === statusCodes.IN_PROGRESS) return;
      else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) showFeedback({ title: "Lỗi Google", message: "Google Play Services không khả dụng.", variant: "error" });
      else {
        showFeedback({ title: "Lỗi Đăng Nhập", message: `Đã có lỗi xảy ra trong quá trình đăng nhập Google. Code: ${error.code || "No code"}`, variant: "error" });
      }
    } finally { setLoading(false); }
  };

  return (
    <View className="flex-1 bg-primary-900">
      {/* Tuyệt đối ghim ảnh nền chết phía dưới, tách biệt khỏi ScrollView để chống chập chờn/vỡ khi xài web emulator */}
      <View style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Image 
          source={require("../../assets/login.jpg")} 
          style={{ width: "100%", height: "100%" }} 
          resizeMode="cover" 
        />
        <View className="absolute inset-0" style={{ backgroundColor: "rgba(5,100,75,0.78)" }} />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 32, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-[28px] font-extrabold text-white text-center mb-1.5" style={{ letterSpacing: -0.3 }}>
              Chào mừng trở lại! 👋
            </Text>
            <Text className="text-[15px] text-white/80 text-center">
              Đăng nhập để tìm việc nông nghiệp
            </Text>
          </View>

          {/* Form card */}
          <View
            className="bg-white rounded-[28px] p-6 mb-4"
            style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 }}
          >
            {/* Tab switcher */}
            <View className="flex-row bg-slate-100 rounded-2xl p-1 mb-6">
              {(["phone", "email"] as LoginTab[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  className={["flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-1.5", activeTab === tab ? "bg-white" : ""].join(" ")}
                  style={activeTab === tab ? { shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 } : {}}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  {tab === "phone"
                    ? <Phone size={15} color={activeTab === tab ? "#059669" : "#94a3b8"} />
                    : <Mail size={15} color={activeTab === tab ? "#059669" : "#94a3b8"} />}
                  <Text className={["text-[13px] font-semibold", activeTab === tab ? "text-primary-600" : "text-slate-400"].join(" ")}>
                    {tab === "phone" ? "Điện thoại" : "Email"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Identifier input */}
            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-slate-600 mb-1.5">
                {activeTab === "phone" ? "Số điện thoại" : "Email"}
              </Text>
              <View
                className={["flex-row items-center bg-slate-50 rounded-2xl h-[52px] px-4 border-[1.5px]", phoneFocused ? "border-primary-500 bg-primary-50" : "border-slate-200"].join(" ")}
              >
                <View className="mr-2.5">
                  {activeTab === "phone"
                    ? <Phone size={17} color={phoneFocused ? "#10b981" : "#94a3b8"} />
                    : <Mail size={17} color={phoneFocused ? "#10b981" : "#94a3b8"} />}
                </View>
                <TextInput
                  className="flex-1 text-[15px] text-slate-800 h-full"
                  placeholder={activeTab === "phone" ? "0912 345 678" : "email@example.com"}
                  placeholderTextColor="#cbd5e1"
                  value={activeTab === "phone" ? phoneNumber : email}
                  onChangeText={activeTab === "phone" ? setPhoneNumber : setEmail}
                  keyboardType={activeTab === "phone" ? "phone-pad" : "email-address"}
                  autoCapitalize="none"
                  maxLength={activeTab === "phone" ? 11 : undefined}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password input */}
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-[13px] font-semibold text-slate-600">Mật khẩu</Text>
                <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                  <Text className="text-[13px] font-semibold text-primary-600">Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>
              <View className={["flex-row items-center bg-slate-50 rounded-2xl h-[52px] px-4 border-[1.5px]", passwordFocused ? "border-primary-500 bg-primary-50" : "border-slate-200"].join(" ")}>
                <View className="mr-2.5">
                  <Lock size={17} color={passwordFocused ? "#10b981" : "#94a3b8"} />
                </View>
                <TextInput
                  className="flex-1 text-[15px] text-slate-800 h-full"
                  placeholder="••••••••"
                  placeholderTextColor="#cbd5e1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity className="p-1" onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={17} color="#94a3b8" /> : <Eye size={17} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>

            <Button onPress={handleLogin} loading={loading} fullWidth size="lg">Đăng nhập</Button>

            {/* Divider */}
            <View className="flex-row items-center gap-2 my-4">
              <View className="flex-1 h-px bg-slate-200" />
              <Text className="text-xs text-slate-400 font-medium">hoặc</Text>
              <View className="flex-1 h-px bg-slate-200" />
            </View>

            {/* Google */}
            <TouchableOpacity
              className="flex-row items-center justify-center h-[50px] rounded-2xl border-[1.5px] border-slate-300 bg-white gap-2"
              onPress={handleGoogleLogin}
              activeOpacity={0.88}
            >
              <Image source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }} style={{ width: 22, height: 22 }} />
              <Text className="text-[15px] font-semibold text-slate-700">Tiếp tục với Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center mb-4">
            <Text className="text-white/85 text-sm">Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="text-white text-sm font-extrabold">Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="items-center py-2" onPress={() => demoLogin()}>
            <Text className="text-white/80 text-[13px] font-semibold underline">
              Xem bản demo (không cần đăng nhập) →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <FeedbackModal
        visible={feedback.visible}
        title={feedback.title}
        message={feedback.message}
        variant={feedback.variant}
        onConfirm={closeFeedback}
        onClose={closeFeedback}
      />
    </View>
  );
}
