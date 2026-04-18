/* AI CONTEXT:
 * Action: Lists all past daily reports associated with a specific job.
 * Inputs: Job ID route parameter.
 * Outputs: Aggregated list of report summaries.
 * Dependencies: Job service, Report service. */

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ClipboardCheck } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { JobDetailDTO } from "../types/export_type_definitions";
import { dailyReportService } from "../services/daily_report.service";
import { useAuth } from "../context/AuthContext";
import { PillTabs } from "../components/ui/PillTabs";
import { Clock, Filter } from "lucide-react-native";
import { ReportHistoryCard } from "../components/report/ReportHistoryCard";

export function ReportHistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [reports, setReports] = useState<JobDetailDTO[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all"); // all, 7days, 30days

  // Demo initial data
  const demoReports: JobDetailDTO[] = [
    {
      id: "1",
      jobApplicationId: "101",
      jobPostId: "p1",
      workerId: "w1",
      workDate: new Date().toISOString(),
      workerDescription: "Đã rải phân bón cho khu vực Bắc.",
      statusId: 2, // Approved
      farmerApprovedPercent: 100,
      jobPrice: 500000,
      createdAt: new Date().toISOString(),
      jobPost: { title: "Chăm sóc cây ăn quả", contactName: "Nông trại Hữu Cơ" }
    },
    {
      id: "2",
      jobApplicationId: "102",
      jobPostId: "p2",
      workerId: "w1",
      workDate: new Date().toISOString(),
      workerDescription: "Hái cà phê được 30kg nhưng trời mưa nghỉ sớm.",
      statusId: 2, // Approved but low percent for demo
      farmerApprovedPercent: 85,
      jobPrice: 400000,
      createdAt: new Date().toISOString(),
      jobPost: { title: "Thu hoạch cà phê", contactName: "Vườn cà phê Đắk Lắk", jobTypeId: 1 } // isKhoán
    }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.isDemo || !user?.id) {
        setReports(demoReports);
        return;
      }
      // Using the new global paginated endpoint from 12/04 spec
      const data = await dailyReportService.getAllReports({ pageNumber: 1, pageSize: 50 });
      setReports(data.length > 0 ? data : demoReports);
    } catch (err) {
      console.error("Load reports error:", err);
      setReports(demoReports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const subscription = DeviceEventEmitter.addListener("REFRESH_DATA", loadData);
    return () => subscription.remove();
  }, []);

  const getFilteredReports = () => {
    return reports.filter(r => {
      // Status filter
      if (statusFilter !== "all") {
        const sId = parseInt(statusFilter);
        if (r.statusId !== sId) return false;
      }

      // Time filter
      if (timeFilter !== "all") {
        const reportDate = new Date(r.workDate);
        const now = new Date();
        const diffDays = (now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24);
        if (timeFilter === "7days" && diffDays > 7) return false;
        if (timeFilter === "30days" && diffDays > 30) return false;
      }

      return true;
    });
  };

  const filteredReports = getFilteredReports();

  const renderItem = ({ item }: { item: JobDetailDTO }) => {
    return (
      <ReportHistoryCard
        item={item}
        onPress={() => navigation.navigate("ReportDetail", { reportId: item.id, report: item })}
        onDispute={() => navigation.navigate("SubmitDispute", {
          jobPostId: item.jobPostId,
          reportId: item.id,
          farmerName: item.jobPost?.contactName,
          jobTitle: item.jobPost?.title,
          isKhoán: item.jobPost?.jobTypeId === 1
        })}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 mr-8">
          Lịch sử Báo Cáo
        </Text>
      </View>

      {/* Filters */}
      <View className="bg-white px-4 pt-2 pb-3 border-b border-slate-100">
        <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2 mb-3">
          <Clock size={16} color="#64748b" />
          <View className="flex-row ml-2 gap-2 flex-1">
            {[
              { id: "all", label: "Tất cả" },
              { id: "7days", label: "7 ngày qua" },
              { id: "30days", label: "30 ngày qua" },
            ].map((t) => (
              <TouchableOpacity 
                key={t.id} 
                onPress={() => setTimeFilter(t.id)}
                className={`px-3 py-1 rounded-full ${timeFilter === t.id ? "bg-slate-200" : ""}`}
              >
                <Text className={`text-[11px] font-bold ${timeFilter === t.id ? "text-slate-800" : "text-slate-400"}`}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Filter size={14} color="#94a3b8" />
        </View>

        <PillTabs
          items={[
            { key: "all", label: "Tất cả trạng thái" },
            { key: "2", label: "Chờ duyệt" }, // Reported
            { key: "3", label: "Đã duyệt" },  // Completed
          ]}
          activeKey={statusFilter}
          onChange={setStatusFilter}
        />
      </View>

      <FlatList
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={["#059669"]} />}
        ListEmptyComponent={
          !loading ? (
            <Card variant="tinted" className="mt-4">
              <CardContent className="items-center py-6">
                <ClipboardCheck size={32} color="#94a3b8" />
                <Text className="text-slate-600 font-medium mt-3">Chưa có báo cáo nào.</Text>
                <Text className="text-slate-400 text-sm mt-1 text-center">Các báo cáo hàng ngày của bạn sẽ xuất hiện ở đây.</Text>
              </CardContent>
            </Card>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
