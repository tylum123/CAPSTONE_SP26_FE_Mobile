/* AI CONTEXT:
 * Action: Displays the read-only view of the workers public profile and stats.
 * Modification: Refactored to reduce lines < 250, added Dispute History entry.
 * Inputs: Current user context data.
 * Outputs: Profile UI, settings navigation links.
 * Dependencies: Auth context, User service. */

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, DeviceEventEmitter, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Badge } from "../components/ui/export_ui_components";
import { CreditCard, Users, LogOut, Edit2, Phone, Wallet, Bell, FileText, ChevronRight, MapPin, Clock, ShieldAlert, X, Tractor, Package, Tag, MousePointer2, Calendar, Navigation, CheckCircle2 } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { workerProfileService, walletService, jobService, dailyReportService } from "../services/export_services";
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
  const [statsData, setStatsData] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const [p, cats, dash] = await Promise.all([
          workerProfileService.getProfile(),
          jobService.getCategories().catch(() => []),
          workerProfileService.getDashboardData().catch(() => null),
        ]);
        
        setProfile(p);
        setCategories(cats);
        setStatsData(dash);

        // Conditional fetches requiring profile/user ID
        const [w, reps] = await Promise.all([
          isAuthenticated && !user?.isDemo ? walletService.getWallet().catch(() => ({ balance: 0 })) : Promise.resolve({ balance: 8500000 }),
          isAuthenticated && !user?.isDemo && p?.id ? dailyReportService.getWorkerReports(p.id).catch(() => []) : Promise.resolve([])
        ]);

        if (w && typeof w.balance === 'number') setWalletBalance(w.balance);
        setReports(reps);
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

  const reliability = useMemo(() => {
    const completed = statsData?.completedJobs || 0;
    const cancelled = statsData?.cancelledApplications || 0;
    const resolved = completed + cancelled;
    return resolved > 0 ? Math.round((completed / resolved) * 100) : 100;
  }, [statsData]);

  const weeklyActivityData = useMemo(() => {
    const activity = [
      { day: "T2", val: 0, count: 0 }, { day: "T3", val: 0, count: 0 }, 
      { day: "T4", val: 0, count: 0 }, { day: "T5", val: 0, count: 0 }, 
      { day: "T6", val: 0, count: 0 }, { day: "T7", val: 0, count: 0 }, 
      { day: "CN", val: 0, count: 0 }
    ];
    
    if (!reports || reports.length === 0) return activity;

    const today = new Date();
    const dNum = today.getDay(); // 0 (Sun) - 6 (Sat)
    const sunday = new Date(today);
    // Find previous Monday (Mon=1 in getDay)
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dNum === 0 ? 6 : dNum - 1));
    monday.setHours(0, 0, 0, 0);

    reports.forEach(r => {
      if (!r.workDate) return;
      const d = new Date(r.workDate);
      if (d >= monday) {
        const dIdx = (d.getDay() + 6) % 7;
        activity[dIdx].count += 1;
      }
    });

    const maxCount = Math.max(...activity.map(a => a.count), 1);
    // Scale max height to 75% to leave room for numbers above
    return activity.map(a => ({ ...a, val: (a.count / maxCount) * 75 }));
  }, [reports]);

  const weekTotal = useMemo(() => weeklyActivityData.reduce((acc, curr) => acc + curr.count, 0), [weeklyActivityData]);

  return (
    <>
    <SafeAreaView className="flex-1 bg-emerald-600" edges={["top"]}>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* HEADER SECTION */}
        <View className="bg-emerald-600 h-[120px] relative" />

        {/* PROFILE CONTENT CONTAINER (WHITE SHEET) */}
        <View className="flex-1 bg-white -mt-10 rounded-t-[40px] px-6 pt-6">
          <View className="flex-row justify-between items-end mb-6">
             <View className="-mt-16 p-1 bg-white rounded-full">
               <Avatar 
                 source={displayProf.avatarUrl ? { uri: displayProf.avatarUrl } : undefined} 
                 fallback={displayProf.fullName?.[0] || user?.name?.[0] || "H"} 
                 size={90} 
               />
             </View>

             <TouchableOpacity 
               className="bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-100 flex-row items-center gap-2" 
               onPress={() => setShowAllSkills(true)}
             >
                <Tractor size={16} color="#059669" />
                <Text className="text-emerald-600 font-bold text-xs">Xem kỹ năng</Text>
             </TouchableOpacity>
          </View>

          {/* IDENTITY & QUICK STATS ROW */}
          <View className="flex-row justify-between mb-8">
            <View className="flex-1 pr-4">
              <Text className="text-[20px] font-black text-slate-800 mb-0.5" numberOfLines={1}>{displayProf.fullName || user?.name || "Người dùng"}</Text>
              <Text className="text-[13px] text-slate-400 font-medium" numberOfLines={1}>{user?.email || "Chưa cập nhật email"}</Text>
            </View>
            
            <View className="flex-row gap-6 items-center">
               <View className="items-center">
                 <Text className="text-[17px] font-black text-slate-800">{statsData?.acceptedApplications || 0}</Text>
                 <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ứng tuyển</Text>
               </View>
               <View className="items-center">
                 <Text className="text-[17px] font-black text-slate-800">{statsData?.completedJobs || 0}</Text>
                 <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Báo cáo</Text>
               </View>
            </View>
          </View>

          {/* 2X2 BENTO STATS GRID */}
          <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
            <View className="w-[48%] bg-slate-50/50 rounded-[28px] p-5 border border-slate-100">
               <View className="w-10 h-10 rounded-2xl bg-orange-100 items-center justify-center mb-4">
                  <Wallet size={20} color="#f97316" />
               </View>
               <Text className="text-[17px] font-black text-slate-800 mb-0.5">
                 {statsData?.totalEarnings ? statsData.totalEarnings.toLocaleString("vi-VN") + "₫" : "0₫"}
               </Text>
               <Text className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Thu nhập</Text>
            </View>

            <View className="w-[48%] bg-slate-50/50 rounded-[28px] p-5 border border-slate-100">
               <View className="w-10 h-10 rounded-2xl bg-blue-100 items-center justify-center mb-4">
                  <Tractor size={20} color="#3b82f6" />
               </View>
               <Text className="text-[18px] font-black text-slate-800 mb-0.5">
                 {displayProf.experienceLevelId ? EXPERIENCE_INFO[displayProf.experienceLevelId as number]?.label : "Mới"}
               </Text>
               <Text className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Cấp độ</Text>
            </View>

            <View className="w-[48%] bg-slate-50/50 rounded-[28px] p-5 border border-slate-100">
               <View className="w-10 h-10 rounded-2xl bg-pink-100 items-center justify-center mb-4">
                  <MapPin size={20} color="#ec4899" />
               </View>
               <Text className="text-[15px] font-black text-slate-800 mb-0.5" numberOfLines={1}>
                 {displayProf.primaryLocation ? parseLocation(displayProf.primaryLocation).provinceName : "Tự do"}
               </Text>
               <Text className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Vùng làm</Text>
            </View>

            <View className="w-[48%] bg-slate-50/50 rounded-[28px] p-5 border border-slate-100">
               <View className="w-10 h-10 rounded-2xl bg-emerald-100 items-center justify-center mb-4">
                  <CheckCircle2 size={20} color="#10b981" />
               </View>
               <Text className="text-[18px] font-black text-slate-800 mb-0.5">{reliability}%</Text>
               <Text className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Tin cậy</Text>
            </View>
          </View>

          {/* CHI TIẾT HỒ SƠ (PERSONAL INFO - HYBRID GRID) */}
          <View className="mb-8">
            <Text className="text-[16px] font-black text-slate-800 mb-4">Chi tiết hồ sơ</Text>
            <View className="bg-slate-50/50 border border-slate-100 rounded-[32px] p-6">
              {/* PINNED ADDRESS ROW */}
              <View className="flex-row items-center gap-4 mb-6 border-b border-slate-100 pb-5">
                <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center shadow-sm">
                  <MapPin size={18} color="#ec4899" />
                </View>
                <View className="flex-1">
                  <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5">Địa chỉ hiện tại</Text>
                  <Text className="text-[13px] font-black text-slate-800 leading-tight" numberOfLines={2}>
                    {displayProf.primaryLocation || "Chưa cập nhật địa chỉ"}
                  </Text>
                </View>
              </View>

              {/* GRID INFORMATION */}
              <View className="flex-row flex-wrap justify-between gap-y-6">
                {[
                  { label: "Giới tính", value: displayProf.gender === "Male" ? "Nam" : displayProf.gender === "Female" ? "Nữ" : displayProf.gender || "—", icon: Users, color: "#6366f1" },
                  { 
                    label: "Ngày sinh", 
                    value: displayProf.date_of_birth?.includes("/") 
                      ? displayProf.date_of_birth 
                      : (displayProf.date_of_birth && !isNaN(new Date(displayProf.date_of_birth).getTime()) 
                          ? new Date(displayProf.date_of_birth).toLocaleDateString("vi-VN") 
                          : "—"), 
                    icon: Calendar, 
                    color: "#f43f5e" 
                  },
                  { label: "Số điện thoại", value: displayProf.phoneNumber || "—", icon: Phone, color: "#059669" },
                  { label: "Phạm vi", value: `${displayProf.travelRadiusKmPreference || 20} km`, icon: Navigation, color: "#f59e0b" },
                  { label: "Lịch làm việc", value: fmtSched(displayProf.availabilitySchedule), icon: Clock, color: "#10b981", full: true },
                ].map((info, idx) => (
                  <View key={idx} className={`${info.full ? "w-full border-t border-slate-100 pt-5 mt-1" : "w-[47%]"} flex-row items-center gap-3`}>
                    <View className="w-9 h-9 rounded-xl bg-white items-center justify-center shadow-sm">
                      <info.icon size={16} color={info.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-0.5" numberOfLines={1}>{info.label}</Text>
                      <Text className="text-[13px] font-black text-slate-800 leading-tight" numberOfLines={info.full ? 2 : 1}>{info.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* WEEKLY ACTIVITY BAR CHART */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-[16px] font-black text-slate-800">Hiệu suất báo cáo ngày</Text>
              <View className="bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                 <Text className="text-emerald-600 font-bold text-[10px]">Tuần này: {weekTotal} báo cáo</Text>
              </View>
            </View>
            
            <View className="bg-slate-50/50 border border-slate-100 rounded-[32px] p-6 pb-4">
               <View className="flex-row items-end justify-between h-[130px] mb-2">
                  {weeklyActivityData.map((d, i) => {
                    const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
                    const isToday = i === todayIdx;
                    return (
                      <View key={i} className="items-center">
                         {/* Numerical Data Point */}
                         {d.count > 0 && (
                           <Text 
                             className={`text-[10px] font-black mb-1.5 ${isToday ? "text-emerald-600" : "text-slate-400"}`}
                           >
                             {d.count}
                           </Text>
                         )}
                         <View 
                           style={{ height: `${d.val || 4}%` }} 
                           className={`w-[32px] rounded-2xl ${isToday ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-emerald-200/40"}`} 
                         />
                         <Text className={`text-[10px] font-bold mt-3 ${isToday ? "text-emerald-600 font-black" : "text-slate-400"}`}>{d.day}</Text>
                      </View>
                    );
                  })}
               </View>
            </View>
          </View>

          {/* SETTINGS MENU LIST */}
          <View className="mb-8">
            <Text className="text-[16px] font-black text-slate-800 mb-4">Cài đặt & Tiện ích</Text>
            <View className="bg-slate-50/50 border border-slate-100 rounded-[32px] overflow-hidden">
               {[
                 { icon: Bell, label: "Thông báo", sub: "Hoạt động & Hệ thống", color: "#f59e0b", onPress: () => navigation.navigate("Notifications") },
                 { icon: Edit2, label: "Chỉnh sửa hồ sơ", sub: "Cập nhật thông tin cá nhân", color: "#3b82f6", onPress: () => navigation.navigate("EditProfile", { currentProfile: displayProf }) },
                 { icon: FileText, label: "Lịch sử báo cáo", sub: "Theo dõi công việc", color: "#64748b", onPress: () => navigation.navigate("Jobs") },
                 { icon: ShieldAlert, label: "Trung tâm hỗ trợ", sub: "Khiếu nại & Trợ giúp", color: "#f43f5e", onPress: () => navigation.navigate("DisputeHistory") },
                 { icon: CreditCard, label: "Ví của tôi", sub: "Quản lý thu nhập", color: "#059669", onPress: () => navigation.navigate("WorkerWallet") },
               ].map((item, idx) => (
                 <TouchableOpacity 
                   key={idx} 
                   className={`flex-row items-center justify-between p-5 ${idx !== 4 ? "border-b border-slate-100" : ""}`}
                   onPress={item.onPress}
                 >
                   <View className="flex-row items-center gap-4">
                      <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center shadow-sm">
                        <item.icon size={18} color={item.color} />
                      </View>
                      <View>
                        <Text className="text-[14px] font-black text-slate-800">{item.label}</Text>
                        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.sub}</Text>
                      </View>
                   </View>
                   <ChevronRight size={16} color="#cbd5e1" />
                 </TouchableOpacity>
               ))}
            </View>
          </View>

          <TouchableOpacity 
            className="flex-row items-center justify-center gap-2 bg-rose-50 rounded-[28px] p-5 border border-rose-500/10 mb-10" 
            onPress={() => setShowLogoutModal(true)}
          >
            <LogOut size={18} color="#f43f5e" />
            <Text className="text-[15px] font-bold text-rose-500">Đăng xuất hệ thống</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </SafeAreaView>

    <FeedbackModal 
      visible={showLogoutModal} 
      title="Đăng xuất" 
      message="Bạn có chắc chắn muốn thoát khỏi hệ thống?" 
      variant="info" 
      confirmLabel="Đăng xuất" 
      cancelLabel="Hủy" 
      onClose={() => setShowLogoutModal(false)} 
      onConfirm={() => { setShowLogoutModal(false); logout().catch(() => undefined); }} 
    />

    <Modal visible={showAllSkills} animationType="slide" transparent={true} onRequestClose={() => setShowAllSkills(false)}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="absolute inset-0" onPress={() => setShowAllSkills(false)} />
        <View className="bg-white rounded-t-[32px] h-[70%] shadow-xl">
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <View>
              <Text className="text-[20px] font-black text-slate-900">Kỹ năng của bạn</Text>
              <Text className="text-[13px] text-slate-500 font-medium">{displayProf.skills?.length || 0} kỹ năng chuyên môn</Text>
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
                    </View>
                    <View className="flex-row flex-wrap gap-2.5">
                      {skills.map((s, idx) => (
                        <Badge key={idx} variant={catData.variant} className="rounded-xl">{s.name}</Badge>
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
