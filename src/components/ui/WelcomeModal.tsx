/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import React from "react";
import { Modal, View, Text, Dimensions } from "react-native";
import { UserPlus, ChevronRight } from "lucide-react-native";
import { COLORS, TYPOGRAPHY } from "../../constants/theme";
import { Button } from "./Button";

Dimensions.get("window");

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  onAction: () => void;
  userName?: string;
}

export function WelcomeModal({ visible, onAction, userName }: WelcomeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white rounded-[32px] w-full overflow-hidden shadow-2xl">
          {/* Header Image/Icon Section */}
          <View className="bg-primary-600 h-32 items-center justify-center relative">
              <View className="absolute w-12 h-12 rounded-full bg-white/10 -top-6 -right-6" />
             <View className="w-20 h-20 rounded-full bg-white items-center justify-center shadow-lg">
                <UserPlus size={40} color={COLORS.primary[600]} />
             </View>
          </View>

          <View className="p-8 items-center">
            <Text style={TYPOGRAPHY.title} className="text-center text-slate-900 mb-2">
              Chào mừng, {userName || "bạn"}! 👋
            </Text>
            <Text className="text-center text-slate-600 text-[15px] leading-6 mb-8">
              Cảm ơn bạn đã tham gia ứng dụng. Để bắt đầu nhận việc ngay, hãy dành chút thời gian hoàn thiện hồ sơ của mình nhé!
            </Text>

            <View className="w-full gap-3">
              <Button 
                onPress={onAction} 
                className="h-14 rounded-2xl flex-row items-center justify-center"
              >
                <Text className="text-white font-bold text-base mr-2">Hoàn thiện hồ sơ ngay</Text>
                <ChevronRight size={18} color="white" />
              </Button>

            </View>
          </View>

          {/* Benefit Badges */}
          <View className="bg-slate-50 p-4 border-t border-slate-100 flex-row justify-around">
            <View className="items-center">
               <Text className="text-[10px] font-bold text-primary-600 uppercase tracking-tighter">Uy tín hơn</Text>
            </View>
            <View className="w-px h-4 bg-slate-200" />
            <View className="items-center">
               <Text className="text-[10px] font-bold text-primary-600 uppercase tracking-tighter">Nhận việc nhanh</Text>
            </View>
            <View className="w-px h-4 bg-slate-200" />
            <View className="items-center">
               <Text className="text-[10px] font-bold text-primary-600 uppercase tracking-tighter">Đầy đủ quyền lợi</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
