import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl, ActivityIndicator, Alert,
  DeviceEventEmitter,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Clock, Banknote, Star, Calendar, Users, Wrench, Briefcase, MessageCircle, ArrowLeft, CheckCircle } from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { authService, jobService, workerProfileService, notificationService, reportService } from "../services";
import { useAuth } from "../context/AuthContext";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { isPastDate } from "../utils/helpers";
import { DEMO_JOB_POSTS, DEMO_APPLICATIONS, DEMO_WORKER_PROFILE } from "../constants/demoData";
import { mapJobPostToUI } from "../utils/mapperUtils";

export function JobDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { jobId } = route.params;
  const { isAuthenticated, user } = useAuth();
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationInfo, setApplicationInfo] = useState<{ id?: string; statusId?: number }>({});
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const [jobDetail, setJobDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobData = useCallback(async () => {
    setIsLoading(true);
    let sourceJob: any = null;
    let sourceApps: any[] = [];
    let sourceProfile: any = null;

    if (!isAuthenticated || user?.isDemo) {
      sourceJob = DEMO_JOB_POSTS.find((j: any) => String(j.id) === String(jobId));
      sourceApps = DEMO_APPLICATIONS;
      sourceProfile = DEMO_WORKER_PROFILE;
    } else {
      try {
        const [data, apps, profile] = await Promise.all([
          jobService.getJobPostDetail(String(jobId)),
          jobService.getApplications(),
          workerProfileService.getProfile()
        ]);
        sourceJob = data;
        sourceApps = apps;
        sourceProfile = profile;
      } catch (error) {
        console.error("Load job detail error:", error);
        setJobDetail(null);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
    }

    if (sourceJob) {
      const existing = sourceApps.find((a: any) => 
        String(a.jobPostId) === String(jobId) && 
        (a.worker?.id === sourceProfile?.id || (a as any).workerId === sourceProfile?.id)
      );

      if (existing && existing.statusId !== 3) {
        setIsApplied(true);
        setApplicationInfo({ id: existing.id, statusId: existing.statusId });
        // Pre-populate selected slots from existing application
        if (existing.workDates && existing.workDates.length > 0) {
          // Normalize to YYYY-MM-DD for consistent internal state
          setSelectedTimeSlots(existing.workDates.map((d: string) => d.substring(0, 10)));
        }
      } else {
        setIsApplied(false);
        setApplicationInfo({});
        setSelectedTimeSlots([]);
      }

      // Fetch Reports for this job
      let reports: any[] = [];
      try {
        if (isAuthenticated && !user?.isDemo && sourceProfile?.id) {
          const allWorkerReports = await reportService.getWorkerReports(sourceProfile.id);
          reports = allWorkerReports.filter(r => String(r.jobPostId) === String(jobId));
        } else if (user?.isDemo || !isAuthenticated) {
          // Mock some reports for demo
          reports = [
            { id: "r1", workDate: "2026-03-22T08:00:00Z", farmerApprovedPercent: 100, workerPaymentAmount: 250000, farmerFeedback: "Làm tốt lắm!" },
            { id: "r2", workDate: "2026-03-23T08:00:00Z", farmerApprovedPercent: 80, workerPaymentAmount: 200000, farmerFeedback: "Cần chú ý hơn phần làm cỏ." }
          ];
        }
      } catch (err) {
        console.error("Fetch reports error", err);
      }

      const mappedData = mapJobPostToUI(sourceJob);
      const timeSlots = (sourceJob.jobTypeId === 1) ? [] : (sourceJob.selectedDays || []).map((dateStr: string, index: number) => {
        const formattedSlotDate = new Date(dateStr).toLocaleDateString("vi-VN");
        return {
          id: index + 1,
          date: formattedSlotDate,
          rawDate: dateStr.substring(0, 10),
          available: true,
          reportedAt: reports.find(r => r.workDate.includes(dateStr.substring(0, 10)))?.workDate
        };
      });

      // Special case for backward compatibility or if selectedDays is empty for Daily jobs
      if (sourceJob.jobTypeId !== 1 && timeSlots.length === 0) {
        timeSlots.push({
          id: 1,
          date: mappedData.startDateFormatted,
          rawDate: sourceJob.startDate,
          available: true,
          reportedAt: reports.find(r => r.workDate.includes(sourceJob.startDate?.substring(0, 10)))?.workDate
        });
      }

      const mapped = {
        ...mappedData,
        reports: reports.sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()),
        timeSlots
      };
      setJobDetail(mapped as any);
    } else {
      setJobDetail(null);
    }
    
    setIsLoading(false);
    setRefreshing(false);
  }, [isAuthenticated, user?.isDemo, jobId]);

  useEffect(() => {
    loadJobData();
    
    // Auto-refresh when push notification is received in foreground
    const subscription = DeviceEventEmitter.addListener("REFRESH_DATA", () => {
      loadJobData();
    });
    return () => subscription.remove();
  }, [loadJobData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobData();
  };

  const toggleTimeSlot = (slotId: number) => {
    if (isApplied) return; // Cannot change selection after applying
    const slot = jobDetail.timeSlots.find((s: any) => s.id === slotId);
    if (!slot?.available) return;
    const key = String(slot.rawDate || slot.date).substring(0, 10);
    setSelectedTimeSlots((p: string[]) => p.some((s: string) => s.substring(0, 10) === key) 
      ? p.filter((s: string) => s.substring(0, 10) !== key) 
      : [...p, key]);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickApply = async () => {
    if (!isAuthenticated || user?.isDemo) {
      if (selectedTimeSlots.length === 0) { alert("Vui lòng chọn ít nhất một khung giờ"); return; }
      alert(`Đã apply mẫu thành công cho ${selectedTimeSlots.length} khung giờ!`);
      navigation.goBack();
      return;
    }

    setIsSubmitting(true);
    try {
      const isDailyJob = jobDetail?.timeSlots && jobDetail.timeSlots.length > 0;
      
      if (isDailyJob && selectedTimeSlots.length === 0) {
        Alert.alert("Thông báo", "Vui lòng chọn ít nhất một ngày làm việc.");
        setIsSubmitting(false);
        return;
      }

      // Ensure dates are sent as UTC-compliant ISO strings to avoid Npgsql timestamp kind exceptions
      const workDates = isDailyJob 
        ? selectedTimeSlots.map(date => date.includes('T') ? date : `${date}T00:00:00Z`)
        : [];

      await jobService.applyJob({
        jobPostId: jobId, // Use jobId from route params
        statusId: 1, // Pending
        coverLetter: "Tôi rất mong muốn được nhận công việc này.",
        appliedAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
        responseMessage: null,
        workDates: workDates, // Include selected days formatted as UTC
      });
      setIsApplied(true);
      DeviceEventEmitter.emit("REFRESH_DATA");
      Alert.alert("Thành công", "Đã gửi đơn ứng tuyển!");
      showFeedback({ 
        title: "Thành công", 
        message: "Bạn đã gửi đơn ứng tuyển thành công. Vui lòng chờ phản hồi từ farmer.", 
        variant: "success", 
        onConfirm: () => navigation.goBack() 
      });
    } catch (error: any) {
      console.error("Apply error:", error);
      const apiErrorMessage = error.response?.data?.message || "";
      Alert.alert("Lỗi", `Không thể gửi đơn ứng tuyển. ${apiErrorMessage}`.trim() || "Vui lòng thử lại.");
      showFeedback({ 
        title: "Lỗi ứng tuyển", 
        message: error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.", 
        variant: "error" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoRows = useMemo(() => {
    if (!jobDetail) return [];
    return [
      { Icon: MapPin,    label: "Địa điểm",        value: jobDetail.location?.address, hint: jobDetail.location?.distance ? `Cách bạn ${jobDetail.location.distance} km` : "" },
      { Icon: Clock,     label: "Thời gian",        value: jobDetail.duration },
      { Icon: Briefcase, label: "Khối lượng",       value: (jobDetail as any).workload || "N/A" },
      { Icon: Users,     label: "Số người tuyển",   value: `${jobDetail.requiredWorkers || 0} người (đã có ${jobDetail.appliedWorkers || 0})` },
      { Icon: Wrench,    label: "Kỹ năng yêu cầu",  value: jobDetail.requiredSkills || "Không yêu cầu" },
      { Icon: Users,     label: "Giới tính",         value: jobDetail.genderPreference || "Không yêu cầu" },
      { Icon: Calendar,  label: "Độ tuổi",           value: jobDetail.ageRequirement || "Không yêu cầu" },
      { Icon: Banknote,  label: "Hình thức lương",   value: jobDetail.wageTypeId || "N/A" },
      { Icon: Briefcase, label: "Thanh toán",        value: jobDetail.paymentMethodId || "N/A" },
    ];
  }, [jobDetail]);

  // FIX SCROLL WEB: Trên React Native Web, flex:1 không đủ để giới hạn chiều cao.
  // Container cha phải có chiều cao tường minh (100vh) thì ScrollView mới có thể scroll.
  // Trên mobile, SafeAreaView hoặc NavigationStack đã cấp sẵn chiều cao cố định nên không cần.
  const rootStyle = Platform.OS === 'web'
    ? { height: '100vh' as any, display: 'flex' as any, flexDirection: 'column' as any, backgroundColor: '#f0fdf4' }
    : { flex: 1, backgroundColor: '#f0fdf4' };
  const scrollStyle = Platform.OS === 'web'
    ? { flex: 1, overflowY: 'scroll' as any }
    : { flex: 1 };

  return (
    <View style={rootStyle}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 pb-2 bg-white border-b border-slate-100" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 justify-center items-center" onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">Chi tiết công việc</Text>
        <View className="w-10" />
      </View>

      {/* NOTE: overflowY: 'scroll' bắt buộc phải có trên React Native Web để kéo cuộn hoạt động */}
      {isLoading ? (
        <View style={[scrollStyle, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : !jobDetail ? (
        <View style={[scrollStyle, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
          <Text className="text-slate-500 font-medium text-center">Không tìm thấy thông tin công việc hoặc có lỗi xảy ra.</Text>
          <Button variant="outline" onPress={loadJobData} className="mt-4">Thử lại</Button>
        </View>
      ) : (
        <>
          <ScrollView
            style={scrollStyle}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
          >
            {/* JOB HERO */}
        <View className="bg-white rounded-[20px] p-6 mb-4 border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          {jobDetail.jobType ? (
            <View className="self-start mb-2">
              <Badge variant={jobDetail.urgent ? "danger" : "success"}>{jobDetail.urgent ? "🔥 Cần gấp" : jobDetail.jobType}</Badge>
            </View>
          ) : null}
          <Text className="text-[22px] font-extrabold text-slate-900 mb-1" style={{ letterSpacing: -0.4 }}>{jobDetail.title}</Text>
          <Text className="text-[13px] text-slate-500 mb-4">{jobDetail.location.address}</Text>
          <View className="flex-row items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
            <Calendar size={18} color="#64748b" />
            <View>
              <Text className="text-[10px] text-slate-400 uppercase font-bold" style={{ letterSpacing: 0.5 }}>Ngày làm việc</Text>
              <Text className="text-[14px] text-slate-700 font-bold">{jobDetail.startDate} - {jobDetail.endDate || jobDetail.startDate}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 bg-primary-50 rounded-2xl p-4 border border-primary-100">
            <View className="flex-row items-center gap-2">
              <Banknote size={20} color="#059669" />
              <Text className="text-[28px] font-extrabold text-primary-700" style={{ letterSpacing: -0.5 }}>
                {jobDetail.wage.toLocaleString("vi-VN")}<Text className="text-lg font-semibold"> đ</Text>
              </Text>
            </View>
            <Text className="text-sm text-slate-500">/ {jobDetail.wageTypeId || "ngày"}</Text>
          </View>
        </View>

        {/* FARMER CARD */}
        {(!isAuthenticated || user?.isDemo) ? (
          <View className="bg-white rounded-[20px] flex-row items-center p-4 mb-4 gap-4 border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
            <Avatar source={{ uri: jobDetail.farmer.avatar }} size={50} />
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-slate-800 mb-1">{jobDetail.farmer.name}</Text>
              <View className="flex-row items-center gap-1">
                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-[13px] font-bold text-slate-700">{jobDetail.farmer.rating}</Text>
                <Text className="text-[13px] text-slate-500">• {jobDetail.farmer.totalJobs} công việc</Text>
              </View>
            </View>
            <TouchableOpacity className="w-[42px] h-[42px] rounded-full bg-primary-50 border border-primary-200 justify-center items-center" onPress={() => navigation.navigate("Chat", { farmerId: jobDetail.farmer.name })}>
              <MessageCircle size={18} color="#059669" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-white rounded-[20px] flex-row items-center p-4 mb-4 gap-4 border border-slate-100">
            <Avatar fallback={jobDetail.farmer?.name?.[0] || "C"} size={50} />
            <View className="flex-1"><Text className="text-[15px] font-bold text-slate-800">{jobDetail.farmer?.name || "Chủ nông trại"}</Text></View>
            <TouchableOpacity className="w-[42px] h-[42px] rounded-full bg-primary-50 border border-primary-200 justify-center items-center">
              <MessageCircle size={18} color="#059669" />
            </TouchableOpacity>
          </View>
        )}

        {/* DESCRIPTION */}
        <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
          <Text className="text-base font-bold text-slate-800 mb-4" style={{ letterSpacing: -0.2 }}>Mô tả công việc</Text>
          <Text className="text-sm text-slate-600 leading-[22px]">{jobDetail.description}</Text>
        </View>

        {/* INFO GRID */}
        <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
          <Text className="text-base font-bold text-slate-800 mb-4" style={{ letterSpacing: -0.2 }}>Thông tin chi tiết</Text>
          <View className="gap-3">
            {infoRows.map((row: any, i: number) => (
              <View key={i} className="flex-row items-start gap-2">
                <View className="w-[34px] h-[34px] rounded-lg bg-primary-50 justify-center items-center flex-shrink-0">
                  <row.Icon size={16} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] text-slate-400 font-semibold uppercase mb-0.5" style={{ letterSpacing: 0.4 }}>{row.label}</Text>
                  <Text className="text-sm text-slate-700 font-semibold">{row.value}</Text>
                  {row.hint && <Text className="text-xs text-primary-600 mt-0.5">{row.hint}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* REQUIREMENTS */}
        {jobDetail.requiredTools?.length > 0 && (
          <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
            <Text className="text-base font-bold text-slate-800 mb-4" style={{ letterSpacing: -0.2 }}>Yêu cầu công việc</Text>
            <View className="gap-2">
              {jobDetail.requiredTools.map((tool: any, i: number) => (
                <View key={`r-${i}`} className="flex-row items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <View className="w-5 h-5 rounded-full bg-amber-200 justify-center items-center">
                    <Wrench size={10} color="#92400e" />
                  </View>
                  <Text className="flex-1 text-[13px] text-slate-700 font-medium">{tool}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PRIVILEGES */}
        {jobDetail.providedTools?.length > 0 && (
          <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
            <Text className="text-base font-bold text-slate-800 mb-4" style={{ letterSpacing: -0.2 }}>Quyền lợi người lao động</Text>
            <View className="gap-2">
              {jobDetail.providedTools.map((tool: any, i: number) => (
                <View key={`p-${i}`} className="flex-row items-center gap-2 p-3 bg-primary-50 border border-primary-100 rounded-xl">
                  <View className="w-5 h-5 rounded-full bg-primary-200 justify-center items-center">
                    <CheckCircle size={10} color="#065f46" />
                  </View>
                  <Text className="flex-1 text-[13px] text-slate-700 font-medium">{tool}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TIME SLOTS / REPORTING */}
        {applicationInfo.statusId === 2 && (
          <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
            <Text className="text-base font-bold text-slate-800 mb-1" style={{ letterSpacing: -0.2 }}>Báo cáo chi tiết</Text>
            <Text className="text-[13px] text-slate-400 mb-4">Lịch sử báo cáo và tiến độ được duyệt</Text>
            
            <View className="gap-3">
              {jobDetail.reports?.length > 0 ? (
                jobDetail.reports.map((report: any, i: number) => (
                  <View key={report.id || i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <Text className="text-sm font-bold text-slate-800">{new Date(report.workDate).toLocaleDateString("vi-VN")}</Text>
                        <Text className="text-[11px] text-slate-500 mt-0.5">{report.workerDescription || "Báo cáo công việc hàng ngày"}</Text>
                      </View>
                      <Badge variant={report.farmerApprovedPercent === 100 ? "success" : report.farmerApprovedPercent > 0 ? "warning" : "secondary"}>
                        {report.farmerApprovedPercent === 100 ? "Đã duyệt 100%" : report.farmerApprovedPercent > 0 ? `Đã duyệt ${report.farmerApprovedPercent}%` : "Chờ duyệt"}
                      </Badge>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                      <View 
                        className="h-full bg-primary-500" 
                        style={{ width: `${report.farmerApprovedPercent || 0}%` }} 
                      />
                    </View>

                    <View className="flex-row justify-between items-center bg-white px-3 py-2 rounded-xl">
                      <View className="flex-row items-center gap-1.5">
                        <Banknote size={14} color="#059669" />
                        <Text className="text-xs text-slate-600 font-medium">Lương nhận:</Text>
                      </View>
                      <Text className="text-sm font-extrabold text-primary-600">
                        {report.workerPaymentAmount ? `${report.workerPaymentAmount.toLocaleString("vi-VN")}₫` : "---"}
                      </Text>
                    </View>
                    
                    {report.farmerFeedback && (
                      <View className="mt-3 bg-amber-50 p-2.5 rounded-xl border border-amber-100 flex-row gap-2">
                        <MessageCircle size={14} color="#d97706" />
                        <Text className="flex-1 text-[11px] text-amber-800 leading-4 italic">"{report.farmerFeedback}"</Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View className="py-8 items-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock size={24} color="#cbd5e1" className="mb-2" />
                  <Text className="text-sm text-slate-400">Chưa có báo cáo nào được gửi</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {jobDetail.wageTypeId !== "Khoán" && applicationInfo.statusId !== 2 && (
          <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
            <Text className="text-base font-bold text-slate-800 mb-1" style={{ letterSpacing: -0.2 }}>Chọn khung giờ</Text>
            <Text className="text-[13px] text-slate-400 mb-4">Bạn muốn làm việc vào những ngày nào?</Text>
            <View className="gap-2.5">
              {jobDetail.timeSlots.map((slot: any) => {
                const key = String(slot.rawDate || slot.date).substring(0, 10);
                const selected = selectedTimeSlots.some(s => s.substring(0, 10) === key);
                const isSelectedAndApplied = isApplied && selected;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    className={[
                      "flex-row items-center gap-2 p-4 rounded-2xl border-2", 
                      !slot.available ? "bg-slate-50 border-slate-100" : 
                      isSelectedAndApplied ? "bg-green-50 border-green-200" :
                      selected ? "bg-primary-600 border-primary-700" : 
                      "bg-white border-slate-200"
                    ].join(" ")}
                    onPress={() => toggleTimeSlot(slot.id)}
                    disabled={!slot.available || isApplied}
                    activeOpacity={0.85}
                  >
                    <Calendar size={18} color={isSelectedAndApplied ? "#059669" : selected ? "#ffffff" : slot.available ? "#059669" : "#cbd5e1"} />
                    <Text className={[
                      "text-[15px] font-bold", 
                      isSelectedAndApplied ? "text-green-700" :
                      selected ? "text-white" : 
                      !slot.available ? "text-slate-300" : 
                      "text-slate-800"
                    ].join(" ")}>{slot.date}</Text>
                    
                    {!slot.available && <Badge variant="secondary">Đã đủ</Badge>}
                    {isSelectedAndApplied && (
                      <View className="ml-auto bg-green-100 px-2 py-1 rounded-lg border border-green-200">
                        <Text className="text-[10px] font-bold text-green-700 uppercase">✓ Đã ứng tuyển</Text>
                      </View>
                    )}
                    
                    {selected && !isApplied && (
                      <View className="ml-auto w-6 h-6 rounded-full bg-white justify-center items-center">
                        <Text className="text-sm font-extrabold text-primary-600">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
            <View style={{ height: 120 }} />
          </ScrollView>

          {/* FOOTER */}
          <View className="flex-row items-center gap-4 px-4 pt-4 bg-white border-t border-slate-100" style={{ paddingBottom: insets.bottom + 8, shadowColor: "#0f172a", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 }}>
            <View className="flex-1">
              <Text className="text-xs text-slate-500">Thu nhập dự kiến</Text>
              <Text className="text-[22px] font-extrabold text-primary-700">
                {(jobDetail.wage * (selectedTimeSlots.length || 1)).toLocaleString("vi-VN")} đ
              </Text>
              {selectedTimeSlots.length > 0 && (
                <Text className="text-xs text-slate-400">
                  {selectedTimeSlots.length} khung giờ {isApplied ? "(Đã ứng tuyển)" : ""}
                </Text>
              )}
            </View>
            
            {applicationInfo.statusId === 2 ? (
              <Button 
                onPress={() => navigation.navigate("SubmitReport", { jobApplicationId: applicationInfo.id })}
                size="lg"
                variant="default"
                disabled={isPastDate(jobDetail.endDate || jobDetail.startDate) || !!jobDetail.timeSlots.find((s: any) => s.date === "23/03/2026" && s.reportedAt)}
              >
                {!!jobDetail.timeSlots.find((s: any) => s.date === "23/03/2026" && s.reportedAt) 
                  ? "Đã báo cáo hôm nay" 
                  : "Nộp Báo Cáo (Hôm nay)"}
              </Button>
            ) : (
              <Button 
                onPress={handleQuickApply} 
                disabled={isApplied || isSubmitting || (jobDetail.wageTypeId !== "Khoán" && selectedTimeSlots.length === 0)} 
                size="lg"
                variant={isApplied ? "ghost" : "default"}
              >
                {isSubmitting ? "Đang gửi..." : isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
              </Button>
            )}
          </View>
        </>
      )}

      <FeedbackModal
        visible={feedback.visible}
        title={feedback.title}
        message={feedback.message}
        variant={feedback.variant}
        onClose={closeFeedback}
        onConfirm={feedback.onConfirm}
      />
    </View>
  );
}
