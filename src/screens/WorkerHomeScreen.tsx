import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Banknote, Star, Briefcase, TrendingUp, Bell, Search, Clock, ChevronRight, Flame } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { SectionHeader } from "../components/ui";
import { EmptyState } from "../components/ui";
import { COLORS } from "../constants/theme";
import { Job, UpcomingJob } from "../types";
import { jobService, JobPostDTO, workerProfileService } from "../services";
import { useAuth } from "../context/AuthContext";

export function WorkerHomeScreen({ navigation }: any) {
  const { user, isAuthenticated } = useAuth();
  const [nearbyJobs, setNearbyJobs]             = useState<Job[]>([]);
  const [profileRating, setProfileRating]       = useState<number | null>(null);
  const [totalJobsCompleted, setTotalJobsCompleted] = useState<number | null>(null);

  const demoNearbyJobs: Job[] = [
    { id: 1, title: "Thu hoạch lúa",      farmer: "Nguyễn Văn A", location: "Cần Thơ",   distance: "2.5 km", wage: "250,000", duration: "1 ngày",  rating: 4.8, urgent: true  },
    { id: 2, title: "Chăm sóc vườn cam",  farmer: "Trần Thị B",   location: "Vĩnh Long", distance: "5 km",   wage: "200,000", duration: "3 ngày",  rating: 4.5, urgent: false },
    { id: 3, title: "Làm đất trồng rau",  farmer: "Lê Văn C",     location: "Sóc Trăng", distance: "8 km",   wage: "300,000", duration: "2 ngày",  rating: 4.9, urgent: false },
    { id: 4, title: "Phun thuốc sâu",     farmer: "Phạm Văn D",   location: "An Giang",  distance: "12 km",  wage: "180,000", duration: "4 giờ",   rating: 4.3, urgent: false },
  ];
  const demoUpcomingJobs: UpcomingJob[] = [
    { id: 1, title: "Phun thuốc trừ sâu", farmer: "Phạm Văn D", date: "15/01/2026", time: "06:00", status: "confirmed" },
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) { setNearbyJobs(demoNearbyJobs); return; }
    (async () => {
      try {
        const jobs = await jobService.getJobPosts();
        setNearbyJobs(jobs.map((j: JobPostDTO): Job => {
          const address = j.address && j.address !== "string" ? j.address : "Chưa cập nhật";
          const contactName = j.contactName && j.contactName !== "string" ? j.contactName : "Chủ nông trại";
          return { id: j.id, title: j.title || "Chưa có tiêu đề", farmer: contactName, location: address, distance: "N/A", wage: j.wageAmount ? j.wageAmount.toLocaleString("vi-VN") : "0", duration: j.estimatedHours ? `${j.estimatedHours} giờ` : "N/A", rating: 0, urgent: j.isUrgent };
        }));
      } catch { setNearbyJobs([]); }
    })().catch(() => undefined);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) { setProfileRating(4.7); setTotalJobsCompleted(12); return; }
    (async () => {
      try { const p = await workerProfileService.getProfile(); setProfileRating(p.averageRating); setTotalJobsCompleted(p.totalJobsCompleted); }
      catch { setProfileRating(null); setTotalJobsCompleted(null); }
    })().catch(() => undefined);
  }, [isAuthenticated]);

  const upcomingJobs = useMemo(() => (isAuthenticated && !user?.isDemo ? [] : demoUpcomingJobs), [isAuthenticated, user?.isDemo]);

  const getGreeting = () => { const h = new Date().getHours(); if (h < 12) return "Chào buổi sáng"; if (h < 18) return "Chào buổi chiều"; return "Chào buổi tối"; };
  const displayName = user?.name?.split(" ").pop() || "Bạn";

  const STATS = [
    { label: "Việc đã làm", value: String(totalJobsCompleted ?? 0), Icon: Briefcase, iconColor: "#059669", bg: "#d1fae5" },
    { label: "Đánh giá",    value: String(profileRating ?? "—"),    Icon: Star,      iconColor: "#f59e0b", bg: "#fef3c7" },
    { label: "Thu nhập",    value: "—",                              Icon: TrendingUp, iconColor: "#0d9488", bg: "#ccfbf1" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      <FlatList
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        data={nearbyJobs}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            {/* HERO */}
            <View className="bg-primary-600 px-4 pt-4 pb-10 rounded-b-[28px] overflow-hidden relative mb-4">
              {/* Decorative circles */}
              <View className="absolute w-[200px] h-[200px] rounded-full top-[-70px] right-[-50px]" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
              <View className="absolute w-[130px] h-[130px] rounded-full bottom-2 left-[-30px]" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />

              {/* Top row */}
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-primary-200 text-[13px] font-medium mb-0.5">{getGreeting()} 👋</Text>
                  <Text className="text-white text-2xl font-extrabold" style={{ letterSpacing: -0.4 }}>{displayName}</Text>
                </View>
                <View className="flex-row items-center gap-2.5">
                  <TouchableOpacity className="w-[42px] h-[42px] rounded-full justify-center items-center relative" style={{ backgroundColor: "rgba(255,255,255,0.18)" }} onPress={() => navigation.navigate("Notifications")}>
                    <Bell size={20} color="#ffffff" />
                    <View className="absolute top-[9px] right-[9px] w-[7px] h-[7px] rounded-full bg-rice-400 border-[1.5px] border-primary-600" />
                  </TouchableOpacity>
                  <Avatar fallback={displayName[0]} size={44} style={{ borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" }} />
                </View>
              </View>

              {/* Stat pills */}
              <View className="flex-row items-center self-start rounded-full px-3 py-1.5 mb-4 gap-2" style={{ backgroundColor: "rgba(255,255,255,0.13)" }}>
                <View className="flex-row items-center gap-1"><Star size={13} color="#fcd34d" fill="#fcd34d" /><Text className="text-white text-xs font-semibold">{profileRating ?? "—"} sao</Text></View>
                <View className="w-px h-3" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                <View className="flex-row items-center gap-1"><Briefcase size={13} color="#6ee7b7" /><Text className="text-white text-xs font-semibold">{totalJobsCompleted ?? 0} việc</Text></View>
              </View>

              {/* Search bar */}
              <TouchableOpacity className="flex-row items-center gap-2 bg-white rounded-[20px] pl-4 pr-1.5 h-[50px]" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 }} onPress={() => navigation.navigate("Search")} activeOpacity={0.9}>
                <Search size={17} color="#94a3b8" />
                <Text className="flex-1 text-slate-400 text-sm">Tìm kiếm công việc...</Text>
                <View className="bg-primary-50 rounded-2xl px-3 py-2">
                  <Text className="text-xs font-bold text-primary-600">Lọc</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* STATS ROW */}
            <View className="flex-row px-4 gap-2.5 mb-4">
              {STATS.map((s) => (
                <View key={s.label} className="flex-1 bg-white rounded-[20px] p-3.5 items-center gap-1.5 border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}>
                  <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: s.bg }}>
                    <s.Icon size={18} color={s.iconColor} />
                  </View>
                  <Text className="text-lg font-extrabold text-slate-800">{s.value}</Text>
                  <Text className="text-[11px] text-slate-500 font-medium text-center">{s.label}</Text>
                </View>
              ))}
            </View>

            {/* UPCOMING */}
            {upcomingJobs.length > 0 && (
              <View className="px-4 mb-1">
                <SectionHeader title="Lịch sắp tới" />
                {upcomingJobs.map((j) => (
                  <Card key={j.id} variant="elevated" className="mb-2">
                    <CardContent>
                      <View className="flex-row items-center gap-2">
                        <View className="bg-primary-50 border border-primary-100 rounded-xl px-2.5 py-1.5 items-center min-w-[48px]">
                          <Text className="text-xl font-extrabold text-primary-600">15</Text>
                          <Text className="text-[11px] text-primary-500 font-semibold">Th1</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-slate-800 mb-0.5">{j.title}</Text>
                          <Text className="text-xs text-slate-500 mb-1">{j.farmer}</Text>
                          <View className="flex-row items-center gap-1"><Clock size={12} color="#059669" /><Text className="text-xs text-primary-600 font-semibold">{j.time}</Text></View>
                        </View>
                        <Badge variant="success">Xác nhận</Badge>
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}

            {/* NEARBY HEADER */}
            <View className="px-4 mb-1">
              <SectionHeader title="Việc gần bạn" subtitle="Phù hợp với khu vực của bạn" actionLabel="Xem tất cả" onPressAction={() => navigation.navigate("Search")} />
            </View>
          </>
        }
        renderItem={({ item: job }) => (
          <TouchableOpacity className="px-4 mb-2" activeOpacity={0.9} onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}>
            <View className="bg-white rounded-[20px] flex-row overflow-hidden border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
              <View className={["w-1", job.urgent ? "bg-rose-500" : "bg-primary-400"].join(" ")} />
              <View className="flex-1 p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Avatar fallback={job.farmer[0]} size={42} />
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-slate-800 mb-0.5" numberOfLines={1}>{job.title}</Text>
                    <Text className="text-xs text-slate-500">{job.farmer}</Text>
                  </View>
                  {job.urgent && (
                    <View className="flex-row items-center gap-1 bg-rose-50 rounded-full px-2 py-1 border border-rose-500/25">
                      <Flame size={11} color="#f43f5e" />
                      <Text className="text-[11px] font-bold text-rose-500">Gấp</Text>
                    </View>
                  )}
                </View>
                <View className="h-px bg-slate-100 mb-2" />
                <View className="flex-row items-center flex-wrap gap-2">
                  <View className="flex-row items-center gap-1"><MapPin size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.location}</Text></View>
                  <View className="flex-row items-center gap-1"><Clock size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.duration}</Text></View>
                  <View className="flex-row items-center gap-1 bg-primary-50 rounded-full px-2 py-0.5">
                    <Banknote size={13} color="#059669" /><Text className="text-xs font-bold text-primary-700">{job.wage}đ</Text>
                  </View>
                  <ChevronRight size={16} color="#cbd5e1" style={{ marginLeft: "auto" }} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="px-4">
            <Card variant="tinted"><CardContent><EmptyState title="Chưa có việc gần bạn" description="Khi có việc phù hợp, chúng tôi sẽ gợi ý tại đây." /></CardContent></Card>
          </View>
        }
      />
    </SafeAreaView>
  );
}
