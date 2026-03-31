/* AI CONTEXT:
 * Action: Renders the farmer profile card within job details.
 * Inputs: Job detail data (farmer info), auth status, user demo state.
 * Outputs: UI block showing farmer avatar, rating, and chat button.
 * Dependencies: Avatar component, Lucide icons. */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Star, MessageCircle } from "lucide-react-native";
import { Avatar } from "../ui/Avatar";

type Props = {
  jobDetail: any;
  isAuthenticated: boolean;
  user: any;
  onChatPress: () => void;
};

export function RenderFarmerInfoCard({ jobDetail, isAuthenticated, user, onChatPress }: Props) {
  if (!jobDetail?.farmer) return null;
  const isDemo = (!isAuthenticated || user?.isDemo);
  
  return (
    <View className="bg-white rounded-[20px] flex-row items-center p-4 mb-4 gap-4 border border-slate-100" style={isDemo ? { shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } : undefined}>
      {isDemo && jobDetail.farmer.avatar ? (
        <Avatar source={{ uri: jobDetail.farmer.avatar }} size={50} />
      ) : (
        <Avatar fallback={jobDetail.farmer?.name?.[0] || "C"} size={50} />
      )}
      
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-slate-800 mb-1">{jobDetail.farmer.name || "Chủ nông trại"}</Text>
        {isDemo && (
          <View className="flex-row items-center gap-1">
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <Text className="text-[13px] font-bold text-slate-700">{jobDetail.farmer.rating}</Text>
            <Text className="text-[13px] text-slate-500">• {jobDetail.farmer.totalJobs} công việc</Text>
          </View>
        )}
      </View>
      <TouchableOpacity 
        className="w-[42px] h-[42px] rounded-full bg-primary-50 border border-primary-200 justify-center items-center" 
        onPress={onChatPress}
      >
        <MessageCircle size={18} color="#059669" />
      </TouchableOpacity>
    </View>
  );
}
