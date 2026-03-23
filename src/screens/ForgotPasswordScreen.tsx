import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react-native";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { Button } from "../components/ui/Button";

export function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const handleSendResetLink = async () => {
    if (!email) { showFeedback({ title: "Thiếu thông tin", message: "Vui lòng nhập địa chỉ email", variant: "error" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFeedback({ title: "Sai định dạng", message: "Địa chỉ email không hợp lệ", variant: "error" }); return; }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setTimeout(() => navigation.goBack(), 3000);
    } catch { showFeedback({ title: "Thất bại", message: "Không thể gửi email. Vui lòng thử lại.", variant: "error" }); }
    finally { setIsLoading(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-600">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-white/10">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/15 items-center justify-center"
          onPress={() => navigation.goBack()} activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-white">Quên mật khẩu</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {!isSuccess ? (
            <>
              <View className="items-center mb-20 mt-10">
                <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-6">
                  <Mail size={32} color="#059669" />
                </View>
                <Text className="text-[28px] font-bold text-white mb-2 text-center">Đặt lại mật khẩu</Text>
                <Text className="text-base text-white/90 text-center leading-6 px-4">
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu
                </Text>
              </View>
              <View className="mb-8">
                <View className="flex-row items-center bg-white rounded-2xl px-4 mb-4 h-14">
                  <View className="mr-2">
                    <Mail size={20} color="#6b7280" />
                  </View>
                  <TextInput
                    className="flex-1 text-base text-slate-900"
                    placeholder="Email của bạn" placeholderTextColor="#9ca3af"
                    value={email} onChangeText={setEmail}
                    keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>
              <TouchableOpacity
                className={["bg-white rounded-2xl items-center justify-center h-14", isLoading ? "opacity-60" : ""].join(" ")}
                onPress={handleSendResetLink} disabled={isLoading} activeOpacity={0.8}
              >
                <Text className="text-primary-600 text-lg font-bold">{isLoading ? "Đang gửi..." : "Gửi liên kết"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-[120px] h-[120px] rounded-full bg-white items-center justify-center mb-8">
                <CheckCircle size={64} color="#10b981" />
              </View>
              <Text className="text-[28px] font-bold text-white mb-4 text-center">Email đã được gửi!</Text>
              <Text className="text-base text-white/90 text-center leading-6 px-4 mb-6">
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu
              </Text>
              <Text className="text-sm text-white font-semibold px-6 py-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                {email}
              </Text>
            </View>
          )}
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
    </SafeAreaView>
  );
}
