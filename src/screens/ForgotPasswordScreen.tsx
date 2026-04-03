/* AI CONTEXT:
 * Action: Handles password recovery flow with OTP verification.
 * Inputs: User email, OTP certificate, and new password string.
 * Outputs: Reset password API call, navigation to Login.
 * Dependencies: Auth service, Navigation routing. 
 * Rule: Maintain memory safety and 250-line limit. */

import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, CheckCircle, Lock, ShieldCheck } from "lucide-react-native";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { Button } from "../components/ui/Button";
import { authService } from "../services/export_services";

type FlowStep = "request" | "verify" | "success";

export function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<FlowStep>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer]);

  const handleSendRequest = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showFeedback({ title: "Lỗi", message: "Địa chỉ email không hợp lệ", variant: "error" });
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep("verify");
      setTimer(60);
    } catch { showFeedback({ title: "Thất bại", message: "Không thể gửi mã. Vui lòng thử lại sau.", variant: "error" }); }
    finally { setIsLoading(false); }
  };

  const handleResend = async () => {
    if (timer > 0 || isLoading) return;
    setIsLoading(true);
    try {
      await authService.resendVerification(email);
      setTimer(60);
      showFeedback({ title: "Thành công", message: "Mã xác thực mới đã được gửi!", variant: "success" });
    } catch { showFeedback({ title: "Lỗi", message: "Không thể gửi lại mã.", variant: "error" }); }
    finally { setIsLoading(false); }
  };

  const handleVerifyAndReset = async () => {
    if (!otp || otp.length < 4) return showFeedback({ title: "Lỗi", message: "Vui lòng nhập mã OTP", variant: "error" });
    if (!newPassword || newPassword.length < 6) return showFeedback({ title: "Lỗi", message: "Mật khẩu mới phải có ít nhất 6 ký tự", variant: "error" });
    setIsLoading(true);
    try {
      await authService.resetPassword({ email, otp, newPassword });
      setStep("success");
    } catch { showFeedback({ title: "Thất bại", message: "Mã OTP không đúng hoặc đã hết hạn.", variant: "error" }); }
    finally { setIsLoading(false); }
  };

  const renderRequestStep = () => (
    <>
      <View className="items-center mb-16 mt-6">
        <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-6 shadow-sm">
          <Mail size={32} color="#059669" />
        </View>
        <Text className="text-2xl font-bold text-white mb-2">Quên mật khẩu?</Text>
        <Text className="text-white/80 text-center px-4 leading-6">Nhập email để nhận mã OTP khôi phục mật khẩu</Text>
      </View>
      <View className="bg-white/10 p-4 rounded-3xl mb-8 border border-white/20">
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-14 border border-slate-200">
          <Mail size={18} color="#94a3b8" />
          <TextInput className="flex-1 text-slate-800 ml-3" placeholder="Email của bạn" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!isLoading} />
        </View>
      </View>
      <Button onPress={handleSendRequest} loading={isLoading} fullWidth size="lg">Gửi mã xác nhận</Button>
    </>
  );

  const renderVerifyStep = () => (
    <>
      <View className="items-center mb-12 mt-4">
        <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-6 shadow-sm">
          <ShieldCheck size={32} color="#059669" />
        </View>
        <Text className="text-2xl font-bold text-white mb-2">Xác thực OTP</Text>
        <Text className="text-white/80 text-center px-4 leading-6">Mã OTP đã được gửi đến:{"\n"}<Text className="font-bold text-white">{email}</Text></Text>
      </View>
      <View className="bg-white p-6 rounded-3xl mb-8 shadow-sm">
        <View className="mb-4">
          <Text className="text-xs font-bold text-slate-500 mb-2 ml-1">MÃ XÁC THỰC</Text>
          <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 h-14 border border-slate-200">
            <Lock size={18} color="#94a3b8" />
            <TextInput className="flex-1 text-lg font-bold text-slate-800 ml-4" placeholder="Nhập mã OTP" placeholderTextColor="#cbd5e1" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
          </View>
        </View>
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-500 mb-2 ml-1">MẬT KHẨU MỚI</Text>
          <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 h-14 border border-slate-200">
            <Lock size={18} color="#94a3b8" />
            <TextInput className="flex-1 text-slate-800 ml-4" placeholder="Tối thiểu 6 ký tự" placeholderTextColor="#cbd5e1" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          </View>
        </View>
        <Button onPress={handleVerifyAndReset} loading={isLoading} fullWidth size="lg">Đổi mật khẩu</Button>
        <TouchableOpacity className="mt-6 items-center" onPress={handleResend} disabled={timer > 0 || isLoading}>
          <Text className={timer > 0 ? "text-slate-400 text-sm" : "text-primary-600 font-bold text-sm"}>
            {timer > 0 ? `Gửi lại mã sau ${timer}s` : "Gửi lại mã"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-600">
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center" onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white">Khôi phục mật khẩu</Text>
        <View className="w-10" />
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {step === "request" && renderRequestStep()}
          {step === "verify" && renderVerifyStep()}
          {step === "success" && (
            <View className="flex-1 items-center justify-center py-10">
              <View className="w-24 h-24 rounded-full bg-white items-center justify-center mb-8 shadow-lg">
                <CheckCircle size={56} color="#10b981" />
              </View>
              <Text className="text-2xl font-bold text-white mb-4 text-center">Thành công!</Text>
              <Text className="text-white/90 text-center px-10 mb-10 leading-6">Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại với mật khẩu mới.</Text>
              <Button onPress={() => navigation.navigate("Login")} fullWidth variant="ghost" size="lg">Quay lại Đăng nhập</Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <FeedbackModal visible={feedback.visible} title={feedback.title} message={feedback.message} variant={feedback.variant} onConfirm={closeFeedback} onClose={closeFeedback} />
    </SafeAreaView>
  );
}
