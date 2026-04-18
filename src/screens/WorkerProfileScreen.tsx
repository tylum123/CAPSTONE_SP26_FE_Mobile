/* AI CONTEXT:
 * Action: Displays the read-only view of the workers public profile and stats.
 * Modification: Refactored to reduce lines < 250, added Dispute History entry.
 * Inputs: Current user context data.
 * Outputs: Profile UI, settings navigation links.
 * Dependencies: Auth context, User service. */

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, DeviceEventEmitter, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Card, CardContent, ListItem, SectionHeader, Badge } from "../components/ui/export_ui_components";
import { CreditCard, Users, LogOut, Edit2, Phone, Mail, Wallet, Briefcase, Star, Bell, FileText, ChevronRight, MapPin, Clock, ShieldAlert, X, Tractor, Package, Tag, MousePointer2, Calendar, Navigation } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { workerProfileService, walletService, jobService } from "../services/export_services";
import { WorkerProfileDTO } from "../types/define_worker_interfaces";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { DEMO_WORKER_PROFILE } from "../constants/demoData";
import { parseLocation } from "../utils/locationUtils";

// --- Extracted Constants & Helpers ---
const EXPERIENCE_INFO: Record<number, { label: string; sub: string }> = { 
  1: { label: "Mới đi làm", sub: "< 6 tháng" }, 2: { label: "Có kinh nghiệm", sub: "6 - 12 tháng" }, 3: { label: "Lành nghề", sub: "> 12 tháng" } 
};
const DAYS_ORDER = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const LABELS_MAP: Record<string, string> = { T2: "Thứ 2", T3: "Thứ 3", T4: "Thứ 4", T5: "Thứ 5", T6: "Thứ 6", T7: "Thứ 7", CN: "Chủ nhật" };

const CAT_COLORS: Record<string, { label: string; variant: "success" | "warning" | "info" | "secondary"; icon: any }> = {
  "1": { label: "Trồng trọt", variant: "success",   icon: Tractor },
  "2": { label: "Chăn nuôi", variant: "warning",   icon: Package },
  "3": { label: "Máy móc",   variant: "info",      icon: Tag },
  "4": { label: "Khác",      variant: "secondary", icon: MousePointer2 }
};

const fmtSched = (raw?: string | null) => {
  if (!raw?.trim()) return "Chưa cập nhật";
  const ids = raw.split(", ").map(s => s.trim()).filter(id => !!LABELS_MAP[id]);
  if (ids.length === 0) return raw;
  if (ids.length === 7) return "Cả tuần";
  const sorted = [...ids].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
  if (sorted.length > 1) {
    const idx = sorted.map(id => DAYS_ORDER.indexOf(id));
    if (idx.every((v, i) => i === 0 || v === idx[i-1] + 1)) 
      return `${LABELS_MAP[sorted[0]]} đến ${LABELS_MAP[sorted[sorted.length-1]].toLowerCase()}`;
  }
  return sorted.map(id => LABELS_MAP[id]).join(", ");
};

const fmtCur = (val: number) => val >= 1000000 ? (val / 1000000).toFixed(1) + "M" : val >= 1000 ? (val / 1000).toFixed(0) + "K" : val.toString();

