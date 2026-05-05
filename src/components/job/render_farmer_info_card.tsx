/* AI CONTEXT:
 * Action: Renders the farmer profile card within job details.
 * Inputs: Job detail data (farmer info), auth status, user demo state.
 * Outputs: UI block showing farmer avatar, rating, and chat button.
 * Dependencies: Avatar component, Lucide icons. */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Star, MessageCircle } from "lucide-react-native";
import { Avatar } from "../ui/Avatar";
import { FarmerProfileModal } from "./FarmerProfileModal";

type Props = {
  jobDetail: any;
  isAuthenticated: boolean;
  user: any;
  lastMessage?: any;
  onChatPress: () => void;
};

export function RenderFarmerInfoCard({ jobDetail, isAuthenticated, user, lastMessage, onChatPress }: Props) {
  const [profileModalVisible, setProfileModalVisible] = React.useState(false);

  if (!jobDetail?.farmer) return null;
  const isDemo = (!isAuthenticated || user?.isDemo);

  // Initialize with values from jobDetail (already enriched from reports in hook)
  let farmerName = jobDetail.farmer.name || "Chủ nông trại";
  let farmerAvatar = jobDetail.farmer.avatar;

  // Further enrich farmer info from last message if applicable
  // Note: lastMessage sender/receiver IDs are User table IDs, so match with farmer.userId
  if (lastMessage && jobDetail.farmer.userId) {
    const farmerUserId = jobDetail.farmer.userId.toLowerCase();
    const senderId = lastMessage.senderId?.toLowerCase();
    const receiverId = lastMessage.receiverId?.toLowerCase();

    if (senderId === farmerUserId || receiverId === farmerUserId) {
      const partnerData = senderId === farmerUserId ? lastMessage.sender : lastMessage.receiver;
      if (partnerData) {
        if (partnerData.name) farmerName = partnerData.name;
        if (partnerData.avatarUrl) farmerAvatar = partnerData.avatarUrl;
      }
    }
  }
  const farmerUserIdForModal = jobDetail.farmerUserId || jobDetail.farmer.userId;

  return (
    <>
      <View className="bg-white rounded-[20px] flex-row items-center p-4 mb-4 gap-4 border border-slate-100" style={isDemo ? { shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } : undefined}>
        <TouchableOpacity onPress={() => farmerUserIdForModal && setProfileModalVisible(true)} activeOpacity={0.7}>
          {farmerAvatar ? (
            <Avatar source={{ uri: farmerAvatar }} size={50} />
          ) : (
            <Avatar fallback={farmerName[0] || "C"} size={50} />
          )}
        </TouchableOpacity>
        
        <View className="flex-1">
        <Text className="text-[15px] font-bold text-slate-800 mb-1">{farmerName}</Text>
        <View className="flex-row items-center flex-wrap">
          <View className="flex-row items-center gap-1 mr-2">
            <Star size={13} color="#fbbf24" fill="#fbbf24" />
            <Text className="text-[13px] font-bold text-slate-700">{jobDetail.farmer.rating || "0"}</Text>
          </View>
          
          <Text className="text-[12px] text-slate-400 mr-2">|</Text>
          
          <Text className="text-[10px] text-slate-500 mr-2">Đã đăng: <Text className="font-semibold text-slate-700">{jobDetail.farmer.totalJobsPosted || 0}</Text></Text>
          
          <Text className="text-[10px] text-slate-400 mr-2">•</Text>
          
          <Text className="text-[10px] text-slate-500">Hoàn thành: <Text className="font-semibold text-slate-700">{jobDetail.farmer.totalJobsCompleted || 0}</Text></Text>
        </View>
      </View>
      <TouchableOpacity 
        className="flex-row items-center bg-primary-50 border border-primary-200 px-4 py-2 rounded-full gap-2" 
        onPress={onChatPress}
      >
        <MessageCircle size={16} color="#059669" />
      </TouchableOpacity>
    </View>
    
    {farmerUserIdForModal && (
      <FarmerProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        farmerUserId={farmerUserIdForModal}
      />
    )}
    </>
  );
}
