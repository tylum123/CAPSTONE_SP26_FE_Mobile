import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { PillTabs, EmptyState } from "../components/ui";
import { Clock, MapPin, Banknote, Calendar, CheckCircle2, Star, ClipboardCheck } from "lucide-react-native";
import { jobService, JobPostDTO } from "../services";
import { useAuth } from "../context/AuthContext";

type TabType = "applied" | "upcoming" | "completed";

export function WorkerJobsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>("applied");
  const { isAuthenticated, user } = useAuth();
  const [appliedJobs, setAppliedJobs]     = useState<any[]>([]);
  const [upcomingJobs, setUpcomingJobs]   = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);

  const demoApplied = [
    { id: 5, title: "Hái cà phê",    farmer: "Trần Văn D",      location: "An Giang",   date: "18/01/2026", time: "07:00 - 16:00", wage: 180000, status: "pending",  appliedDate: "15/01/2026" },
    { id: 6, title: "Thu hoạch rau", farmer: "Nguyễn Văn E",    location: "Đồng Tháp", date: "15/01/2026", time: "08:00 - 17:00", wage: 200000, status: "accepted", appliedDate: "12/01/2026" },
  ];
  const demoUpcoming = [
    { id: 3, title: "Tưới nước vườn cam",  farmer: "Lê Thị C",    location: "Vĩnh Long", date: "25/02/2026", time: "06:00 - 10:00", wage: 150000, status: "accepted" },
    { id: 7, title: "Phun thuốc vườn cam", farmer: "Trần Văn F",   location: "Cần Thơ",   date: "26/02/2026", time: "07:00 - 11:00", wage: 200000, status: "accepted" },
  ];
  const demoCompleted = [
    { id: 1, title: "Làm cỏ vườn mít",      farmer: "Nguyễn Văn A", location: "Cần Thơ",   completedDate: "20/01/2026", wage: 250000, rating: 5, review: "Công việc tốt, người thuê nhiệt tình",    paidAmount: 250000 },
    { id: 8, title: "Thu hoạch lúa",          farmer: "Phạm Văn G",  location: "Đồng Tháp", completedDate: "10/01/2026", wage: 300000, rating: 4, review: "Môi trường làm việc tốt, trả lương đúng hẹn", paidAmount: 300000 },
    { id: 9, title: "Vận chuyển phân bón",    farmer: "Võ Thị H",    location: "An Giang",   completedDate: "05/01/2026", wage: 180000, rating: 0, review: "", paidAmount: 180000 },
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) { setAppliedJobs(demoApplied); setUpcomingJobs(demoUpcoming); setCompletedJobs(demoCompleted); return; }
    (async () => {
      try {
        const result = await jobService.getJobPosts();
        setAppliedJobs(result.map((j: JobPostDTO) => ({ id: j.id, title: j.title, farmer: "Chủ nông trại", location: j.address, date: j.startDate ? new Date(j.startDate).toLocaleDateString("vi-VN") : "", time: "", wage: j.wageAmount || 0, status: "pending" as const, appliedDate: j.publishedAt ? new Date(j.publishedAt).toLocaleDateString("vi-VN") : "" })));
        setUpcomingJobs([]); setCompletedJobs([]);
      } catch { setAppliedJobs([]); setUpcomingJobs([]); setCompletedJobs([]); }
    })().catch(() => undefined);
  }, [isAuthenticated, user?.isDemo]);

  const listData = activeTab === "applied" ? appliedJobs : activeTab === "upcoming" ? upcomingJobs : completedJobs;

  const renderItem = (job: any) => {
    if (activeTab === "applied") return (
      <TouchableOpacity className="mb-2 bg-white rounded-[20px] flex-row overflow-hidden border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
        activeOpacity={0.9} onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}>
        <View className="flex-1 p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Avatar fallback={job.farmer[0]} size={42} />
            <View className="flex-1"><Text className="text-[15px] font-bold text-slate-800 mb-0.5" numberOfLines={1}>{job.title}</Text><Text className="text-xs text-slate-500">{job.farmer}</Text></View>
            <Badge variant={job.status === "accepted" ? "success" : "warning"}>{job.status === "accepted" ? "Chấp nhận" : "Chờ xác nhận"}</Badge>
          </View>
          <View className="h-px bg-slate-100 mb-2" />
          <View className="flex-row flex-wrap gap-2">
            <View className="flex-row items-center gap-1"><MapPin size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.location}</Text></View>
            <View className="flex-row items-center gap-1"><Calendar size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.date}</Text></View>
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
              <View className="flex-row items-center gap-1"><Calendar size={12} color="#0d9488" /><Text className="text-xs text-teal-600 font-semibold">{job.date} • {job.time}</Text></View>
            </View>
            <Badge variant="success">Xác nhận</Badge>
          </View>
          <View className="h-px bg-slate-100 mb-2" />
          <View className="flex-row flex-wrap gap-2 mb-2">
            <View className="flex-row items-center gap-1"><MapPin size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.location}</Text></View>
            <View className="flex-row items-center gap-1 bg-primary-50 rounded-full px-2 py-0.5 border border-primary-100"><Banknote size={13} color="#059669" /><Text className="text-xs font-bold text-primary-700">{job.wage.toLocaleString("vi-VN")}đ</Text></View>
          </View>
          <View className="flex-row gap-2 flex-wrap">
            <Button variant="outline" size="sm" onPress={() => navigation.navigate("Chat", { farmerId: job.farmer })}>💬 Nhắn tin</Button>
            <Button variant="outline" size="sm" onPress={() => navigation.navigate("CheckIn", { jobApplicationId: String(job.id) })}>📍 Check in</Button>
            <Button size="sm" onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}>Chi tiết</Button>
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
            <Button variant="ghost" size="sm" onPress={() => navigation.navigate("Review", { jobId: job.id })}>Đánh giá công việc ⭐</Button>
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
        <TouchableOpacity className="w-10 h-10 rounded-full bg-primary-50 border border-primary-200 justify-center items-center" onPress={() => navigation.navigate("AttendanceHistory")}>
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
