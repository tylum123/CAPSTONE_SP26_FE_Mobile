import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { PillTabs, EmptyState, SkeletonCard } from "../components/ui";
import { Clock, MapPin, Banknote, Calendar, CheckCircle2, Star, ClipboardCheck, Briefcase, Info } from "lucide-react-native";
import { jobService, workerProfileService } from "../services";
import { JobPostDTO } from "../types/worker";
import { useAuth } from "../context/AuthContext";
import { isPastDate } from "../utils/helpers";
import { DEMO_JOB_POSTS, DEMO_APPLICATIONS, DEMO_WORKER_PROFILE } from "../constants/demoData";
import { mapApplicationToUI } from "../utils/mapperUtils";

type TabType = "applied" | "upcoming" | "completed";

export function WorkerJobsScreen({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || "applied");
  const { isAuthenticated, user } = useAuth();
  const [appliedJobs, setAppliedJobs]     = useState<any[]>([]);
  const [upcomingJobs, setUpcomingJobs]   = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    let sourceApps = [];
    let sourceAllJobs = [];
    let sourceProfile: any = null;

    if (!isAuthenticated || user?.isDemo) { 
      sourceApps = DEMO_APPLICATIONS;
      sourceAllJobs = DEMO_JOB_POSTS;
      sourceProfile = DEMO_WORKER_PROFILE;
    } else {
      setIsLoading(true);
      try {
        const [apps, allJobs, profile] = await Promise.all([
          jobService.getApplications(),
          jobService.getJobPosts(),
          workerProfileService.getProfile()
        ]);
        sourceApps = apps;
        sourceAllJobs = allJobs;
        sourceProfile = profile;
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

    const myAppsMap = new Map();
    sourceApps.forEach(a => {
      const workerId = a.worker?.id || (a as any).workerId;
      if (workerId === sourceProfile?.id) {
        myAppsMap.set(String(a.jobPostId), a);
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
      
      return {
        ...mappedData,
        status: derivedStatus,
        location: jobInfo?.address && jobInfo.address !== "string" ? jobInfo.address : "Hệ thống",
        wage: jobInfo?.wageAmount || (app as any).jobPost?.wageAmount || 0,
        wageType: jobInfo?.jobTypeId === 1 ? "Khoán" : "Sau công việc",
        appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("vi-VN") : "",
        completedDate: jobStatusId === 5 && jobInfo?.updatedAt ? new Date(jobInfo.updatedAt).toLocaleDateString("vi-VN") : undefined,
        paidAmount: jobStatusId === 5 ? (jobInfo?.wageAmount || 0) : 0,
        review: null,
        rating: null,
        startDate: mappedData.date,
        endDate: jobInfo?.endDate && !jobInfo.endDate.startsWith("0001") ? new Date(jobInfo.endDate).toLocaleDateString("vi-VN") : mappedData.date
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
      <TouchableOpacity className="mb-2 bg-white rounded-[20px] flex-row overflow-hidden border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
        activeOpacity={0.9} onPress={() => navigation.navigate("JobDetail", { jobId: job.jobPostId })}>
        <View className="flex-1 p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Avatar fallback={job.farmer[0]} size={42} />
            <View className="flex-1"><Text className="text-[15px] font-bold text-slate-800 mb-0.5" numberOfLines={1}>{job.title}</Text><Text className="text-xs text-slate-500">{job.farmer}</Text></View>
            <Badge variant={job.status === "accepted" ? "success" : "warning"}>{job.status === "accepted" ? "Chấp nhận" : "Chờ xác nhận"}</Badge>
          </View>
          <View className="h-px bg-slate-100 mb-2" />
          <View className="flex-row flex-wrap gap-2">
            <View className="flex-row items-center gap-1"><MapPin size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.location}</Text></View>
            <View className="flex-row items-center gap-1"><Calendar size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.startDate} - {job.endDate || job.startDate}</Text></View>
            <View className="flex-row items-center gap-1 bg-primary-50 rounded-full px-2 py-0.5 border border-primary-100"><Banknote size={13} color="#059669" /><Text className="text-xs font-bold text-primary-700">{job.wage.toLocaleString("vi-VN")}đ</Text></View>
          </View>
          <Text className="text-[11px] text-slate-400 mt-1">Đã apply: {job.appliedDate}</Text>
        </View>
      </TouchableOpacity>
    );
    if (activeTab === "upcoming") return (
      <View className="mb-2 bg-white rounded-[20px] flex-row overflow-hidden border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
        <View className="w-1 bg-teal-600" />
        <View className="flex-1 p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Avatar fallback={job.farmer[0]} size={42} />
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-slate-800 mb-0.5">{job.title}</Text>
              <View className="flex-row items-center gap-1">
                <Calendar size={12} color="#0d9488" />
                <Text className="text-xs text-teal-600 font-semibold">
                  {job.startDate} - {job.endDate || job.startDate}
                </Text>
              </View>
            </View>
            <Badge variant="success">Xác nhận</Badge>
          </View>
          <View className="h-px bg-slate-100 mb-2" />
          <View className="flex-row flex-wrap gap-2 mb-2">
            <View className="flex-row items-center gap-1"><MapPin size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.location}</Text></View>
            <View className="flex-row items-center gap-1 bg-primary-50 rounded-full px-2 py-0.5 border border-primary-100">
              <Banknote size={13} color="#059669" />
              <Text className="text-xs font-bold text-primary-700">
                {job.wage.toLocaleString("vi-VN")}đ {job.wageType === "Khoán" ? "/ khoán" : ""}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity 
              className={["flex-1 flex-row items-center justify-center rounded-2xl min-h-[42px] px-2 gap-1.5", isPastDate(job.endDate || job.startDate) ? "bg-slate-50 border border-slate-200" : "bg-primary-600"].join(" ")}
              onPress={() => navigation.navigate("SubmitReport", { jobApplicationId: String(job.id) })}
              disabled={isPastDate(job.endDate || job.startDate)}
            >
              <Text className={["text-[12px] font-bold", isPastDate(job.endDate || job.startDate) ? "text-slate-400" : "text-white"].join(" ")}>📝 Báo cáo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center bg-transparent border border-primary-600 rounded-2xl min-h-[42px] px-2 gap-1.5"
              onPress={() => navigation.navigate("Chat", { farmerId: job.farmer })}
            >
              <Text className="text-[12px] font-bold text-primary-600">💬 Nhắn tin</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center bg-primary-50 rounded-2xl min-h-[42px] px-2 gap-1.5"
              onPress={() => navigation.navigate("JobDetail", { jobId: job.jobPostId })}
            >
              <Info size={14} color="#059669" />
              <Text className="text-[12px] font-bold text-primary-700">Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
    // completed
    return (
      <View className="mb-2 bg-white rounded-[20px] flex-row overflow-hidden border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
        <View className="w-1 bg-primary-400" />
        <View className="flex-1 p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-[42px] h-[42px] rounded-full bg-primary-50 justify-center items-center"><CheckCircle2 size={24} color="#059669" /></View>
            <View className="flex-1"><Text className="text-[15px] font-bold text-slate-800 mb-0.5">{job.title}</Text><Text className="text-xs text-slate-500">{job.farmer} • {job.completedDate}</Text></View>
            <Badge variant="success">Xong</Badge>
          </View>
          <View className="h-px bg-slate-100 mb-2" />
          <View className="flex-row flex-wrap gap-2 mb-2">
            <View className="flex-row items-center gap-1"><MapPin size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.location}</Text></View>
            <View className="flex-row items-center gap-1 bg-primary-50 rounded-full px-2 py-0.5 border border-primary-100"><Banknote size={13} color="#059669" /><Text className="text-xs font-bold text-primary-700">{job.paidAmount.toLocaleString("vi-VN")}đ</Text></View>
          </View>
          {job.rating && job.review ? (
            <View className="bg-rice-50 border border-rice-200 rounded-xl p-2 gap-1.5">
              <View className="flex-row gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={14} color="#fbbf24" fill={i < job.rating ? "#fbbf24" : "none"} />)}</View>
              <Text className="text-[13px] text-slate-700 italic">"{job.review}"</Text>
            </View>
          ) : (
            <Button variant="ghost" size="sm" onPress={() => navigation.navigate("Review", { jobId: job.jobPostId })}>Đánh giá công việc ⭐</Button>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-slate-100">
        <View>
          <Text className="text-xl font-extrabold text-slate-900" style={{ letterSpacing: -0.3 }}>Công việc của bạn</Text>
          <Text className="text-xs text-slate-400 mt-0.5">Quản lý ứng tuyển và lịch làm việc</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-primary-50 border border-primary-200 justify-center items-center" onPress={() => navigation.navigate("ReportHistory")}>
          <ClipboardCheck size={18} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="px-4 py-2 bg-white border-b border-slate-100">
        <PillTabs
          items={[
            { key: "applied",    label: "Đã apply",    badgeCount: appliedJobs.length   },
            { key: "upcoming",   label: "Sắp tới",     badgeCount: upcomingJobs.length  },
            { key: "completed",  label: "Hoàn thành",  badgeCount: completedJobs.length },
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
                  title={activeTab === "applied" ? "Chưa có đơn apply" : activeTab === "upcoming" ? "Chưa có lịch sắp tới" : "Chưa có việc hoàn thành"}
                  message={activeTab === "applied" ? "Tìm và apply công việc phù hợp với bạn." : activeTab === "upcoming" ? "Lịch làm đã xác nhận sẽ xuất hiện ở đây." : "Công việc hoàn tất sẽ hiển thị sau khi thanh toán."}
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
