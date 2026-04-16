/* AI CONTEXT:
 * Action: Lists user jobs categorized by status (applied, active, completed).
 * Inputs: Job status filters, pagination data.
 * Outputs: Filtered lists of job cards.
 * Dependencies: Job service, Navigation parameters. */

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, DeviceEventEmitter, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardContent, Badge, Avatar, PillTabs, EmptyState, SkeletonCard } from "../components/ui/export_ui_components";
import { MapPin, Banknote, Calendar, CheckCircle2, Star, ClipboardCheck, Briefcase, Info, FileText, MessageSquare, Quote } from "lucide-react-native";
import { jobService, workerProfileService, dailyReportService } from "../services/export_services";
import { ratingService } from "../services/rating.service";
import { useAuth } from "../context/AuthContext";
import { isPastDate } from "../utils/provide_formatting_helpers";
import { DEMO_JOB_POSTS, DEMO_APPLICATIONS, DEMO_WORKER_PROFILE } from "../constants/demoData";
import { mapApplicationToUI } from "../utils/mapperUtils";

type TabType = "applied" | "upcoming" | "completed";

export function WorkerJobsScreen({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || "applied");
  const { isAuthenticated, user } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCanceling, setIsCanceling] = useState<string | null>(null);

  const handleCancelApplication = (appId: string) => {
    Alert.alert(
      "Xác nhận hủy đơn",
      "Bạn có chắc chắn muốn hủy đơn ứng tuyển này không? Hành động này không thể hoàn tác.",
      [
        { text: "Bỏ qua", style: "cancel" },
        { 
          text: "Hủy đơn", 
          style: "destructive",
          onPress: async () => {
             setIsCanceling(appId);
             try {
                await jobService.cancelApplication(appId);
                Alert.alert("Thành công", "Đã hủy đơn ứng tuyển.");
                loadJobs();
             } catch (error: any) {
                Alert.alert("Lỗi", error?.response?.data?.message || "Không thể hủy đơn lúc này.");
             } finally {
                setIsCanceling(null);
             }
          }
        }
      ]
    );
  };

  const loadJobs = useCallback(async () => {
    let sourceApps = [];
    let sourceAllJobs = [];
    let sourceProfile: any = null;
    let sourceReports: any[] = [];
    let sourceRatings: any[] = [];

    if (!isAuthenticated || user?.isDemo) { 
      sourceApps = DEMO_APPLICATIONS;
      sourceAllJobs = DEMO_JOB_POSTS;
      sourceProfile = DEMO_WORKER_PROFILE;
    } else {
      setIsLoading(true);
      try {
        // Fetch core data first
        const [apps, allJobs, profile] = await Promise.all([
          jobService.getApplications(),
          jobService.getJobPosts(),
          workerProfileService.getProfile(),
        ]);

        sourceApps = apps;
        sourceAllJobs = allJobs;
        sourceProfile = profile;

        if (profile && profile.totalJobsCompleted > 0) {
          sourceRatings = await ratingService.getGivenRatingsByUser();
        } else {
          sourceRatings = [];
        }

        // Fetch reports if profile is available
        if (profile?.id) {
          sourceReports = await dailyReportService.getWorkerReports(profile.id);
        }
      } catch {
        setAppliedJobs([]); 
        setUpcomingJobs([]); 
        setCompletedJobs([]);
        setIsLoading(false);
        setRefreshing(false);
        return;
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    }

    const todayStr = new Date().toISOString().substring(0, 10);

    const myAppsMap = new Map();
    sourceApps.forEach(a => {
      const workerId = a.worker?.id || (a as any).workerId;
      if (workerId === sourceProfile?.id) {
        const jobId = String(a.jobPostId);
        // Only add if not already in map to keep the MOST RECENT application (since BE returns DESC)
        if (!myAppsMap.has(jobId)) {
          myAppsMap.set(jobId, a);
        }
      }
    });
    
    const myApps = Array.from(myAppsMap.values());

    const mappedApps = myApps.map((app) => {
      const jobInfo = sourceAllJobs.find(j => String(j.id) === String(app.jobPostId));
      const jobStatusId = (jobInfo as any)?.statusId || 2;
      
      let derivedStatus = "unknown";
      if (app.statusId === 1 || app.statusId === 3 || app.statusId === 4) {
        derivedStatus = app.statusId === 1 ? "pending" : app.statusId === 3 ? "rejected" : "cancelled";
      } else if (app.statusId === 2) {
        if (jobStatusId === 5) { // Completed
          derivedStatus = "completed";
        } else if (jobStatusId === 6) {
          derivedStatus = "cancelled";
        } else {
          derivedStatus = "accepted";
        }
      }

      const mappedData = mapApplicationToUI(app, jobInfo);
      
      // Check if reported today
      const isReportedToday = sourceReports.some(r => 
        String(r.jobApplicationId) === String(app.id) && 
        r.workDate?.substring(0, 10) === todayStr
      );

      // Attach rating if exists
      const ratingForJob = sourceRatings.find((r: any) => String(r.jobPostId) === String(app.jobPostId));

      const reportForThisJob = sourceReports.find(r => String(r.jobPostId) === String(app.jobPostId));
      const resolvedFarmerUserId = reportForThisJob?.farmer?.userId || mappedData.farmerUserId || (jobInfo as any)?.farmerUserId || jobInfo?.farmerProfile?.userId || jobInfo?.farmer?.userId;

      return {
        ...mappedData,
        status: derivedStatus,
        location: jobInfo?.address && jobInfo.address !== "string" ? jobInfo.address : "Hệ thống",
        wage: jobInfo?.wageAmount || (app as any).jobPost?.wageAmount || 0,
        wageType: jobInfo?.jobTypeId === 1 ? "Khoán" : "Sau công việc",
        appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("vi-VN") : "",
        completedDate: jobStatusId === 5 && jobInfo?.updatedAt ? new Date(jobInfo.updatedAt).toLocaleDateString("vi-VN") : undefined,
        paidAmount: jobStatusId === 5 ? (jobInfo?.wageAmount || 0) : 0,
        review: ratingForJob?.reviewText || null,
        rating: ratingForJob?.ratingScore || null,
        startDate: mappedData.date,
        endDate: jobInfo?.endDate && !jobInfo.endDate.startsWith("0001") ? new Date(jobInfo.endDate).toLocaleDateString("vi-VN") : mappedData.date,
        isReportedToday,
        farmerUserId: resolvedFarmerUserId // Definitive ID for chat/review
      };
    });

    setAppliedJobs(mappedApps.filter(a => a.status === "pending" || a.status === "rejected"));
    setUpcomingJobs(mappedApps.filter(a => a.status === "accepted")); 
    setCompletedJobs(mappedApps.filter(a => a.status === "completed"));
    setIsLoading(false);
    setRefreshing(false);
  }, [isAuthenticated, user?.isDemo]);

  useEffect(() => {
    if (route?.params?.initialTab) setActiveTab(route.params.initialTab);
  }, [route?.params?.initialTab]);

  useEffect(() => {
    loadJobs();
    
    // Auto-refresh when push notification is received in foreground
    const subscription = DeviceEventEmitter.addListener("REFRESH_DATA", () => {
      loadJobs();
    });
    return () => subscription.remove();
  }, [loadJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const listData = activeTab === "applied" ? appliedJobs : activeTab === "upcoming" ? upcomingJobs : completedJobs;

  const renderItem = (job: any) => {
    if (activeTab === "applied") return (
      <View className="mb-4 bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm" style={{ elevation: 2 }}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("JobDetail", { jobId: job.jobPostId })}>
          <View className="p-5">
            <View className="flex-row items-center gap-3 mb-3">
              <Avatar source={job?.farmerAvatar ? { uri: job?.farmerAvatar } : undefined} fallback={job?.farmer?.[0] || "?"} size={48} />
              <View className="flex-1">
                <Text className="text-[16px] font-bold text-slate-800 mb-0.5" numberOfLines={1}>{job.title}</Text>
                <Text className="text-[13px] text-slate-500 font-medium">{job.farmer}</Text>
              </View>
              <Badge variant={job.status === "rejected" ? "danger" : "warning"} className="px-3 py-1">
                {job.status === "rejected" ? "Từ chối" : "Chờ xác nhận"}
              </Badge>
            </View>
            
            <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-1">
              <View className="flex-row items-center gap-1.5 flex-1 pr-2">
                <MapPin size={14} color="#64748b" />
                <Text className="text-[12px] text-slate-500 font-medium flex-1" numberOfLines={1}>{job?.location || "N/A"}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Calendar size={14} color="#64748b" />
                <Text className="text-[12px] text-slate-500 font-medium">{job.startDate}</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-50">
              <View className="flex-row items-center gap-1.5 bg-primary-50 rounded-full px-3 py-1 border border-primary-100/50">
                <Banknote size={14} color="#059669" />
                <Text className="text-[13px] font-extrabold text-primary-700">{job.wage.toLocaleString("vi-VN")}đ</Text>
              </View>
              <Text className="text-[11px] text-slate-400 font-medium italic">Đã apply: {job.appliedDate}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {job.status === "pending" && (
          <View className="px-5 pb-4 flex-row justify-end pt-0 relative z-10">
             <TouchableOpacity 
                className="bg-rose-50 border border-rose-100 px-5 py-2 rounded-2xl flex-row items-center gap-1.5"
                onPress={() => handleCancelApplication(job.id)}
                disabled={isCanceling === job.id}
             >
                <Text className="text-[13px] font-bold text-rose-600">
                  {isCanceling === job.id ? "Đang hủy..." : "Hủy đơn ứng tuyển"}
                </Text>
             </TouchableOpacity>
          </View>
        )}
      </View>
    );
    if (activeTab === "upcoming") return (
      <View className="mb-4 bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm" style={{ elevation: 2 }}>
        <View className="w-1.5 bg-primary-600 h-full absolute left-0 top-0" />
        <View className="flex-1 p-5">
          <View className="flex-row items-center gap-3 mb-4">
            <Avatar source={job?.farmerAvatar ? { uri: job?.farmerAvatar } : undefined} fallback={job?.farmer?.[0] || "?"} size={48} />
            <View className="flex-1">
              <Text className="text-[16px] font-bold text-slate-800 mb-0.5">{job.title}</Text>
              <View className="flex-row items-center gap-1.5">
                <Calendar size={12} color="#059669" />
                <Text className="text-[12px] text-primary-700 font-bold">
                  {job.startDate} {job.endDate !== job.startDate ? `- ${job.endDate}` : ""}
                </Text>
              </View>
            </View>
            <Badge variant="success" className="px-3 py-1">Đã chốt</Badge>
          </View>
          
          <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-4">
            <View className="flex-row items-center gap-1.5 flex-1 pr-2">
              <MapPin size={14} color="#64748b" />
              <Text className="text-[12px] text-slate-500 font-medium leading-[18px] flex-1" numberOfLines={1}>{job?.location || "N/A"}</Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-primary-50 rounded-full px-2 py-0.5">
              <Banknote size={14} color="#059669" />
              <Text className="text-[12px] font-bold text-primary-700">
                {job.wage.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity 
              className={["flex-1 flex-row items-center justify-center rounded-[14px] py-3 gap-2 shadow-sm", (job.isReportedToday || isPastDate(job.endDate || job.startDate)) ? "bg-slate-100 border border-slate-200" : "bg-primary-600"].join(" ")}
              onPress={() => navigation.navigate("SubmitReport", { jobApplicationId: String(job.id) })}
              disabled={job.isReportedToday || isPastDate(job.endDate || job.startDate)}
            >
              <FileText size={16} color={job.isReportedToday || isPastDate(job.endDate || job.startDate) ? "#94a3b8" : "#ffffff"} />
              <Text className={["text-[13px] font-bold", (job.isReportedToday || isPastDate(job.endDate || job.startDate)) ? "text-slate-400" : "text-white"].join(" ")}>
                {job.isReportedToday ? "Đã báo cáo" : "Báo cáo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center bg-white border border-slate-200 rounded-[14px] py-3 gap-1.5 shadow-sm"
              onPress={() => navigation.navigate("Chat", { farmerId: job.farmerUserId, farmerName: job.farmer, farmerAvatar: job.farmerAvatar })}
            >
              <MessageSquare size={16} color="#475569" />
              <Text className="text-[13px] font-bold text-slate-600">Nhắn tin</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center bg-white border border-slate-200 rounded-[14px] py-3 gap-1.5 shadow-sm"
              onPress={() => navigation.navigate("JobDetail", { jobId: job.jobPostId })}
            >
              <Info size={16} color="#475569" />
              <Text className="text-[13px] font-bold text-slate-600">Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
    return (
      <View className="mb-5 bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-sm" style={{ elevation: 3 }}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => navigation.navigate("JobDetail", { jobId: job.jobPostId })}
          className="p-5"
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="relative">
              <Avatar source={job?.farmerAvatar ? { uri: job?.farmerAvatar } : undefined} fallback={job?.farmer?.[0] || "?"} size={52} />
              <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <View className="bg-primary-500 rounded-full p-1">
                  <CheckCircle2 size={12} color="#ffffff" />
                </View>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-[17px] font-extrabold text-slate-900 mb-0.5" numberOfLines={1}>{job.title}</Text>
              <Text className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">{job.farmer} • {job.completedDate}</Text>
            </View>
            <Badge variant="success" className="bg-primary-50 text-primary-700 font-black px-3 py-1">HOÀN TẤT</Badge>
          </View>
          
          <View className="flex-row items-center gap-4 mb-1">
            <View className="flex-row items-center gap-1.5 flex-1 pr-2">
              <MapPin size={14} color="#94a3b8" />
              <Text className="text-[13px] text-slate-500 font-medium leading-[20px] flex-1" numberOfLines={1}>{job?.location || "N/A"}</Text>
            </View>
            <View className="w-1 h-1 bg-slate-200 rounded-full" />
            <View className="flex-row items-center gap-1.5">
              <Banknote size={14} color="#059669" />
              <Text className="text-[14px] font-black text-slate-800">{job.paidAmount.toLocaleString("vi-VN")}đ</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View className="px-5 pb-5">
          {job.rating ? (
            <View className="bg-white border-l-4 border-l-primary-500 rounded-r-[20px] p-4 shadow-sm border-y border-r border-slate-100 mt-1">
               <View className="flex-row items-center justify-between mb-3 border-b border-slate-50 pb-2">
                  <View className="flex-row items-center gap-2">
                    <View className="bg-primary-50 px-2.5 py-1 rounded-xl border border-primary-100">
                      <Text className="text-[14px] font-black text-primary-700">{job.rating}.0</Text>
                    </View>
                    <View className="flex-row gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} color="#fbbf24" fill={s <= job.rating ? "#fbbf24" : "none"} />
                      ))}
                    </View>
                  </View>
                  <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Đánh giá của bạn</Text>
               </View>
               {job.review && (
                 <View className="flex-row gap-3 items-start">
                    <View className="mt-1">
                      <Quote size={18} color="#e2e8f0" fill="#f8fafc" />
                    </View>
                    <Text className="text-[14px] text-slate-600 font-medium leading-[22px] flex-1 italic">
                      {job.review}
                    </Text>
                 </View>
               )}
            </View>
          ) : (
            <TouchableOpacity 
              className="bg-primary-600 rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-sm"
              onPress={() => navigation.navigate("Review", { jobId: job.jobPostId, rateeId: job.farmerUserId })}
            >
              <Star size={18} color="#ffffff" fill="#ffffff" />
              <Text className="text-[14px] font-black text-white px-1">Đánh giá công việc ngay</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-5 pt-8 pb-4">
        <View className="flex-row items-center justify-between mb-1">
          <View>
            <Text className="text-[26px] font-black text-slate-900 leading-tight">Công việc của bạn</Text>
            <Text className="text-[14px] text-slate-500 font-medium">Báo cáo và quản lý lịch làm việc</Text>
          </View>
          <TouchableOpacity 
            className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 justify-center items-center shadow-sm" 
            onPress={() => navigation.navigate("ReportHistory")}
          >
            <ClipboardCheck size={22} color="#059669" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-4 py-2 bg-white border-b border-slate-100">
        <PillTabs
          items={[
            { key: "applied",    label: "Đã ứng tuyển", badgeCount: appliedJobs?.length || 0   },
            { key: "upcoming",   label: "Sắp tới",      badgeCount: upcomingJobs?.length || 0  },
            { key: "completed",  label: "Hoàn thành",   badgeCount: completedJobs?.length || 0 },
          ]}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabType)}
        />
      </View>

      <FlatList
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        data={listData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderItem(item)}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
        ListEmptyComponent={
          !isLoading ? (
            <Card variant="tinted" className="mt-4">
              <CardContent>
                <EmptyState
                  title={activeTab === "applied" ? "Chưa có đơn ứng tuyển" : activeTab === "upcoming" ? "Chưa có lịch sắp tới" : "Chưa có việc hoàn thành"}
                  message={activeTab === "applied" ? "Tìm và ứng tuyển công việc phù hợp với bạn." : activeTab === "upcoming" ? "Lịch làm đã xác nhận sẽ xuất hiện ở đây." : "Công việc hoàn tất sẽ hiển thị sau khi thanh toán."}
                  icon={activeTab === "completed" ? CheckCircle2 : Briefcase}
                />
              </CardContent>
            </Card>
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <View className="px-4 gap-2">
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
