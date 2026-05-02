import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { X, MapPin, Calendar, Star, Briefcase, Mail, Phone } from "lucide-react-native";
import { Avatar } from "../ui/Avatar";
import { farmerService, FarmerPublicProfile } from "../../services/export_services";
import { handleError } from "../../utils/errorHandler";

type Props = {
  visible: boolean;
  onClose: () => void;
  farmerUserId: string;
};

export function FarmerProfileModal({ visible, onClose, farmerUserId }: Props) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<FarmerPublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && farmerUserId) {
      fetchProfile();
    }
  }, [visible, farmerUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await farmerService.getProfileByUserId(farmerUserId);
      setProfile(data);
    } catch (err) {
      handleError(err, "Không thể tải thông tin chủ nông trại.");
      setError("Không thể tải thông tin chủ nông trại.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ maxHeight: '80%' }}>
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-800">Thông tin chủ nông trại</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="p-8 items-center justify-center">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : error ? (
            <View className="p-8 items-center justify-center">
              <Text className="text-rose-500 text-center">{error}</Text>
              <TouchableOpacity onPress={fetchProfile} className="mt-4 bg-primary-50 px-4 py-2 rounded-full">
                <Text className="text-primary-600 font-medium">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : profile ? (
            <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
              {/* Top Section - Avatar & Name */}
              <View className="items-center mb-6">
                <Avatar 
                  source={profile.avatarUrl ? { uri: profile.avatarUrl } : undefined} 
                  fallback={profile.contactName?.[0] || "C"} 
                  size={80} 
                />
                <Text className="text-xl font-bold text-slate-800 mt-3">{profile.contactName}</Text>
                
                <View className="flex-row items-center mt-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <Star size={16} color="#d97706" fill="#d97706" />
                  <Text className="text-amber-700 font-bold ml-1">{profile.averageRating.toFixed(1)}</Text>
                </View>
              </View>

              {/* Stats Row */}
              <View className="flex-row justify-center gap-4 mb-6">
                <View className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 items-center min-w-[120px]">
                  <Text className="text-2xl font-bold text-primary-600">{profile.totalJobsPosted}</Text>
                  <Text className="text-xs text-slate-500 mt-1">Đã đăng</Text>
                </View>
                <View className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 items-center min-w-[120px]">
                  <Text className="text-2xl font-bold text-primary-600">{profile.totalJobsCompleted}</Text>
                  <Text className="text-xs text-slate-500 mt-1">Hoàn thành</Text>
                </View>
              </View>

              {/* Details List */}
              <View className="space-y-4 mb-6">
                <View className="flex-row items-start gap-3">
                  <MapPin size={20} color="#64748b" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-xs text-slate-400 font-medium mb-0.5">Địa chỉ</Text>
                    <Text className="text-sm text-slate-700 leading-5">{profile.address || "Chưa cập nhật"}</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <Calendar size={20} color="#64748b" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-xs text-slate-400 font-medium mb-0.5">Ngày sinh</Text>
                    <Text className="text-sm text-slate-700">{formatDate(profile.dateOfBirth)}</Text>
                  </View>
                </View>

                {profile.user?.phoneNumber && (
                  <View className="flex-row items-start gap-3">
                    <Phone size={20} color="#64748b" className="mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-xs text-slate-400 font-medium mb-0.5">Số điện thoại</Text>
                      <Text className="text-sm text-slate-700">{profile.user.phoneNumber}</Text>
                    </View>
                  </View>
                )}

                {profile.user?.email && (
                  <View className="flex-row items-start gap-3">
                    <Mail size={20} color="#64748b" className="mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-xs text-slate-400 font-medium mb-0.5">Email</Text>
                      <Text className="text-sm text-slate-700">{profile.user.email}</Text>
                    </View>
                  </View>
                )}
                
                <View className="flex-row items-start gap-3">
                  <Briefcase size={20} color="#64748b" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-xs text-slate-400 font-medium mb-0.5">Tham gia từ</Text>
                    <Text className="text-sm text-slate-700">{formatDate(profile.createdAt)}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
