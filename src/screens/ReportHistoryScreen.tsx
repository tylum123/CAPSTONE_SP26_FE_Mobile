import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ClipboardCheck, Calendar, Info } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { JobDetailDTO } from "../types";
import { reportService } from "../services/report.service";
import { useAuth } from "../context/AuthContext";

export function ReportHistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [reports, setReports] = useState<JobDetailDTO[]>([]);
  const [loading, setLoading] = useState(false);

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
      statusId: 1, // Pending
      jobPrice: 400000,
      createdAt: new Date().toISOString(),
      jobPost: { title: "Thu hoạch cà phê", contactName: "Vườn cà phê Đắk Lắk" }
    }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.isDemo || !user?.id) {
        setReports(demoReports);
        return;
      }
      const data = await reportService.getWorkerReports(user.id);
      setReports(data.length > 0 ? data : demoReports);
    } catch {
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

  const renderItem = ({ item }: { item: JobDetailDTO }) => {
    const isApproved = item.statusId === 2;
    const isPending = item.statusId === 1;

    return (
      <TouchableOpacity 
        className="mb-3 bg-white border border-slate-100 rounded-xl overflow-hidden"
        style={{ elevation: 2, shadowColor: "#0f172a", shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.05, shadowRadius: 8 }}
        onPress={() => navigation.navigate("ReportDetail", { reportId: item.id, report: item })}
        activeOpacity={0.8}
      >
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Calendar size={14} color="#64748b" />
              <Text className="text-xs font-semibold text-slate-500">
                {new Date(item.workDate).toLocaleDateString("vi-VN")}
              </Text>
            </View>
            <Badge variant={isApproved ? "success" : isPending ? "secondary" : "warning"}>
              {isApproved ? "Đã duyệt" : isPending ? "Chờ duyệt" : "Đang khiếu nại"}
            </Badge>
          </View>
          
          <Text className="text-[15px] font-bold text-slate-800 mb-1">
            {item.jobPost?.title || "Báo cáo công việc"}
          </Text>
          <Text className="text-xs text-slate-500 mb-3" numberOfLines={1}>
            {item.jobPost?.contactName || "Nông trại"}
          </Text>
          
          <Text className="text-[14px] text-slate-600 mb-3" numberOfLines={2}>
            {item.workerDescription}
          </Text>

          {isApproved && item.farmerApprovedPercent !== undefined && (
            <View className="bg-primary-50 px-3 py-2 rounded-lg flex-row items-center justify-between border border-primary-100">
              <Text className="text-[13px] text-primary-800 font-medium">Kết quả tiến độ:</Text>
              <Text className="text-[14px] font-bold text-primary-700">{item.farmerApprovedPercent}%</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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

      <FlatList
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        data={reports}
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
