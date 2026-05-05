/* AI CONTEXT:
 * Action: Primary dashboard for workers displaying key stats and daily quick actions.
 * Inputs: User statistics, current wallet balance, active job info.
 * Outputs: Rendered dashboard UI with quick links.
 * Dependencies: Job service, Wallet service, Auth context. */

import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Star, Briefcase, TrendingUp, Bell, Search, Clock, CheckCircle2, Wallet } from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { WeatherWidget } from "../components/home/WeatherWidget";
import { SectionHeader, EmptyState } from "../components/ui/export_ui_components";
import { useAuth } from "../context/AuthContext";
import { useUnreadCounts } from "../hooks/use_unread_counts";
import { useHomeData } from "../hooks/use_home_data";
import { useLocalWeather } from "../hooks/use_local_weather";
import { JobMap } from "../components/ui/JobMap";
import { useShortName, getShortName } from "../hooks/useShortName";

// Placeholder image for jobs (User will replace per category later)
const CATEGORY_PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600&auto=format&fit=crop";

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
  const shortName = useShortName(user?.name);

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
      const thousandsStr = String(thousands).padStart(3, '0').replace(/0+$/, '');
      return `${millions}m${thousandsStr}`;
    }
    if (val >= 1000) return Math.floor(val / 1000) + "k";
    return val.toString();
  };

  const renderApplicationCard = (j: any, isPending: boolean) => (
    <TouchableOpacity key={j.id} activeOpacity={0.9} onPress={() => navigation.navigate("JobDetail", { jobId: j.jobPostId })} style={{ width: 300 }}>
      <View className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 flex-1 m-1 mb-2">
        {/* Cover Image */}
        <View className="h-[140px] w-full bg-slate-100 relative">
          <Image source={{ uri: j.thumbnailUrl || CATEGORY_PLACEHOLDER_IMG }} className="w-full h-full" resizeMode="cover" />
          
          <View className="absolute top-2 left-2 flex-row gap-1">
            {j.urgent && (
              <View className="bg-rose-500/95 rounded-md px-2 py-0.5 shadow-sm">
                <Text className="text-[10px] font-black text-white">Gấp</Text>
              </View>
            )}
          </View>

          {/* Top-right Status Badge */}
          <View className="absolute top-3 right-3">
            {isPending ? (
              <Badge variant={j.status === "rejected" ? "danger" : "warning"}>
                {j.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
              </Badge>
            ) : (
              j.reportedToday ? (
                <Badge variant="success">Đã báo cáo</Badge>
              ) : (
                <Badge variant="warning">Cần báo cáo</Badge>
              )
            )}
          </View>
          
          {/* Overlapping Bottom Info */}
          <View className="absolute -bottom-4 left-4 flex-row items-center bg-white rounded-full pr-3 pl-1 py-1 shadow-sm border border-slate-50">
            <Avatar source={j.farmerAvatar ? { uri: j.farmerAvatar } : undefined} fallback={j.farmer?.[0] || "?"} size={24} />
            <Text className="text-xs font-bold text-slate-700 ml-2" numberOfLines={1}>{getShortName(j.farmer)}</Text>
          </View>
          <View className="absolute -bottom-4 right-4 bg-white rounded-full px-3 py-1 shadow-sm border border-slate-50">
             <Text className="text-[13px] font-black text-primary-600">{j.wage}₫<Text className="text-[9px] text-slate-400 font-medium">{j.wageUnit}</Text></Text>
          </View>
        </View>

        {/* Card Content */}
        <View className="p-4 pt-7">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-[16px] font-bold text-slate-800 flex-1 mr-2" numberOfLines={2}>{j.title}</Text>
          </View>

          <View className="flex-row items-center justify-between mt-1">
            <View className="gap-1.5 flex-1 pr-2">
               <View className="flex-row items-center gap-1">
                 <MapPin size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
                 <Text className="text-[11px] text-slate-500 font-medium" numberOfLines={1} style={{ flexShrink: 1 }}>{j.location}</Text>
               </View>
               <View className="flex-row items-center gap-1">
                 <Clock size={12} color="#94a3b8" />
                 <Text className="text-[11px] text-slate-500 font-medium">{j.date}{j.time ? ` • ${j.time}` : ''}</Text>
               </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
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
            <View className="mb-6">
              <LinearGradient 
                colors={["#059669", "#047857"]} 
                className="px-5 pt-4 pb-10 rounded-b-[40px] overflow-hidden relative shadow-sm"
              >
                {/* Decorative Elements */}
                <View className="absolute w-[250px] h-[250px] rounded-full top-[-80px] right-[-60px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <View className="absolute w-[150px] h-[150px] rounded-full bottom-[-20px] left-[-40px]" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />

                {/* Header row */}
                <View className="flex-row items-center justify-between mb-6 mt-2">
                  <View className="flex-row items-center flex-1 gap-3">
                    <Avatar source={profileAvatar ? { uri: profileAvatar } : undefined} fallback={user?.name?.[0] || "?"} size={48} style={{ borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" }} />
                    <View className="flex-1 mr-2">
                      <Text className="text-white text-[18px] font-black tracking-tight" numberOfLines={1}>Chào, {shortName || "Bạn"}!</Text>
                      <Text className="text-primary-100 text-[13px] font-medium mt-0.5">Hôm nay bạn muốn làm gì?</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity className="w-[42px] h-[42px] bg-white rounded-[14px] justify-center items-center shadow-sm" onPress={() => navigation.navigate("WorkerWallet")}>
                      <Wallet size={20} color="#059669" />
                    </TouchableOpacity>
                    <TouchableOpacity className="w-[42px] h-[42px] bg-white rounded-[14px] justify-center items-center shadow-sm relative" onPress={() => navigation.navigate("Notifications")}>
                      <Bell size={20} color="#059669" />
                      {unreadNotifications > 0 && (
                        <View className="absolute top-[10px] right-[10px] w-[8px] h-[8px] rounded-full bg-rose-500 border-2 border-white" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* SEARCH BAR (Pill shape, no filter) */}
                <TouchableOpacity className="flex-row items-center gap-3 bg-white rounded-full px-5 h-[56px] shadow-sm mb-2" onPress={() => navigation.navigate("Search")} activeOpacity={0.9}>
                  <Search size={22} color="#94a3b8" />
                  <Text className="flex-1 text-slate-400 text-[15px] font-medium">Tìm kiếm công việc...</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* PROFESSIONAL STATS ROW */}
            <View className="flex-row px-5 mb-4 gap-4 -mt-2">
               {/* THU NHẬP HÔM NAY */}
               <LinearGradient 
                 colors={['#059669', '#047857']} 
                 start={{x: 0, y: 0}}
                 end={{x: 1, y: 1}}
                 className="rounded-[28px] p-5 shadow-sm flex-1 overflow-hidden relative"
               >
                  {/* Decorative blobs */}
                  <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                  <View className="absolute -left-8 -bottom-8 w-24 h-24 bg-black/10 rounded-full" />
                  <View className="absolute right-[-10px] bottom-[-10px] opacity-20">
                    <TrendingUp size={110} color="#ffffff" strokeWidth={1.5} />
                  </View>

                  <View className="flex-row items-center justify-between mb-5">
                    <View className="bg-white/20 rounded-xl p-2.5 backdrop-blur-md">
                      <Wallet size={20} color="#ffffff" strokeWidth={2.5} />
                    </View>
                    <View className="bg-white/20 px-2 py-1 rounded border border-white/20 backdrop-blur-md">
                      <Text className="text-white text-[9px] font-black uppercase tracking-widest">Hôm nay</Text>
                    </View>
                  </View>

                  <View className="mt-auto">
                    <Text className="text-emerald-100 font-semibold text-[12px] mb-1">Tổng thu nhập</Text>
                    <View className="flex-row items-end">
                      <Text className="text-[28px] font-black text-white tracking-tighter leading-none" numberOfLines={1}>
                        {formatCompact(todayEarnings ?? 0)}
                      </Text>
                      <Text className="text-[16px] text-emerald-200 font-bold ml-1 mb-0.5">₫</Text>
                    </View>
                  </View>
               </LinearGradient>

               {/* VIỆC & ĐÁNH GIÁ Column */}
               <View className="flex-1 justify-between gap-3">
                 <View className="bg-white rounded-[24px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-50 flex-row items-center flex-1 justify-between">
                    <View>
                      <Text className="text-[22px] font-black text-slate-800 tracking-tight leading-none">{totalJobsCompleted ?? 0}</Text>
                      <Text className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest">Công việc</Text>
                    </View>
                    <View className="w-10 h-10 rounded-[14px] bg-emerald-50 justify-center items-center">
                      <Briefcase size={18} color="#059669" />
                    </View>
                 </View>

                 <View className="bg-white rounded-[24px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-50 flex-row items-center flex-1 justify-between">
                    <View>
                      <Text className="text-[22px] font-black text-slate-800 tracking-tight leading-none">{profileRating ?? "0.0"}</Text>
                      <Text className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest">Đánh giá</Text>
                    </View>
                    <View className="w-10 h-10 rounded-[14px] bg-amber-50 justify-center items-center">
                      <Star size={18} color="#f59e0b" fill="#f59e0b" />
                    </View>
                 </View>
               </View>
            </View>

            {/* WEATHER WIDGET OUTSIDE HEADER */}
            <View className="px-5 mb-8 mt-2">
              <WeatherWidget 
                  weatherData={weatherData} 
                  isLoading={isWeatherLoading} 
                  locationStatus={locationStatus}
                  onRetry={refetchWeather}
              />
            </View>

            {activeApplications.length > 0 && (
              <View className="mb-8">
                <View className="px-5 mb-3">
                  <SectionHeader title="Đang thực hiện" actionLabel="Tất cả" onPressAction={() => navigation.navigate("Jobs", { initialTab: "upcoming" })} />
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'stretch' }}
                  snapToInterval={310}
                  decelerationRate="fast"
                  snapToAlignment="start"
                  onScroll={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / 310))}
                  scrollEventThrottle={16}
                >
                  {activeApplications.map((j) => renderApplicationCard(j, false))}
                </ScrollView>
                {activeApplications.length > 1 && (
                  <View className="flex-row justify-center mt-3 gap-1.5">
                    {activeApplications.map((_, i) => (
                      <View key={i} className={`h-1.5 rounded-full ${i === activeIndex ? "w-4 bg-primary-600" : "w-1.5 bg-slate-200"}`} />
                    ))}
                  </View>
                )}
              </View>
            )}

            {pendingApplications.length > 0 && (
              <View className="mb-8">
                <View className="px-5 mb-3">
                  <SectionHeader title="Đã ứng tuyển" actionLabel="Tất cả" onPressAction={() => navigation.navigate("Jobs", { initialTab: "applied" })} />
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'stretch' }}
                  snapToInterval={310}
                  decelerationRate="fast"
                  snapToAlignment="start"
                  onScroll={(e) => setPendingIndex(Math.round(e.nativeEvent.contentOffset.x / 310))}
                  scrollEventThrottle={16}
                >
                  {pendingApplications.map((j) => renderApplicationCard(j, true))}
                </ScrollView>
                {pendingApplications.length > 1 && (
                  <View className="flex-row justify-center mt-3 gap-1.5">
                    {pendingApplications.map((_, i) => (
                      <View key={i} className={`h-1.5 rounded-full ${i === pendingIndex ? "w-4 bg-primary-600" : "w-1.5 bg-slate-200"}`} />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* MAP SECTION */}
            <View className="px-5 mb-8">
              <View className="mb-3">
                <SectionHeader title="Khám phá bản đồ" actionLabel="" />
              </View>
              <View className="rounded-[24px] overflow-hidden shadow-sm border border-slate-100 bg-white">
                <JobMap
                  userLocation={userLocation}
                  radiusKm={radiusKm}
                  jobs={nearbyJobs}
                  onCalloutPress={(job) => navigation.navigate("JobDetail", { jobId: job.id })}
                />
              </View>
            </View>

            <View className="px-5 mb-4">
              <SectionHeader title="Công việc mới đăng gần đây" actionLabel="Xem tất cả" onPressAction={() => navigation.navigate("Search")} />
            </View>
          </>
        }
        renderItem={({ item: job }) => (
          <TouchableOpacity 
            className="px-5 mb-4" 
            activeOpacity={0.9} 
            onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
          >
            <View className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm flex-row h-[120px]">
              {/* Job Thumbnail */}
              <View className="w-[110px] h-full bg-slate-100 relative">
                 <Image 
                    source={{ uri: job.thumbnailUrl || CATEGORY_PLACEHOLDER_IMG }} 
                    className="w-full h-full"
                    resizeMode="cover"
                 />
                 <View className="absolute top-2 left-2 bg-white/95 rounded-md px-1.5 py-0.5 shadow-sm">
                   <Text className="text-[10px] font-black text-slate-800">Mới</Text>
                 </View>
              </View>
              
              {/* Job Details */}
              <View className="flex-1 p-3 px-4 justify-between">
                 <View>
                   <View className="flex-row items-start justify-between mb-1">
                     <Text className="text-[15px] font-bold text-slate-800 flex-1 leading-tight mr-2" numberOfLines={2}>{job.title}</Text>
                     {job.urgent && (
                       <View className="bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 mt-0.5">
                         <Text className="text-[9px] font-black text-rose-600">GẤP</Text>
                       </View>
                     )}
                   </View>
                   <View className="flex-row items-center flex-wrap gap-y-1 mb-2">
                     <View className="flex-row items-center gap-1.5">
                       <Avatar source={job.farmerAvatar ? { uri: job.farmerAvatar } : undefined} fallback={job.farmer[0]} size={16} />
                       <Text className="text-[11px] font-bold text-slate-500" numberOfLines={1}>{getShortName(job.farmer)}</Text>
                     </View>
                     {job.rating > 0 && (
                       <View className="flex-row items-center gap-0.5">
                         <View className="w-1 h-1 rounded-full bg-slate-300 mx-1.5" />
                         <Star size={10} color="#f59e0b" fill="#f59e0b" />
                         <Text className="text-[10px] font-bold text-slate-500">{job.rating.toFixed(1)}</Text>
                       </View>
                     )}
                     <View className="flex-row items-center gap-1 w-full mt-1">
                       <Clock size={11} color="#94a3b8" />
                       <Text className="text-[10px] text-slate-500 font-medium" numberOfLines={1}>
                         {job.date && job.date !== 'N/A' ? `${job.date} • ` : ''}{job.duration}
                       </Text>
                     </View>
                   </View>
                 </View>
                 
                 <View className="flex-row items-end justify-between mt-auto">
                    <View className="gap-1 flex-1 pr-2">
                      <View className="flex-row items-center gap-1">
                        <MapPin size={11} color="#94a3b8" style={{ flexShrink: 0 }} />
                        <Text className="text-[11px] text-slate-500 font-medium" numberOfLines={1} style={{ flexShrink: 1 }}>{job.location || 'N/A'}</Text>
                      </View>
                      {(job.matchScore !== undefined && job.matchScore !== null) && (
                        <View className="flex-row items-center gap-1">
                          <CheckCircle2 size={11} color="#059669" />
                          <Text className="text-[11px] text-primary-600 font-bold">
                            {`${Math.round(job.matchScore > 1 ? job.matchScore : job.matchScore * 100)}%`}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-row items-baseline bg-primary-50 px-2 py-1 rounded border border-primary-100">
                      <Text className="text-[13px] font-black text-primary-700">{job.wage}₫</Text>
                      {job.wageUnit ? (
                        <Text className="text-[9px] font-bold text-primary-600 ml-0.5">{job.wageUnit}</Text>
                      ) : null}
                    </View>
                 </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View className="px-5">
              <EmptyState title="Không tìm thấy việc" icon={Briefcase} />
            </View>
          ) : null
        }
        ListFooterComponent={isLoading ? <View className="py-6"><ActivityIndicator color="#059669" /></View> : null}
      />
    </SafeAreaView>
  );
}