export function WorkerProfileScreen({ navigation }: any) {
  const { user, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<WorkerProfileDTO | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const [p, w, cats] = await Promise.all([
          workerProfileService.getProfile(),
          isAuthenticated && !user?.isDemo ? walletService.getWallet().catch(() => ({ balance: 0 })) : Promise.resolve({ balance: 8500000 }),
          jobService.getCategories().catch(() => [])
        ]);
        setProfile(p);
        setCategories(cats);
        if (w && typeof w.balance === 'number') setWalletBalance(w.balance);
      } catch (err) { console.error("Profile error:", err); } finally { setLoading(false); }
    };
    fetchData();
    const sub = DeviceEventEmitter.addListener("REFRESH_DATA", fetchData);
    return () => sub.remove();
  }, [isAuthenticated, user?.isDemo]);

  const displayProf = useMemo(() => (!isAuthenticated || user?.isDemo) ? DEMO_WORKER_PROFILE : profile || { ...DEMO_WORKER_PROFILE, fullName: user?.name || "" }, [profile, isAuthenticated, user?.isDemo, user?.name]);

  const skillGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};
    displayProf.skills?.forEach(s => {
      let cId = String(s.categoryId || "4");
      if (cId.startsWith("cat-")) cId = cId.replace("cat-", "");
      if (!groups[cId]) groups[cId] = [];
      groups[cId].push(s);
    });
    return groups;
  }, [displayProf.skills]);

  const menuItems = [
    { icon: Bell,      label: "Thông báo",         onPress: () => navigation.navigate("Notifications"), color: "#f59e0b" },
    { icon: FileText,  label: "Lịch sử ứng tuyển",  onPress: () => navigation.navigate("Jobs"),         color: "#2563eb" },
    { icon: ShieldAlert,label: "Lịch sử khiếu nại", onPress: () => navigation.navigate("DisputeHistory"), color: "#f43f5e" },
    { icon: CreditCard,label: "Ví & Thanh toán",    onPress: () => navigation.navigate("WorkerWallet"),       color: "#059669" },
  ];

  const stats = [
    { label: "Ví tiền",  value: fmtCur(walletBalance), Icon: Wallet,   bg: "#d1fae5", color: "#059669" },
    { label: "Việc làm", value: displayProf.totalJobsCompleted || 0, Icon: Briefcase, bg: "#dbeafe", color: "#2563eb" },
    { label: "Đánh giá", value: displayProf.averageRating?.toFixed(1) || "0.0", Icon: Star, bg: "#fef3c7", color: "#f59e0b" },
  ];

  return (
    <>
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View className="bg-primary-600 pb-10 pt-6 px-4 rounded-b-[28px] overflow-hidden justify-center items-center" style={{ elevation: 8 }}>
          <View className="p-[3px] rounded-full bg-white/20 mb-4">
            <Avatar source={displayProf.avatarUrl ? { uri: displayProf.avatarUrl } : undefined} fallback={displayProf.fullName?.[0] || user?.name?.[0] || "H"} size={80} />
            <TouchableOpacity className="absolute bottom-0 right-[-4px] w-8 h-8 rounded-full bg-primary-500 border-2 border-white justify-center items-center" onPress={() => navigation.navigate("EditProfile", { currentProfile: displayProf })}>
              <Edit2 size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text className="text-[22px] font-extrabold text-white mb-1">{displayProf.fullName || user?.name || "Người dùng"}</Text>
          <View className="flex-row items-center gap-1 rounded-full px-3 py-1.5 bg-white/20">
            <MapPin size={13} color="#a7f3d0" />
            <Text className="text-white text-xs font-medium">{displayProf.primaryLocation ? parseLocation(displayProf.primaryLocation).provinceName : "Chưa cập nhật"}</Text>
          </View>
        </View>

        <View className="flex-row bg-white mx-4 -mt-4 rounded-[20px] py-4 mb-4 shadow-sm border border-slate-50">
          {stats.map((s, i) => (
            <View key={s.label} className="flex-1 items-center gap-1.5">
              <View className="w-[44px] h-[44px] rounded-full justify-center items-center" style={{ backgroundColor: s.bg }}><s.Icon size={20} color={s.color} /></View>
              <Text className="text-lg font-extrabold text-slate-800">{s.value}</Text>
              <Text className="text-[11px] text-slate-500 font-medium">{s.label}</Text>
            </View>
          ))}
        </View>

        <View className="px-4 flex-row gap-2 mb-6">
          <View className="flex-1 bg-white p-2.5 rounded-[16px] shadow-sm border border-slate-50 flex-row items-center gap-2.5">
            <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
              <Phone size={16} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Điện thoại</Text>
              <Text className="text-[12px] text-slate-800 font-black" numberOfLines={1}>
                {displayProf.phoneNumber || "N/A"}
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-white p-2.5 rounded-[16px] shadow-sm border border-slate-50 flex-row items-center gap-2.5">
            <View className="w-9 h-9 rounded-full bg-amber-50 items-center justify-center">
              <Mail size={16} color="#d97706" />
            </View>
            <View className="flex-1">
              <Text className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Email</Text>
              <Text className="text-[12px] text-slate-800 font-black" numberOfLines={1}>
                {user?.email || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-4">
          <SectionHeader title="Thông tin chi tiết" />
          <View className="px-4">
            <Card><CardContent className="flex-row flex-wrap gap-y-5 p-4">
            {[
              { l: "Khu vực",  v: displayProf.primaryLocation || "Chưa cập nhật", w: "100%", i: MapPin },
              { l: "Giới tính", v: displayProf.genderId === 1 ? "Nam" : displayProf.genderId === 2 ? "Nữ" : "Chưa cập nhật", i: Users },
              { l: "Kinh nghiệm", v: EXPERIENCE_INFO[displayProf.experienceLevelId]?.label || "Chưa cập nhật", s: EXPERIENCE_INFO[displayProf.experienceLevelId]?.sub, i: Briefcase },
              { l: "Lịch làm việc", v: fmtSched(displayProf.availabilitySchedule), i: Clock },
              { l: "Ngày sinh", v: displayProf.date_of_birth ? displayProf.date_of_birth.split("T")[0].split("-").reverse().join("/") : "Chưa cập nhật", i: Calendar },
              { l: "Bán kính đi lại", v: displayProf.travelRadiusKmPreference ? `${displayProf.travelRadiusKmPreference} km` : "Chưa cập nhật", i: Navigation }
            ].map((d: any) => (
              <View key={d.l} style={{ width: d.w || "48%" }}>
                <View className="flex-row items-center gap-1.5 mb-1">
                  <d.i size={12} color="#94a3b8" />
                  <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{d.l}</Text>
                </View>
                <Text className="text-[14px] text-slate-800 font-bold" numberOfLines={d.l === "Khu vực" ? undefined : 1}>{d.v}</Text>
                {d.s && <Text className="text-[11px] text-slate-500 mt-0.5 italic">{d.s}</Text>}
              </View>
            ))}
          </CardContent></Card>
          </View>
        </View>

        <View className="mb-4">
          <SectionHeader title="Kỹ năng" />
          <View className="px-4">
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowAllSkills(true)}>
            <Card><CardContent className="p-4">
              {displayProf.skills?.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {displayProf.skills.slice(0, 4).map((s, idx) => {
                    const skillCat = categories.find(c => c.id === s.categoryId);
                    const catName = skillCat?.name || "";
                    let variant: "success" | "warning" | "info" | "secondary" = "secondary";
                    if (catName.includes("Trồng")) variant = "success";
                    else if (catName.includes("Nuôi") || catName.includes("Chăn")) variant = "warning";
                    else if (catName.includes("Máy")) variant = "info";
                    
                    return <Badge key={idx} variant={variant}>{s.name}</Badge>;
                  })}
                  {displayProf.skills.length > 4 && (
                    <Badge variant="secondary">+{displayProf.skills.length - 4} nữa...</Badge>
                  )}
                </View>
              ) : (
                <Text className="text-sm text-slate-400 italic">Chưa cập nhật kỹ năng</Text>
              )}
            </CardContent></Card>
          </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <SectionHeader title="Tiện ích" />
          <View className="px-4">
            <Card><CardContent className="p-0">
            {menuItems.map((item, i) => (
              <ListItem key={i} title={item.label} onPress={item.onPress} rightSlot={<ChevronRight size={18} color="#cbd5e1" />} style={i < menuItems.length - 1 ? { borderBottomWidth: 1, borderBottomColor: "#f8fafc" } : undefined}
                leftSlot={<View className="w-10 h-10 rounded-xl justify-center items-center" style={{ backgroundColor: `${item.color}15` }}><item.icon size={20} color={item.color} /></View>}
              />
            ))}
          </CardContent></Card>
          </View>
        </View>

        <TouchableOpacity className="mx-4 flex-row items-center justify-center gap-2 bg-rose-50 rounded-[20px] p-4 border border-rose-500/10 mb-10" onPress={() => setShowLogoutModal(true)}>
          <LogOut size={18} color="#f43f5e" />
          <Text className="text-[15px] font-bold text-rose-500">Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>

    <FeedbackModal visible={showLogoutModal} title="Đăng xuất" message="Bạn có chắc chắn muốn đăng xuất?" variant="info" confirmLabel="Đăng xuất" cancelLabel="Hủy" 
      onClose={() => setShowLogoutModal(false)} onConfirm={() => { setShowLogoutModal(false); logout().catch(() => undefined); }} 
    />

    <Modal visible={showAllSkills} animationType="slide" transparent={true} onRequestClose={() => setShowAllSkills(false)}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="absolute inset-0" onPress={() => setShowAllSkills(false)} />
        <View className="bg-white rounded-t-[32px] h-[60%] shadow-xl">
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <View>
              <Text className="text-[20px] font-black text-slate-900">Tất cả kỹ năng</Text>
              <Text className="text-[13px] text-slate-500 font-medium">{displayProf.skills?.length || 0} kỹ năng đã chọn</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAllSkills(false)} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 px-6">
            <View className="pb-10">
              {Object.entries(skillGroups).map(([cId, skills]) => {
                const fetchedCat = categories.find(c => c.id === cId || c.id === `cat-${cId}`);
                const catName = fetchedCat?.name || "Khác";
                
                let catData = { label: catName, variant: "secondary" as any, icon: MousePointer2 };
                if (catName.includes("Trồng")) catData = { label: catName, variant: "success", icon: Tractor };
                else if (catName.includes("Nuôi") || catName.includes("Chăn")) catData = { label: catName, variant: "warning", icon: Package };
                else if (catName.includes("Máy")) catData = { label: catName, variant: "info", icon: Tag };

                const Icon = catData.icon;
                return (
                  <View key={cId} className="mt-6">
                    <View className="flex-row items-center mb-3">
                      <View className="w-8 h-8 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: catData.variant === "success" ? "#d1fae5" : catData.variant === "warning" ? "#fef3c7" : catData.variant === "info" ? "#dbeafe" : "#f1f5f9" }}>
                        <Icon size={16} color={catData.variant === "success" ? "#059669" : catData.variant === "warning" ? "#d97706" : catData.variant === "info" ? "#2563eb" : "#475569"} />
                      </View>
                      <Text className="text-[14px] font-extrabold text-slate-800 uppercase tracking-widest">{catData.label}</Text>
                      <Text className="ml-2 text-[12px] text-slate-400 font-bold">{`(${skills.length})`}</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2.5">
                      {skills.map((s, idx) => (
                        <Badge key={idx} variant={catData.variant} style={{ paddingVertical: 5, paddingHorizontal: 12 }}>{s.name}</Badge>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
    </>
  );
}
