/* AI CONTEXT:
 * Action: Handles account verification via OTP after registration.
 * Inputs: User email (route param), OTP 6-digit code.
 * Outputs: verifyEmail API call, navigation to Login.
 * Dependencies: Auth service, Navigation routing. */

import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ShieldCheck, Lock, CheckCircle } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { authService } from "../services/export_services";
import { getErrorMessage } from "../utils/error_handling";
import { handleError, handleSuccess } from "../utils/errorHandler";

export function VerifyEmailScreen({ route, navigation }: any) {
  const { email } = route.params || {};
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  // const timerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer]);

  const handleVerify = async () => {
    if (!otp || otp.length < 4) { handleError(null, "Vui lòng nhập mã OTP hợp lệ"); return; }
    setIsLoading(true);
    try {
      await authService.verifyEmail(email, otp);
      setIsSuccess(true);
    } catch (error) { 
      const msg = getErrorMessage(error, "Xác thực thất bại. Vui lòng kiểm tra lại mã OTP.");
      handleError(null, msg); 
    }
    finally { setIsLoading(false); }
  };

  const handleResend = async () => {
    if (timer > 0 || isLoading) return;
    setIsLoading(true);
    try {
      await authService.resendVerification(email);
      setTimer(60);
      handleSuccess("Mã xác thực mới đã được gửi đến email của bạn.");
    } catch (error) { 
      const msg = getErrorMessage(error, "Không thể gửi lại mã. Vui lòng thử lại sau.");
      handleError(null, msg); 
    }
    finally { setIsLoading(false); }
  };

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-primary-600">
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-24 h-24 rounded-full bg-white items-center justify-center mb-8 shadow-lg">
            <CheckCircle size={56} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-white mb-4 text-center">Xác thực thành công!</Text>
          <Text className="text-white/90 text-center px-6 mb-10 leading-6">Tài khoản của bạn đã được kích hoạt. Bây giờ bạn có thể đăng nhập vào ứng dụng.</Text>
          <Button onPress={() => navigation.navigate("Login")} fullWidth variant="ghost" size="lg">Đăng nhập ngay</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-900">
       <View style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Image 
          source={require("../../assets/register.jpg")} 
          style={{ width: "100%", height: "100%" }} 
          resizeMode="cover" 
        />
        <View className="absolute inset-0" style={{ backgroundColor: "rgba(5,100,75,0.85)" }} />
      </View>

      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center" onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white">Xác thực tài khoản</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="items-center mb-10 mt-4">
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-6 border border-white/30">
              <ShieldCheck size={40} color="#ffffff" />
            </View>
            <Text className="text-2xl font-bold text-white mb-2 text-center">Nhập mã OTP</Text>
            <Text className="text-white/80 text-center px-2 leading-6">
              Chúng tôi vừa gửi mã xác thực đến:{"\n"}
              <Text className="font-extrabold text-white">{email}</Text>
            </Text>
          </View>

          <View className="bg-white p-6 rounded-[28px] mb-8 shadow-xl">
            <View className="mb-6">
              <Text className="text-[13px] font-semibold text-slate-500 mb-2 ml-1">MÃ XÁC THỰC</Text>
              <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 h-14 border border-slate-200">
                <Lock size={18} color="#94a3b8" />
                <TextInput 
                  className="flex-1 text-lg font-bold text-slate-800 ml-4" 
                  placeholder="Nhập 6 chữ số" 
                  placeholderTextColor="#cbd5e1" 
                  value={otp} 
                  onChangeText={setOtp} 
                  keyboardType="number-pad" 
                  maxLength={6} 
                />
              </View>
            </View>

            <Button onPress={handleVerify} loading={isLoading} fullWidth size="lg">Xác thực</Button>

            <TouchableOpacity className="mt-6 items-center" onPress={handleResend} disabled={timer > 0 || isLoading}>
              <Text className={timer > 0 ? "text-slate-400 text-sm" : "text-primary-600 font-bold text-sm"}>
                {timer > 0 ? `Gửi lại mã sau ${timer}s` : "Gửi lại mã ngay"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="items-center">
            <Text className="text-white/60 text-xs text-center">
              Mã xác thực có hiệu lực trong vòng 5 phút.{"\n"}Vui lòng kiểm tra cả hòm thư rác (Spam).
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
