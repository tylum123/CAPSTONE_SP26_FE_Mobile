import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { PillTabs, EmptyState } from "../components/ui";
import { Clock, MapPin, Banknote, Calendar, CheckCircle2, Star, ClipboardCheck } from "lucide-react-native";
import { jobService, JobPostDTO, workerProfileService } from "../services";
import { useAuth } from "../context/AuthContext";
import { isPastDate } from "../utils/helpers";

type TabType = "applied" | "upcoming" | "completed";

export function WorkerJobsScreen({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || "applied");
  const { isAuthenticated, user } = useAuth();
  const [appliedJobs, setAppliedJobs]     = useState<any[]>([]);
  const [upcomingJobs, setUpcomingJobs]   = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);

  const demoApplied = [
    { id: 1001, jobPostId: 201, title: "Hái cà phê",    farmer: "Trần Văn D",      location: "An Giang",   date: "18/01/2026", time: "07:00 - 16:00", wage: 180000, status: "pending",  appliedDate: "15/01/2026" },
    { id: 1002, jobPostId: 202, title: "Thu hoạch rau", farmer: "Nguyễn Văn E",    location: "Đồng Tháp", date: "15/01/2026", time: "08:00 - 17:00", wage: 200000, status: "rejected", appliedDate: "12/01/2026" },
  ];
  const demoUpcoming = [
    { id: 1003, jobPostId: 301, title: "Tưới nước vườn cam",  farmer: "Lê Thị C",    location: "Vĩnh Long", startDate: "23/03/2026", endDate: "23/03/2026", wage: 150000, status: "accepted", wageType: "Ngày" },
    { id: 1004, jobPostId: 302, title: "Phun thuốc vườn cam", farmer: "Trần Văn F",   location: "Cần Thơ",   startDate: "26/03/2026", endDate: "28/03/2026", wage: 200000, status: "accepted", wageType: "Ngày" },
    { id: 1099, jobPostId: 501, title: "Gặt lúa khoán mẫu lớn", farmer: "Trần Văn C",  location: "Hậu Giang",  startDate: "25/03/2026", endDate: "30/03/2026", wage: 5000000, status: "accepted", wageType: "Khoán" },
  ];
  const demoCompleted = [
    { id: 1005, jobPostId: 401, title: "Làm cỏ vườn mít",      farmer: "Nguyễn Văn A", location: "Cần Thơ",   completedDate: "20/01/2026", wage: 250000, rating: 5, review: "Công việc tốt, người thuê nhiệt tình",    paidAmount: 250000, status: "completed" },
  ];

  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    if (!isAuthenticated || user?.isDemo) { 
      setAppliedJobs(demoApplied); 
      setUpcomingJobs(demoUpcoming); 
      setCompletedJobs(demoCompleted); 
      setRefreshing(false);
      return; 
    }
    try {
        // NOTE: BE hiện tại chưa Join Metadata (JobTitle, FarmName) vào JobApplicationDTO
        // Giải pháp: Fetch tất cả JobPosts và WorkerProfile để Map ngược lại thông tin.
        const [apps, allJobs, profile] = await Promise.all([
          jobService.getApplications(),
          jobService.getJobPosts(),
          workerProfileService.getProfile()
        ]);

        // 1. Lọc chỉ lấy đơn ứng tuyển của chính worker hiện tại
        // 2. Deduplicate: Nếu có nhiều application cho cùng 1 job, chỉ lấy cái mới nhất
        const myAppsMap = new Map();
        apps.forEach(a => {
          const workerId = a.worker?.id || (a as any).workerId;
          if (workerId === profile.id) {
            myAppsMap.set(String(a.jobPostId), a);
          }
        });
        
        const myApps = Array.from(myAppsMap.values());

        const mappedApps = myApps.map((app) => {
          const jobInfo = allJobs.find(j => String(j.id) === String(app.jobPostId));
          const jobStatusId = (jobInfo as any)?.statusId || 2; // Default to published if undefined
          
          let derivedStatus = "unknown";
          if (app.statusId === 1 || app.statusId === 3 || app.statusId === 4) {
             derivedStatus = app.statusId === 1 ? "pending" : app.statusId === 3 ? "rejected" : "cancelled";
          } else if (app.statusId === 2) {
             // App accepted. Check JobPost status to see if it's completed
             if (jobStatusId === 5) {
               derivedStatus = "completed";
             } else if (jobStatusId === 6) {
               derivedStatus = "cancelled";
             } else {
               derivedStatus = "accepted"; // covers Published, Closed, InProgress
             }
          }

          const startDate = jobInfo?.startDate;
          const formattedDate = (startDate && !startDate.startsWith("0001")) 
            ? new Date(startDate).toLocaleDateString("vi-VN") 
            : "Chưa rõ";

          return {
            id: app.id,
            jobPostId: app.jobPostId,
            title: jobInfo?.title || "Đơn ứng tuyển",
            farmer: jobInfo?.contactName || "Chủ nông trại",
            location: jobInfo?.address && jobInfo.address !== "string" ? jobInfo.address : "Hệ thống",
            date: formattedDate,
            time: jobInfo?.estimatedHours ? `${jobInfo.estimatedHours} giờ` : "",
            wage: jobInfo?.wageAmount || (app as any).jobPost?.wageAmount || 0,
            wageType: jobInfo?.wageTypeId === 2 || (jobInfo?.wageTypeId as any) === "2" ? "Khoán" : "Ngày",
            status: derivedStatus,
            appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("vi-VN") : "",
            completedDate: jobStatusId === 5 && jobInfo?.updatedAt ? new Date(jobInfo.updatedAt).toLocaleDateString("vi-VN") : undefined,
            paidAmount: jobStatusId === 5 ? (jobInfo?.wageAmount || 0) : 0,
            review: null,
            rating: null,
            startDate: formattedDate, // Added for UI consistence
            endDate: jobInfo?.endDate && !jobInfo.endDate.startsWith("0001") ? new Date(jobInfo.endDate).toLocaleDateString("vi-VN") : formattedDate
          };
        });

        // Phân rã dữ liệu vào đúng cấu trúc Tab
        setAppliedJobs(mappedApps.filter(a => a.status === "pending" || a.status === "rejected"));
        setUpcomingJobs(mappedApps.filter(a => a.status === "accepted")); 
        setCompletedJobs(mappedApps.filter(a => a.status === "completed"));
      } catch { 
        setAppliedJobs([]); 
        setUpcomingJobs([]); 
        setCompletedJobs([]); 
      } finally {
        setRefreshing(false);
      }
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
          <View className="flex-row gap-2 flex-wrap">
            <Button variant="outline" size="sm" onPress={() => navigation.navigate("Chat", { farmerId: job.farmer })}>💬 Nhắn tin</Button>
            <Button 
              variant="outline" 
              size="sm" 
              onPress={() => navigation.navigate("SubmitReport", { jobApplicationId: String(job.id) })}
              disabled={isPastDate(job.endDate || job.startDate)}
            >
              📝 Báo cáo
            </Button>
            <Button size="sm" onPress={() => navigation.navigate("JobDetail", { jobId: job.jobPostId })}>Chi tiết</Button>
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
          <Card variant="tinted" className="mt-4">
            <CardContent>
              <EmptyState
                title={activeTab === "applied" ? "Chưa có đơn apply" : activeTab === "upcoming" ? "Chưa có lịch sắp tới" : "Chưa có việc hoàn thành"}
                description={activeTab === "applied" ? "Tìm và apply công việc phù hợp với bạn." : activeTab === "upcoming" ? "Lịch làm đã xác nhận sẽ xuất hiện ở đây." : "Công việc hoàn tất sẽ hiển thị sau khi thanh toán."}
              />
            </CardContent>
          </Card>
        }
      />
    </SafeAreaView>
  );
}
