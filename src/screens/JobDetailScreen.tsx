import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Clock, Banknote, Star, Calendar, Users, Wrench, Briefcase, MessageCircle, ArrowLeft, CheckCircle } from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { jobService, JobPostDTO } from "../services";
import { useAuth } from "../context/AuthContext";

export function JobDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { jobId } = route.params;
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const { isAuthenticated, user } = useAuth();

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
      { id: 1, date: "22/01/2026", time: "06:00 - 12:00", available: true },
      { id: 2, date: "22/01/2026", time: "13:00 - 18:00", available: true },
      { id: 3, date: "23/01/2026", time: "06:00 - 12:00", available: true },
      { id: 4, date: "23/01/2026", time: "13:00 - 18:00", available: false },
    ],
    jobType: "Thu hoạch", urgent: true, postedDate: "20/01/2026",
  };
  const emptyJobDetail = { ...demoJobDetail, title: "", description: "", location: { ...demoJobDetail.location, address: "", distance: 0 }, wage: 0, duration: "", workload: "", requiredWorkers: 0, appliedWorkers: 0, requiredSkills: "", genderPreference: "", ageRequirement: "", wageTypeId: "", paymentMethodId: "", jobType: "", urgent: false, postedDate: "" };

  const [jobDetail, setJobDetail] = useState(demoJobDetail);

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) { setJobDetail(demoJobDetail); return; }
    (async () => {
      try {
        const data = await jobService.getJobPostDetail(String(jobId));
        setJobDetail({ ...demoJobDetail, id: data.id, title: data.title, description: data.description, jobType: data.jobCategoryId, location: { ...demoJobDetail.location, address: data.address, distance: 0 }, wage: data.wageAmount, duration: data.estimatedHours ? `${data.estimatedHours} giờ` : "N/A", requiredWorkers: data.workersNeeded, appliedWorkers: data.workersAccepted, workload: data.estimatedHours ? `${data.estimatedHours} giờ` : demoJobDetail.workload, farmer: { ...demoJobDetail.farmer, name: data.farmerProfileId }, requiredSkills: data.requiredSkills, genderPreference: data.genderPreference, ageRequirement: data.ageRequirement, wageTypeId: data.wageTypeId, paymentMethodId: data.paymentMethodId, urgent: data.isUrgent, postedDate: data.publishedAt ? new Date(data.publishedAt).toLocaleDateString("vi-VN") : demoJobDetail.postedDate });
      } catch { setJobDetail(emptyJobDetail); }
    })().catch(() => undefined);
  }, [isAuthenticated, user?.isDemo, jobId]);

  const toggleTimeSlot = (slotId: number) => {
    const slot = jobDetail.timeSlots.find((s) => s.id === slotId);
    if (!slot?.available) return;
    const key = `${slot.date}-${slot.time}`;
    setSelectedTimeSlots((p) => p.includes(key) ? p.filter((s) => s !== key) : [...p, key]);
  };

  const handleQuickApply = () => {
    if (selectedTimeSlots.length === 0) { alert("Vui lòng chọn ít nhất một khung giờ"); return; }
    alert(`Đã apply thành công cho ${selectedTimeSlots.length} khung giờ!`);
    navigation.goBack();
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

  return (
    <View className="flex-1 bg-primary-50">
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 pb-2 bg-white border-b border-slate-100" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 justify-center items-center" onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">Chi tiết công việc</Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* JOB HERO */}
        <View className="bg-white rounded-[20px] p-6 mb-4 border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          {jobDetail.jobType ? (
            <View className="self-start mb-2">
              <Badge variant={jobDetail.urgent ? "danger" : "success"}>{jobDetail.urgent ? "🔥 Cần gấp" : jobDetail.jobType}</Badge>
            </View>
          ) : null}
          <Text className="text-[22px] font-extrabold text-slate-900 mb-1" style={{ letterSpacing: -0.4 }}>{jobDetail.title}</Text>
          <Text className="text-[13px] text-slate-500 mb-4">{jobDetail.location.address}</Text>
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
            <Avatar fallback="#" size={50} />
            <View className="flex-1"><Text className="text-[15px] font-bold text-slate-800">Farmer ID: {jobDetail.farmer?.name || "N/A"}</Text></View>
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

        {/* TIME SLOTS */}
        {(!isAuthenticated || user?.isDemo) && (
          <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
            <Text className="text-base font-bold text-slate-800 mb-1" style={{ letterSpacing: -0.2 }}>Chọn khung giờ</Text>
            <Text className="text-[13px] text-slate-400 mb-4">Chọn các khung giờ bạn có thể làm việc</Text>
            <View className="gap-2.5">
              {jobDetail.timeSlots.map((slot) => {
                const key = `${slot.date}-${slot.time}`;
                const selected = selectedTimeSlots.includes(key);
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
                    <Text className={["text-[13px]", selected ? "text-white" : !slot.available ? "text-slate-300" : "text-slate-500"].join(" ")}>{slot.time}</Text>
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
      {(!isAuthenticated || user?.isDemo) && (
        <View className="flex-row items-center gap-4 px-4 pt-4 bg-white border-t border-slate-100" style={{ paddingBottom: insets.bottom + 8, shadowColor: "#0f172a", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 }}>
          <View className="flex-1">
            <Text className="text-xs text-slate-500">Thu nhập dự kiến</Text>
            <Text className="text-[22px] font-extrabold text-primary-700">{(jobDetail.wage * selectedTimeSlots.length).toLocaleString("vi-VN")} đ</Text>
            {selectedTimeSlots.length > 0 && <Text className="text-xs text-slate-400">{selectedTimeSlots.length} khung giờ</Text>}
          </View>
          <Button onPress={handleQuickApply} disabled={selectedTimeSlots.length === 0} size="lg">Ứng tuyển ngay</Button>
        </View>
      )}
    </View>
  );
}
