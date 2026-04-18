/* AI CONTEXT:
 * Action: Primary dashboard for workers displaying key stats and daily quick actions.
 * Inputs: User statistics, current wallet balance, active job info.
 * Outputs: Rendered dashboard UI with quick links.
 * Dependencies: Job service, Wallet service, Auth context. */

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Star, Briefcase, TrendingUp, Bell, Search, Clock, ChevronRight, CheckCircle2, Wallet } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { WeatherWidget } from "../components/home/WeatherWidget";
import { SectionHeader, EmptyState } from "../components/ui/export_ui_components";
import { Job } from "../types/export_type_definitions";
import { useAuth } from "../context/AuthContext";
import { useUnreadCounts } from "../hooks/use_unread_counts";
import { useHomeData } from "../hooks/use_home_data";
import { useLocalWeather } from "../hooks/use_local_weather";
import { JobMap } from "../components/ui/JobMap";


export function WorkerHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const {
    nearbyJobs,
    pendingApplications,
    activeApplications,
    profileData: {
      rating: profileRating,
      totalJobsCompleted,
      avatarUrl: profileAvatar,
      todayEarnings
    },
    userLocation,
    radiusKm,
    isLoading,
    refreshing,
    onRefresh: onRefreshData
  } = useHomeData();

  const { weatherData, isLoading: isWeatherLoading, locationStatus, refetch: refetchWeather } = useLocalWeather();
  const { unreadNotifications } = useUnreadCounts();

  const [pendingIndex, setPendingIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const onRefresh = useCallback(() => {
    onRefreshData();
    refetchWeather();
  }, [onRefreshData, refetchWeather]);

  const formatCompact = (val: number) => {
    if (val === 0) return "0";
    if (val >= 1000000) {
      const millions = Math.floor(val / 1000000);
      const thousands = Math.floor((val % 1000000) / 1000);
      if (thousands === 0) return millions + "m";
      // 1 245 435 -> 1m245
      // 1 200 000 -> 1m2
      const thousandsStr = String(thousands).padStart(3, '0').replace(/0+$/, '');
      return `${millions}m${thousandsStr}`;
    }
    if (val >= 1000) return Math.floor(val / 1000) + "k";
    return val.toString();
  };




  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      <FlatList
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        data={nearbyJobs}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            {/* HERO */}
            <View className="mb-4">
              <LinearGradient 
                colors={["#059669", "#065f46"]} 
                className="px-4 pt-4 pb-12 rounded-b-[32px] overflow-hidden relative"
              >
                <View className="absolute w-[200px] h-[200px] rounded-full top-[-70px] right-[-50px]" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
                <View className="absolute w-[130px] h-[130px] rounded-full bottom-2 left-[-30px]" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />

                {/* Header row: greeting (flex-1) | bell + avatar */}
                <View className="flex-row items-center justify-between mb-3">
                  {/* Left: Greeting */}
                  <View className="flex-1 mr-3">
                    <Text className="text-primary-200 text-[13px] font-medium mb-0.5">Xin chào,</Text>
                    <Text className="text-white text-2xl font-black uppercase tracking-tight -mt-0.5" numberOfLines={1}>{user?.name || "BẠN MỚI"}</Text>
                  </View>
                  {/* Right: bell + avatar only */}
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity className="w-[38px] h-[38px] rounded-full justify-center items-center relative" style={{ backgroundColor: "rgba(255,255,255,0.18)" }} onPress={() => navigation.navigate("WorkerWallet")}>
                      <Wallet size={18} color="#ffffff" />
                    </TouchableOpacity>
                    <TouchableOpacity className="w-[38px] h-[38px] rounded-full justify-center items-center relative" style={{ backgroundColor: "rgba(255,255,255,0.18)" }} onPress={() => navigation.navigate("Notifications")}>
                      <Bell size={18} color="#ffffff" />
                      {unreadNotifications > 0 && (
                        <View 
                          className="absolute top-[7px] right-[7px] w-[10px] h-[10px] rounded-full bg-rose-500 border-2 border-[#065f46]" 
                          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 }} 
                        />
                      )}
                    </TouchableOpacity>
                    <Avatar source={profileAvatar ? { uri: profileAvatar } : undefined} fallback={user?.name?.[0] || "?"} size={38} style={{ borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" }} />
                  </View>
                </View>

                {/* WEATHER WIDGET */}
                <WeatherWidget 
                    weatherData={weatherData} 
                    isLoading={isWeatherLoading} 
                    locationStatus={locationStatus}
                    onRetry={refetchWeather}
                />

                <TouchableOpacity className="flex-row items-center gap-2 bg-white rounded-[20px] pl-4 pr-1.5 h-[50px]" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 }} onPress={() => navigation.navigate("Search")} activeOpacity={0.9}>
                  <Search size={17} color="#94a3b8" />
                  <Text className="flex-1 text-slate-400 text-sm">Tìm kiếm công việc...</Text>
                  <View className="bg-primary-50 rounded-2xl px-3 py-2">
                    <Text className="text-xs font-bold text-primary-600">Lọc</Text>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* STATS ROW: 1 LARGE, 2 EQUAL SMALL */}
            <View className="flex-row px-4 mb-4 gap-2">
               {/* THU NHẬP HÔM NAY (Wide Primary) */}
               <View className="bg-white rounded-[16px] p-1.5 items-center border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, flex: 1.8, gap: 1 }}>
                  <View className="w-6 h-6 rounded-full justify-center items-center bg-[#ccfbf1]">
                    <TrendingUp size={10} color="#0d9488" />
                  </View>
                  <Text className="text-[14px] font-black text-slate-900" numberOfLines={1}>
                    {formatCompact(todayEarnings ?? 0)}
                    <Text className="text-[9px] text-primary-600 font-bold ml-0.5">₫</Text>
                  </Text>
                  <Text className="text-slate-500 font-bold text-center leading-tight" style={{ fontSize: 7.5 }} numberOfLines={1}>Thu nhập hôm nay</Text>
               </View>

               {/* VIỆC ĐÃ LÀM (Equal Secondary) */}
               <View className="bg-white rounded-[16px] p-1.5 items-center border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, flex: 1, gap: 1 }}>
                  <View className="w-6 h-6 rounded-full justify-center items-center bg-[#d1fae5]">
                    <Briefcase size={10} color="#059669" />
                  </View>
                  <Text className="text-[14px] font-extrabold text-slate-800" numberOfLines={1}>{totalJobsCompleted ?? 0}</Text>
                  <Text className="text-slate-500 font-bold text-center leading-tight" style={{ fontSize: 7.5 }} numberOfLines={1}>Việc đã làm</Text>
               </View>

               {/* ĐÁNH GIÁ (Equal Secondary) */}
               <View className="bg-white rounded-[16px] p-1.5 items-center border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, flex: 1, gap: 1 }}>
                  <View className="w-6 h-6 rounded-full justify-center items-center bg-[#fef3c7]">
                    <Star size={10} color="#f59e0b" />
                  </View>
                  <Text className="text-[14px] font-extrabold text-slate-800" numberOfLines={1}>{profileRating ?? "0"}</Text>
                  <Text className="text-slate-500 font-bold text-center leading-tight" style={{ fontSize: 7.5 }} numberOfLines={1}>Đánh giá</Text>
               </View>
            </View>

            {pendingApplications.length > 0 && (
              <View className="mb-4">
                <View className="px-4 mb-2">
                  <SectionHeader title="Đã ứng tuyển" actionLabel="Tất cả" onPressAction={() => navigation.navigate("Jobs", { initialTab: "applied" })} />
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 12, alignItems: 'stretch' }}
                  snapToInterval={332}
                  decelerationRate="fast"
                  snapToAlignment="start"
                  onScroll={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / 332);
                    setPendingIndex(idx);
                  }}
                  scrollEventThrottle={16}
                >
                  {pendingApplications.map((j) => (
                    <TouchableOpacity key={j.id} activeOpacity={0.8} onPress={() => navigation.navigate("JobDetail", { jobId: j.jobPostId })} style={{ width: 320 }}>
                      <Card variant="elevated" className="m-0 mb-1 flex-1">
                        <CardContent>
                          <View className="flex-row items-center gap-2">
                            <View className="bg-primary-50 border border-primary-100 rounded-xl px-2.5 py-1.5 items-center min-w-[50px]">
                              <Text className="text-[10px] text-primary-500 font-bold uppercase mb-0.5" numberOfLines={1}>BẮT ĐẦU</Text>
                              <Text className="text-[13px] font-extrabold text-primary-700">{j.date.split("/").slice(0, 2).join("/")}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-[15px] font-bold text-slate-800 mb-0.5" numberOfLines={1}>{j.title}</Text>
                              <Text className="text-[12px] text-slate-500 mb-1" numberOfLines={1}>{j.farmer}</Text>
                            </View>
                            <Badge variant={j.status === "rejected" ? "danger" : "warning"}>
                              {j.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                            </Badge>
                          </View>
                        </CardContent>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View className="flex-row justify-center mt-3 gap-1.5">
                  {pendingApplications.map((_, i) => (
                    <View key={i} className={`h-1.5 rounded-full ${i === pendingIndex ? "w-4 bg-primary-600" : "w-1.5 bg-slate-200"}`} />
                  ))}
                </View>
              </View>
            )}

            {activeApplications.length > 0 && (
              <View className="mb-4">
                <View className="px-4 mb-2">
                  <SectionHeader title="Đang thực hiện" actionLabel="Tất cả" onPressAction={() => navigation.navigate("Jobs", { initialTab: "upcoming" })} />
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 12, alignItems: 'stretch' }}
                  snapToInterval={332}
                  decelerationRate="fast"
                  snapToAlignment="start"
                  onScroll={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / 332);
                    setActiveIndex(idx);
                  }}
                  scrollEventThrottle={16}
                >
                  {activeApplications.map((j) => (
                    <TouchableOpacity key={j.id} activeOpacity={0.8} onPress={() => navigation.navigate("JobDetail", { jobId: j.jobPostId })} style={{ width: 320 }}>
                      <Card variant="elevated" className="m-0 mb-1 flex-1 justify-center">
                        <CardContent>
                          <View className="flex-row items-center gap-2">
                            <View className="bg-primary-50 border border-primary-100 rounded-xl px-2.5 py-1.5 items-center min-w-[50px]">
                              <Text className="text-[10px] text-primary-500 font-bold uppercase mb-0.5" numberOfLines={1}>BẮT ĐẦU</Text>
                              <Text className="text-[13px] font-extrabold text-primary-700">{j.date.split("/").slice(0, 2).join("/")}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-[15px] font-bold text-slate-800 mb-0.5" numberOfLines={1}>{j.title}</Text>
                              <Text className="text-[12px] text-slate-500 mb-1" numberOfLines={1}>{j.farmer}</Text>
                            </View>
                            {j.reportedToday ? (
                              <Badge variant="success">Đã báo cáo</Badge>
                            ) : (
                              <Badge variant="warning">Cần báo cáo</Badge>
                            )}
                          </View>
                        </CardContent>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View className="flex-row justify-center mt-3 gap-1.5">
                  {activeApplications.map((_, i) => (
                    <View key={i} className={`h-1.5 rounded-full ${i === activeIndex ? "w-4 bg-primary-600" : "w-1.5 bg-slate-200"}`} />
                  ))}
                </View>
              </View>
            )}

            <View className="px-4 mb-1">
              <SectionHeader title="Việc gần bạn" actionLabel="Xem tất cả" onPressAction={() => navigation.navigate("Search")} />
            </View>

            <View className="px-4 mb-4">
              <JobMap
                userLocation={userLocation}
                radiusKm={radiusKm}
                jobs={nearbyJobs}
                onCalloutPress={(job) => navigation.navigate("JobDetail", { jobId: job.id })}
              />
            </View>
          </>
        }
        renderItem={({ item: job }) => (
          <TouchableOpacity 
            className="px-4 mb-3" 
            activeOpacity={0.9} 
            onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
          >
            <View className="bg-white rounded-2xl flex-row overflow-hidden border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
              <View className={["w-1.5", job.urgent ? "bg-rose-500" : "bg-primary-400"].join(" ")} />
              <View className="flex-1 p-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <Avatar fallback={job.farmer[0]} size={42} />
                  <View className="flex-1">
                    <Text className="text-[16px] font-bold text-slate-800" numberOfLines={1}>{job.title}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[17px] font-extrabold text-primary-600">{job.wage}₫<Text className="text-[11px] text-slate-400 font-medium"> {job.wageUnit}</Text></Text>
                    {job.urgent && <Badge variant="danger">Gấp</Badge>}
                  </View>
                </View>

                {/* New Metadata Row */}
                <View className="flex-row items-center justify-between mb-3 bg-slate-50 rounded-xl px-3 py-2">
                  <View className="flex-row items-center gap-1.5">
                    <MapPin size={14} color="#64748b" />
                    <Text className="text-xs text-slate-600 font-medium" numberOfLines={1} style={{ flexShrink: 1 }}>
                      {job.distanceKm ? `${job.distanceKm.toFixed(1)} km` : (job.location || "Việt Nam")}
                    </Text>
                  </View>
                  <View className="w-px h-3 bg-slate-200" />
                  <View className="flex-row items-center gap-1.5">
                    <CheckCircle2 size={14} color="#059669" />
                    <Text className="text-xs text-primary-700 font-bold">
                      {(job.matchScore !== undefined && job.matchScore !== null) ? `${Math.round(job.matchScore > 1 ? job.matchScore : job.matchScore * 100)}% khớp` : "Phù hợp"}
                    </Text>
                  </View>
                  <View className="w-px h-3 bg-slate-200" />
                  <View className="flex-row items-center gap-1.5">
                    <Clock size={14} color="#64748b" />
                    <Text className="text-xs text-slate-600 font-medium">{job.duration}</Text>
                  </View>
                </View>

                <View className="flex-row items-center flex-wrap gap-2">
                   <View className="flex-row items-center gap-1 flex-1">
                     <MapPin size={13} color="#94a3b8" />
                     <Text className="text-xs text-slate-500" numberOfLines={1} ellipsizeMode="tail">
                       {job.location}
                     </Text>
                   </View>
                   <ChevronRight size={16} color="#cbd5e1" style={{ marginLeft: "auto" }} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View className="px-4">
              <EmptyState title="Không tìm thấy việc" icon={Briefcase} />
            </View>
          ) : null
        }
        ListFooterComponent={isLoading ? <View className="py-4"><ActivityIndicator color="#059669" /></View> : null}
      />
    </SafeAreaView>
  );
}
