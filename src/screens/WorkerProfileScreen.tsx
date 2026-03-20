import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../components/ui/Avatar";
import { Card, CardContent } from "../components/ui/Card";
import { ListItem } from "../components/ui/ListItem";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Heart, CreditCard, Users, Settings, LogOut, Edit2, Phone, Mail, Wallet, Briefcase, Star, Bell, FileText, ChevronRight, MapPin } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { workerProfileService } from "../services";
import { WorkerProfileDTO } from "../types/worker";
import { FeedbackModal } from "../components/ui/FeedbackModal";

export function WorkerProfileScreen({ navigation }: any) {
  const { user, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<WorkerProfileDTO | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const demoProfile: WorkerProfileDTO = {
    id: "demo", userId: "demo", fullName: "Demo", age: "35-44", ageRange: "35-44", primaryLocation: "Thốt Nốt, Cần Thơ",
    travelRadiusKmPreference: 15, experienceLevelId: 2, experienceLevel: "Có kinh nghiệm",
    averageRating: 4.9, availabilitySchedule: "Thứ 2 - Thứ 7 (Sáng)", totalJobsCompleted: 45,
    avatarUrl: "", createdAt: "", updatedAt: "",
  };

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) { setProfile(demoProfile); return; }
    (async () => {
      try { setProfile(await workerProfileService.getProfile()); }
      catch { setProfile(null); }
    })().catch(() => undefined);
  }, [isAuthenticated, user?.isDemo]);

  const displayProfile = useMemo(() => {
    if (!isAuthenticated || user?.isDemo) return demoProfile;
    if (profile) return profile;
    return { ...demoProfile, fullName: user?.name || "", primaryLocation: "", experienceLevel: "", availabilitySchedule: "", averageRating: 0, totalJobsCompleted: 0, travelRadiusKmPreference: null };
  }, [profile, isAuthenticated, user?.isDemo, user?.name]);

  const handleLogout = () => {
    // Dùng FeedbackModal thay cho Alert.alert() vì Alert không hoạt động ổn định trên Web
    setShowLogoutModal(true);
  };
  const handleEditProfile = () => {
    navigation.navigate("EditProfile", { currentProfile: { fullName: displayProfile.fullName || user?.name || "", ageRange: displayProfile.ageRange || "", primaryLocation: displayProfile.primaryLocation || "", travelRadiusKmPreference: displayProfile.travelRadiusKmPreference, experienceLevelId: displayProfile.experienceLevelId || 1, availabilitySchedule: displayProfile.availabilitySchedule || "", avatarUrl: displayProfile.avatarUrl || "" }, onUpdated: (up: WorkerProfileDTO) => setProfile(up) });
  };

  const fmtVal = (v?: string | number | null) => v === null || v === undefined || v === "" ? "Chưa cập nhật" : String(v);

  const menuItems = [
    { icon: Bell,      label: "Thông báo",         onPress: () => navigation.navigate("Notifications"), color: "#f59e0b" },
    { icon: Heart,     label: "Việc đã lưu",        onPress: () => {},                                  color: "#f43f5e" },
    { icon: FileText,  label: "Lịch sử ứng tuyển",  onPress: () => navigation.navigate("Jobs"),         color: "#2563eb" },
    { icon: CreditCard,label: "Ví & Thanh toán",    onPress: () => navigation.navigate("Wallet"),       color: "#059669" },
    { icon: Users,     label: "Giới thiệu bạn bè",  onPress: () => {},                                  color: "#0d9488" },
    { icon: Settings,  label: "Cài đặt",            onPress: () => {},                                  color: "#64748b" },
  ];

  const details = [
    { label: "Tuổi",       value: fmtVal(displayProfile.age || displayProfile.ageRange) },
    { label: "Khu vực",       value: fmtVal(displayProfile.primaryLocation) },
    { label: "Kinh nghiệm",   value: fmtVal(displayProfile.experienceLevel) },
    { label: "Lịch làm việc", value: fmtVal(displayProfile.availabilitySchedule) },
    { label: "Bán kính đi lại", value: displayProfile.travelRadiusKmPreference != null ? `${displayProfile.travelRadiusKmPreference} km` : "Chưa cập nhật" },
  ];

  return (
    <>
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View className="bg-primary-600 pb-10 pt-6 px-4 rounded-b-[28px] overflow-hidden relative" style={{ shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
          <View className="absolute w-[180px] h-[180px] rounded-full top-[-70px] right-[-50px]" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
          <View className="absolute w-[100px] h-[100px] rounded-full bottom-[-30px] left-[-20px]" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />

          <View className="items-center">
            <View className="relative mb-4">
              <View className="p-[3px] rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
                <Avatar source={displayProfile.avatarUrl ? { uri: displayProfile.avatarUrl } : undefined} fallback={displayProfile.fullName?.[0] || user?.name?.[0] || "H"} size={80} />
              </View>
              <TouchableOpacity className="absolute bottom-0 right-[-4px] w-8 h-8 rounded-full bg-primary-500 border-2 border-white justify-center items-center" onPress={handleEditProfile}>
                <Edit2 size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text className="text-[22px] font-extrabold text-white mb-1" style={{ letterSpacing: -0.3 }}>{displayProfile.fullName || user?.name || "Mai Thị Hạnh"}</Text>
            <Text className="text-[13px] text-primary-200 font-medium mb-2">Người lao động nông nghiệp</Text>
            <View className="flex-row items-center gap-1 rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <MapPin size={13} color="#a7f3d0" />
              <Text className="text-white text-xs font-medium">{displayProfile.primaryLocation || "Chưa cập nhật vị trí"}</Text>
            </View>
          </View>
        </View>

        {/* STATS */}
        <View className="flex-row bg-white mx-4 -mt-4 rounded-[20px] py-4 mb-4" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
          {[
            { label: "Ví tiền",  value: isAuthenticated && !user?.isDemo ? "--" : "8.5M", Icon: Wallet,   bg: "#d1fae5", color: "#059669" },
            { label: "Việc làm", value: String(displayProfile.totalJobsCompleted), Icon: Briefcase, bg: "#dbeafe", color: "#2563eb" },
            { label: "Đánh giá", value: String(displayProfile.averageRating), Icon: Star,     bg: "#fef3c7", color: "#f59e0b" },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View className="flex-1 items-center gap-1.5">
                <View className="w-[46px] h-[46px] rounded-full justify-center items-center mb-0.5" style={{ backgroundColor: s.bg }}>
                  <s.Icon size={22} color={s.color} />
                </View>
                <Text className="text-lg font-extrabold text-slate-800">{s.value}</Text>
                <Text className="text-[11px] text-slate-500 font-medium">{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View className="w-px h-[50px] bg-slate-100 self-center" />}
            </React.Fragment>
          ))}
        </View>

        {/* CONTACT */}
        <View className="flex-row gap-2 px-4 mb-4 flex-wrap">
          {[
            { Icon: Phone, text: displayProfile.phoneNumber || (isAuthenticated && !user?.isDemo ? "Chưa cập nhật" : "0123 456 789") }, 
            { Icon: Mail, text: displayProfile.email || user?.email || "Chưa cập nhật" }
          ].map(({ Icon, text }, i) => (
            <View key={i} className="flex-row items-center gap-1.5 bg-primary-50 border border-primary-200 rounded-full px-3 py-2 flex-1">
              <Icon size={14} color="#059669" />
              <Text className="text-xs text-primary-700 font-semibold flex-1" numberOfLines={1}>{text}</Text>
            </View>
          ))}
        </View>

        {/* DETAILS */}
        <View className="px-4 mb-4">
          <SectionHeader title="Thông tin chi tiết" />
          <Card variant="default">
            <CardContent style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              {details.map((d) => (
                <View key={d.label} style={{ width: "47%" }}>
                  <Text className="text-[11px] text-slate-400 font-semibold mb-0.5 uppercase" style={{ letterSpacing: 0.5 }}>{d.label}</Text>
                  <Text className="text-sm text-slate-800 font-semibold">{d.value}</Text>
                </View>
              ))}
            </CardContent>
          </Card>
        </View>

        {/* MENU */}
        <View className="px-4 mb-4">
          <SectionHeader title="Tiện ích" />
          <Card variant="elevated">
            <CardContent style={{ padding: 0 }}>
              {menuItems.map((item, i) => (
                <ListItem
                  key={i}
                  title={item.label}
                  leftSlot={<View className="w-10 h-10 rounded-xl justify-center items-center" style={{ backgroundColor: `${item.color}18` }}><item.icon size={20} color={item.color} /></View>}
                  rightSlot={<ChevronRight size={18} color="#cbd5e1" />}
                  onPress={item.onPress}
                  style={i < menuItems.length - 1 ? { borderBottomWidth: 1, borderBottomColor: "#f8fafc" } : undefined}
                />
              ))}
            </CardContent>
          </Card>
        </View>

        {/* LOGOUT */}
        <View className="px-4 mb-4">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-rose-50 rounded-[20px] p-4 border border-rose-500/20"
            onPress={handleLogout} activeOpacity={0.85}
          >
            <LogOut size={18} color="#f43f5e" />
            <Text className="text-[15px] font-bold text-rose-500">Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>

    {/* Logout Confirmation Modal */}
    <FeedbackModal
      visible={showLogoutModal}
      title="Đăng xuất"
      message="Bạn có chắc chắn muốn đăng xuất?"
      variant="info"
      confirmLabel="Đăng xuất"
      cancelLabel="Hủy"
      onClose={() => setShowLogoutModal(false)}
      onConfirm={() => { setShowLogoutModal(false); logout().catch(() => undefined); }}
    />
  </>);
}
