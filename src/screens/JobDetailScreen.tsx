import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl, ActivityIndicator, DeviceEventEmitter } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Clock, Banknote, Star, Calendar, Users, Wrench, Briefcase, MessageCircle, ArrowLeft, CheckCircle } from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { jobService, JobPostDTO } from "../services";
import { useAuth } from "../context/AuthContext";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { isPastDate } from "../utils/helpers";

export function JobDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { jobId } = route.params;
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const { isAuthenticated, user } = useAuth();
  const [isApplied, setIsApplied] = useState(false);
  const [applicationInfo, setApplicationInfo] = useState<{ id?: string; statusId?: number }>({});
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const demoJobDetail = {
    id: jobId,
    title: "Thu hoạch lúa mùa",
    description: "Cần tuyển người thu hoạch lúa cho 5 mẫu ruộng. Công việc bao gồm: gặt lúa, phơi lúa, và vận chuyển vào kho. Yêu cầu có kinh nghiệm làm việc ngoài trời và chịu khó.",
    farmer: { name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=12", rating: 4.8, totalJobs: 45 },
    location: { address: "Ấp Tân Thạnh, xã Tân Lộc, huyện Thốt Nốt, TP. Cần Thơ", distance: 2.5 },
    wage: 250000, duration: "1 ngày", workload: "5 mẫu ruộng (~2000m²)",
    requiredWorkers: 5, appliedWorkers: 2, requiredSkills: "Thu hoạch, Vận chuyển",
    genderPreference: "Không yêu cầu", ageRequirement: "18-55",
    wageTypeId: "Theo ngày", paymentMethodId: "Tiền mặt",
    requiredTools: ["Liềm cắt lúa", "Găng tay bảo hộ", "Nón lá", "Bao tải đựng lúa"],
    providedTools: ["Máy gặt lúa", "Xe vận chuyển"],
    timeSlots: [
      { id: 1, date: "20/03/2026", available: true, reportedAt: null as string | null },
      { id: 2, date: "21/03/2026", available: true, reportedAt: "21/03/2026 18:05" },
      { id: 3, date: "23/03/2026", available: true, reportedAt: null as string | null },
      { id: 4, date: "26/03/2026", available: true, reportedAt: null as string | null },
    ],
    jobType: "Thu hoạch", urgent: true, postedDate: "20/01/2026",
    startDate: "23/03/2026",
    endDate: "26/03/2026",
    date: "23/03/2026",
  };
  const emptyJobDetail = { ...demoJobDetail, title: "", description: "", location: { ...demoJobDetail.location, address: "", distance: 0 }, wage: 0, duration: "", workload: "", requiredWorkers: 0, appliedWorkers: 0, requiredSkills: "", genderPreference: "", ageRequirement: "", wageTypeId: "", paymentMethodId: "", jobType: "", urgent: false, postedDate: "", startDate: "", endDate: "", date: "" };

  const getDemoData = (idStr: string) => {
    let base = { ...demoJobDetail, id: idStr }; // Start with default realistic data, just override specifics
    let appInfo: { id: string; statusId: number } | null = null;
    let isAppliedMock = false;

    if (idStr === "201") {
      base.title = "Hái cà phê";
      base.startDate = "18/01/2026";
      base.endDate = "18/01/2026";
      appInfo = { id: "1001", statusId: 1 }; // Pending
      isAppliedMock = true;
    } else if (idStr === "202") {
      base.title = "Thu hoạch rau";
      base.startDate = "15/01/2026";
      base.endDate = "15/01/2026";
      appInfo = { id: "1002", statusId: 3 }; // Rejected
      isAppliedMock = true;
    } else if (idStr === "301") {
      base.title = "Tưới nước vườn cam";
      base.startDate = "23/03/2026";
      base.endDate = "23/03/2026";
      appInfo = { id: "1003", statusId: 2 }; // Accepted
      isAppliedMock = true;
    } else if (idStr === "302") {
      base.title = "Phun thuốc vườn cam";
      base.startDate = "26/03/2026";
      base.endDate = "28/03/2026";
      appInfo = { id: "1004", statusId: 2 }; // Accepted
      isAppliedMock = true;
    } else if (idStr === "401") {
      base.title = "Làm cỏ vườn mít";
      base.startDate = "20/02/2026";
      base.endDate = "20/02/2026";
      appInfo = { id: "1005", statusId: 2 }; // Accepted
      isAppliedMock = true;
    } else if (idStr === "501") {
      base.title = "Gặt lúa khoán mẫu lớn";
      base.wageTypeId = "Khoán";
      base.wage = 5000000;
      base.duration = "5 ngày";
      base.workload = "10 mẫu ruộng";
      base.startDate = "25/03/2026";
      base.endDate = "30/03/2026";
      base.timeSlots = []; // No slots for Khoán
      appInfo = { id: "1006", statusId: 2 }; // Accepted
      isAppliedMock = true;
    } else if (idStr === "502") {
      base.title = "Hái tiêu khoán";
      base.wageTypeId = "Khoán";
      base.wage = 2000000;
      base.duration = "2 ngày";
      base.workload = "20 gốc tiêu";
      base.startDate = "28/03/2026";
      base.endDate = "29/03/2026";
      base.timeSlots = [];
      appInfo = null;
      isAppliedMock = false;
    } else {
      base.title = idStr === "101" ? "Thu hoạch lúa" : "Công việc mẫu (Chưa ứng tuyển)";
      base.startDate = "23/03/2026";
      base.endDate = "26/03/2026";
    }

    return { jobData: base, appInfo, isAppliedMock };
  };

  const [jobDetail, setJobDetail] = useState(emptyJobDetail);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobData = useCallback(async () => {
    if (!isAuthenticated || user?.isDemo) { 
      const { jobData, appInfo, isAppliedMock } = getDemoData(String(jobId));
      setJobDetail(jobData); 
      if (appInfo) setApplicationInfo(appInfo);
      setIsApplied(isAppliedMock);
      setIsLoading(false);
      setRefreshing(false);
      return; 
    }
    try {
      const [data, categories] = await Promise.all([
        jobService.getJobPostDetail(String(jobId)),
        jobService.getCategories()
      ]);

        // Kiểm tra xem đã ứng tuyển chưa (trừ khi bị Reject)
        if (isAuthenticated && !user?.isDemo) {
          const apps = await jobService.getApplications();
          const existing = apps.find(a => String(a.jobPostId) === String(jobId));
          // statusId 3 = Rejected. Cho phép apply lại nếu bị reject.
          if (existing && existing.statusId !== 3) {
            setIsApplied(true);
            setApplicationInfo({ id: existing.id, statusId: existing.statusId });
          }
        }
        const mapWageType = (typeId: number | string) => {
          if (typeId === 1 || typeId === "1") return "Theo ngày";
          if (typeId === 2 || typeId === "2") return "Khoán";
          if (typeId === 3 || typeId === "3") return "Theo giờ";
          return "Thỏa thuận";
        };
        const mapPaymentMethod = (methodId: number | string) => {
          if (methodId === 1 || methodId === "1") return "Tiền mặt";
          if (methodId === 2 || methodId === "2") return "Chuyển khoản";
          return "Thỏa thuận";
        };
        const mapGender = (gender: string) => {
          if (!gender || gender === "string" || gender.toLowerCase() === "any") return "Không yêu cầu";
          if (gender.toLowerCase() === "male") return "Nam";
          if (gender.toLowerCase() === "female") return "Nữ";
          return gender;
        };

        const address = data.address && data.address !== "string" ? data.address : "Chưa cập nhật địa chỉ";
        const contactName = data.contactName && data.contactName !== "string" ? data.contactName : "Chủ nông trại";
        const categoryName = categories.find(c => String(c.id) === String(data.jobCategoryId))?.name || "Việc làm";
        
        // NOTE: BE hiện tại chưa Join Metadata (JobTitle, FarmName) vào JobApplicationDTO (Item 10.2 Spec)
        // FE đang tạm thời hiển thị từ JobPostDetail fetch trực tiếp.
        setJobDetail({ 
          ...demoJobDetail, 
          id: String(data.id),
          title: data.title || "Chi tiết công việc",
          description: data.description || "Chưa có mô tả chi tiết cho công việc này.",
          location: { ...demoJobDetail.location, address, distance: 2.5 },
          wage: data.wageAmount || 0,
          duration: data.estimatedHours ? `${data.estimatedHours} giờ` : "N/A",
          workload: "N/A",
          requiredWorkers: data.workersNeeded || 1,
          appliedWorkers: data.workersAccepted || 0,
          requiredSkills: categoryName,
          genderPreference: mapGender(data.genderPreference || ""),
          ageRequirement: "18-50",
          wageTypeId: mapWageType(data.wageTypeId || 1),
          paymentMethodId: mapPaymentMethod(data.paymentMethodId || 1),
          jobType: categoryName,
          urgent: data.isUrgent || false,
          postedDate: data.publishedAt ? new Date(data.publishedAt).toLocaleDateString("vi-VN") : "N/A",
          startDate: data.startDate ? new Date(data.startDate).toLocaleDateString("vi-VN") : "N/A",
          endDate: data.endDate ? new Date(data.endDate).toLocaleDateString("vi-VN") : "N/A",
          date: data.startDate ? new Date(data.startDate).toLocaleDateString("vi-VN") : "N/A",
          timeSlots: []
        });
      } catch { 
        setJobDetail(emptyJobDetail); 
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
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
    const slot = jobDetail.timeSlots.find((s) => s.id === slotId);
    if (!slot?.available) return;
    const key = String(slot.date);
    setSelectedTimeSlots((p) => p.includes(key) ? p.filter((s) => s !== key) : [...p, key]);
  };

  const handleQuickApply = async () => {
    if (!isAuthenticated || user?.isDemo) {
      if (selectedTimeSlots.length === 0) { alert("Vui lòng chọn ít nhất một khung giờ"); return; }
      alert(`Đã apply mẫu thành công cho ${selectedTimeSlots.length} khung giờ!`);
      navigation.goBack();
      return;
    }

    try {
      // NOTE: Hiện tại Backend (BE) yêu cầu gửi các trường StatusId, AppliedAt trong body 
      // mặc dù BE sẽ tự động ghi đè lại các giá trị này. 
      // Cần lưu ý chỉnh lại khi BE nâng cấp API sạch hơn (chỉ cần JobPostId và CoverLetter).
      await jobService.applyJob({
        jobPostId: jobId,
        statusId: 1, // Pending
        coverLetter: "Tôi rất mong muốn được nhận công việc này.",
        appliedAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
        responseMessage: null,
      });
      setIsApplied(true);
      showFeedback({ 
        title: "Thành công", 
        message: "Bạn đã gửi đơn ứng tuyển thành công. Vui lòng chờ phản hồi từ chủ nông trại.", 
        variant: "success",
        onConfirm: () => navigation.goBack() 
      });
    } catch (err: any) {
      showFeedback({ 
        title: "Lỗi ứng tuyển", 
        message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.", 
        variant: "error" 
      });
    }
  };

  const infoRows = [
    { Icon: MapPin,    label: "Địa điểm",        value: jobDetail.location.address, hint: `Cách bạn ${jobDetail.location.distance} km` },
    { Icon: Clock,     label: "Thời gian",        value: jobDetail.duration },
    { Icon: Briefcase, label: "Khối lượng",       value: jobDetail.workload },
    { Icon: Users,     label: "Số người tuyển",   value: `${jobDetail.requiredWorkers} người (đã có ${jobDetail.appliedWorkers})` },
    { Icon: Wrench,    label: "Kỹ năng yêu cầu",  value: jobDetail.requiredSkills || "Không yêu cầu" },
    { Icon: Users,     label: "Giới tính",         value: jobDetail.genderPreference || "Không yêu cầu" },
    { Icon: Calendar,  label: "Độ tuổi",           value: jobDetail.ageRequirement || "Không yêu cầu" },
    { Icon: Banknote,  label: "Hình thức lương",   value: jobDetail.wageTypeId || "N/A" },
    { Icon: Briefcase, label: "Thanh toán",        value: jobDetail.paymentMethodId || "N/A" },
  ];

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
            {infoRows.map((row, i) => (
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

        {/* TOOLS */}
        {(!isAuthenticated || user?.isDemo) && (
          <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
            <Text className="text-base font-bold text-slate-800 mb-4" style={{ letterSpacing: -0.2 }}>Dụng cụ</Text>
            <View className="gap-2">
              {jobDetail.requiredTools.map((tool, i) => (
                <View key={`r-${i}`} className="flex-row items-center gap-2 p-2 bg-rice-50 border border-rice-200 rounded-xl">
                  <Wrench size={13} color="#d97706" />
                  <Text className="flex-1 text-[13px] text-slate-700">{tool}</Text>
                  <Text className="text-[11px] font-bold text-rice-600">Tự mang</Text>
                </View>
              ))}
              {jobDetail.providedTools.map((tool, i) => (
                <View key={`p-${i}`} className="flex-row items-center gap-2 p-2 bg-primary-50 border border-primary-200 rounded-xl">
                  <CheckCircle size={13} color="#059669" />
                  <Text className="flex-1 text-[13px] text-slate-700">{tool}</Text>
                  <Text className="text-[11px] font-bold text-primary-600">Có sẵn</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TIME SLOTS / REPORTING */}
        {(!isAuthenticated || user?.isDemo) && jobDetail.wageTypeId !== "Khoán" && (
          <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
            <Text className="text-base font-bold text-slate-800 mb-1" style={{ letterSpacing: -0.2 }}>
              {applicationInfo.statusId === 2 ? "Lịch làm việc & Báo cáo" : "Chọn khung giờ"}
            </Text>
            <Text className="text-[13px] text-slate-400 mb-4">
              {applicationInfo.statusId === 2 ? "Theo dõi tiến độ báo cáo hàng ngày" : "Chọn các khung giờ bạn có thể làm việc"}
            </Text>
            <View className="gap-2.5">
              {jobDetail.timeSlots.map((slot) => {
                const key = String(slot.date);
                const selected = selectedTimeSlots.includes(key);
                const isPast = isPastDate(slot.date);
                const isToday = slot.date === "23/03/2026";
                const isReported = !!slot.reportedAt;
                
                // Trạng thái cho Reporting (đã được duyệt)
                if (applicationInfo.statusId === 2) {
                  return (
                    <View 
                      key={slot.id}
                      className={["flex-row items-center gap-2 p-4 rounded-2xl border-2", isReported ? "bg-primary-50 border-primary-100" : isPast ? "bg-slate-50 border-slate-100" : isToday ? "bg-white border-primary-500" : "bg-white border-slate-100"].join(" ")}
                    >
                      <Calendar size={18} color={isReported ? "#059669" : isPast ? "#94a3b8" : "#059669"} />
                      <View className="flex-1">
                        <Text className={["text-[15px] font-bold", isPast && !isReported ? "text-slate-400" : "text-slate-800"].join(" ")}>{slot.date}</Text>
                      </View>
                      {isReported ? (
                        <View className="items-end">
                          <Badge variant="success">Đã báo cáo</Badge>
                          <Text className="text-[10px] text-slate-400 mt-1">{slot.reportedAt}</Text>
                        </View>
                      ) : isPast ? (
                        <Badge variant="secondary">Đã qua</Badge>
                      ) : isToday ? (
                        <Badge variant="warning">Hôm nay</Badge>
                      ) : (
                        <Badge variant="secondary">Đang chờ</Badge>
                      )}
                    </View>
                  );
                }

                // Trạng thái cho Application (đang chọn giờ)
                return (
                  <TouchableOpacity
                    key={slot.id}
                    className={["flex-row items-center gap-2 p-4 rounded-2xl border-2", !slot.available ? "bg-slate-50 border-slate-100" : selected ? "bg-primary-600 border-primary-700" : "bg-white border-slate-200"].join(" ")}
                    onPress={() => toggleTimeSlot(slot.id)}
                    disabled={!slot.available}
                    activeOpacity={0.85}
                  >
                    <Calendar size={18} color={selected ? "#ffffff" : slot.available ? "#059669" : "#cbd5e1"} />
                    <Text className={["text-[15px] font-bold", selected ? "text-white" : !slot.available ? "text-slate-300" : "text-slate-800"].join(" ")}>{slot.date}</Text>
                    {!slot.available && <Badge variant="secondary">Đã đủ</Badge>}
                    {selected && slot.available && (
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
                {(!isAuthenticated || user?.isDemo) 
                    ? (jobDetail.wage * (selectedTimeSlots.length || 1)).toLocaleString("vi-VN") 
                    : jobDetail.wage.toLocaleString("vi-VN")} đ
              </Text>
              {(!isAuthenticated || user?.isDemo) && selectedTimeSlots.length > 0 && <Text className="text-xs text-slate-400">{selectedTimeSlots.length} khung giờ</Text>}
            </View>
            
            {applicationInfo.statusId === 2 ? (
              <Button 
                onPress={() => navigation.navigate("SubmitReport", { jobApplicationId: applicationInfo.id })}
                size="lg"
                variant="default"
                disabled={isPastDate(jobDetail.endDate || jobDetail.startDate) || !!jobDetail.timeSlots.find(s => s.date === "23/03/2026" && s.reportedAt)}
              >
                {!!jobDetail.timeSlots.find(s => s.date === "23/03/2026" && s.reportedAt) 
                  ? "Đã báo cáo hôm nay" 
                  : "Nộp Báo Cáo (Hôm nay)"}
              </Button>
            ) : (
              <Button 
                onPress={handleQuickApply} 
                disabled={isApplied || ((!isAuthenticated || user?.isDemo) && jobDetail.wageTypeId !== "Khoán" && selectedTimeSlots.length === 0)} 
                size="lg"
                variant={isApplied ? "ghost" : "default"}
              >
                {isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
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
