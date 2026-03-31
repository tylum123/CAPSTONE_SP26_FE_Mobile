/* AI CONTEXT:
 * Action: Handles new account creation and registration flow.
 * Inputs: New user credentials and personal identifiers.
 * Outputs: Registration API call, navigation to Onboarding.
 * Dependencies: Auth service, Navigation routing. */

import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ImageBackground, Image,
} from "react-native";
import { Phone, Lock, Eye, EyeOff, Mail, MapPin } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { CONFIG } from "../config/export_configurations";
import { FeedbackModal } from "../components/ui/FeedbackModal";

WebBrowser.maybeCompleteAuthSession();
const EXPO_GO_REDIRECT_URI = "https://auth.expo.io/@tylum123/CAPSTONE_SP26_FE_Mobile";

export function RegisterScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber]       = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]               = useState(false);
  const [focusedField, setFocusedField]     = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });
  const { register, loginWithGoogle } = useAuth();
  const isExpoGo = Constants.appOwnership === "expo" || Constants.executionEnvironment === "storeClient";

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const [googleRequest, googleResponse, promptGoogleAuth] = Google.useIdTokenAuthRequest({
    webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID || undefined,
    androidClientId: CONFIG.GOOGLE_ANDROID_CLIENT_ID || undefined,
    redirectUri: isExpoGo ? EXPO_GO_REDIRECT_URI : makeRedirectUri({ scheme: "agrotemp" }),
    selectAccount: true,
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    const doGoogleLogin = async () => {
      if (!googleResponse) return;
      if (googleResponse.type === "error") { showFeedback({ title: "Google Signup lỗi", message: String((googleResponse.params as any)?.error_description ?? "OAuth failed"), variant: "error" }); return; }
      if (googleResponse.type !== "success") return;
      const idToken = googleResponse.params?.id_token;
      if (!idToken) { showFeedback({ title: "Lỗi Google", message: "Không lấy được Google ID token.", variant: "error" }); return; }
      setLoading(true);
      try { await loginWithGoogle(idToken, 3); }
      catch (error: any) { 
        if (error?.message === "UNAUTHORIZED_ROLE") {
          showFeedback({ title: "Không thể đăng nhập", message: "Email này đã được đăng ký cho hệ thống khác. Vui lòng sử dụng tài khoản dành riêng cho Người lao động (Worker).", variant: "error" });
        } else {
          showFeedback({ title: "Lỗi Đăng ký", message: "Đăng ký bằng Google thất bại.", variant: "error" }); 
        }
      }
      finally { setLoading(false); }
    };
    doGoogleLogin().catch(() => undefined);
  }, [googleResponse, loginWithGoogle]);

  const handleRegister = async () => {
    if (!phoneNumber || !email || !password || !confirmPassword) { showFeedback({ title: "Thiếu thông tin", message: "Vui lòng nhập đầy đủ thông tin", variant: "error" }); return; }
    if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phoneNumber)) { showFeedback({ title: "Sai định dạng", message: "Số điện thoại không hợp lệ", variant: "error" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFeedback({ title: "Sai định dạng", message: "Email không hợp lệ", variant: "error" }); return; }
    if (password !== confirmPassword) { showFeedback({ title: "Mật khẩu không khớp", message: "Mật khẩu xác nhận không khớp", variant: "error" }); return; }
    if (password.length < 6) { showFeedback({ title: "Mật khẩu yếu", message: "Mật khẩu phải có ít nhất 6 ký tự", variant: "error" }); return; }
    setLoading(true);
    try {
      await register({ email: email.trim(), phoneNumber: phoneNumber.trim(), password, roleId: 3 });
      showFeedback({ title: "Thành công", message: "Đăng ký tài khoản thành công!", variant: "success", onConfirm: () => navigation.navigate("Login") });
    } catch { showFeedback({ title: "Thất bại", message: "Đăng ký thất bại. Vui lòng thử lại.", variant: "error" }); }
    finally { setLoading(false); }
  };

  const fields = [
    { key: "phone", label: "Số điện thoại", placeholder: "0912 345 678", Icon: Phone, value: phoneNumber, onChangeText: setPhoneNumber, keyboardType: "phone-pad" as const, maxLength: 11 },
    { key: "email", label: "Email", placeholder: "email@example.com", Icon: Mail, value: email, onChangeText: setEmail, keyboardType: "email-address" as const, autoCapitalize: "none" as const },
    { key: "password", label: "Mật khẩu", placeholder: "Tối thiểu 6 ký tự", Icon: Lock, value: password, onChangeText: setPassword, secureTextEntry: !showPassword, showToggle: true, toggleState: showPassword, onToggle: () => setShowPassword(p => !p) },
    { key: "confirm", label: "Xác nhận mật khẩu", placeholder: "Nhập lại mật khẩu", Icon: Lock, value: confirmPassword, onChangeText: setConfirmPassword, secureTextEntry: !showConfirmPassword, showToggle: true, toggleState: showConfirmPassword, onToggle: () => setShowConfirmPassword(p => !p) },
  ];

  return (
    <View className="flex-1 bg-primary-900">
      <View style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Image 
          source={require("../../assets/register.jpg")} 
          style={{ width: "100%", height: "100%" }} 
          resizeMode="cover" 
        />
        <View className="absolute inset-0" style={{ backgroundColor: "rgba(5,100,75,0.78)" }} />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 32, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}
        >
          <View className="items-center mb-8 mt-6">
            <Text className="text-[26px] font-extrabold text-white text-center mb-1.5" style={{ letterSpacing: -0.3 }}>Tạo tài khoản 🌱</Text>
            <Text className="text-[15px] text-white/80 text-center">Bắt đầu hành trình tìm việc nông nghiệp</Text>
          </View>

          <View className="bg-white rounded-[28px] p-6 mb-4" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 }}>
            {fields.map((field) => {
              const isFocused = focusedField === field.key;
              return (
                <View key={field.key} className="mb-4">
                  <Text className="text-[13px] font-semibold text-slate-600 mb-1.5">{field.label}</Text>
                  <View className={["flex-row items-center bg-slate-50 rounded-2xl h-[50px] px-4 border-[1.5px]", isFocused ? "border-primary-500 bg-primary-50" : "border-slate-200"].join(" ")}>
                    <View className="mr-2.5">
                      <field.Icon size={17} color={isFocused ? "#059669" : "#94a3b8"} />
                    </View>
                    <TextInput
                      className="flex-1 text-[15px] text-slate-800 h-full"
                      placeholder={field.placeholder} placeholderTextColor="#cbd5e1"
                      value={field.value} onChangeText={field.onChangeText}
                      keyboardType={(field as any).keyboardType}
                      autoCapitalize={(field as any).autoCapitalize || "sentences"}
                      maxLength={(field as any).maxLength}
                      secureTextEntry={(field as any).secureTextEntry ?? false}
                      onFocus={() => setFocusedField(field.key)}
                      onBlur={() => setFocusedField(null)}
                      returnKeyType="next"
                    />
                    {(field as any).showToggle && (
                      <TouchableOpacity className="p-1" onPress={(field as any).onToggle}>
                        {(field as any).toggleState ? <EyeOff size={17} color="#94a3b8" /> : <Eye size={17} color="#94a3b8" />}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            <Button onPress={handleRegister} loading={loading} fullWidth size="lg">Tạo tài khoản</Button>

            <View className="flex-row items-center gap-2 my-4">
              <View className="flex-1 h-px bg-slate-200" />
              <Text className="text-xs text-slate-400 font-medium">hoặc</Text>
              <View className="flex-1 h-px bg-slate-200" />
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center h-[50px] rounded-2xl border-[1.5px] border-slate-300 bg-white gap-2"
              onPress={() => promptGoogleAuth()} activeOpacity={0.88}
            >
              <Image source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" }} style={{ width: 20, height: 20 }} />
              <Text className="text-[15px] font-semibold text-slate-700">Đăng ký với Google</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center">
            <Text className="text-white/85 text-sm">Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text className="text-white text-sm font-extrabold">Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
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
