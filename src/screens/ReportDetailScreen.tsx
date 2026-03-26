import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, RefreshControl, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Info, FileText } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { JobDetailDTO } from "../types";
import { reportService } from "../services/report.service";
import { disputeService } from "../services/dispute.service";

export function ReportDetailScreen({ navigation, route }: any) {
  const { reportId, report } = route.params as { reportId: string; report: JobDetailDTO };
  const [data, setData] = useState<JobDetailDTO | null>(report || null);
  const [isAppealing, setIsAppealing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (!reportId) return;
      const res = await reportService.getReportById(reportId);
      if (res) setData(res);
    } catch {
      // Keep existing data
    } finally {
      setRefreshing(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadData();
    const subscription = DeviceEventEmitter.addListener("REFRESH_DATA", loadData);
    return () => subscription.remove();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAppeal = () => {
    if (!data) return;
    Alert.alert(
      "Khiếu nại",
      "Bạn muốn gửi khiếu nại đánh giá của báo cáo này?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Gửi Admin",
          onPress: async () => {
             setIsAppealing(true);
             try {
                await disputeService.createDispute({
                  jobPostId: data.jobPostId,
                  disputeTypeId: 1,
                  reason: "Chủ vườn đánh giá không công bằng.",
                });
                Alert.alert("Thành công", "Đã gửi khiếu nại. Admin sẽ liên hệ lại.");
                navigation.goBack();
             } catch (e) {
                Alert.alert("Lỗi", "Không thể gửi.");
             } finally {
                setIsAppealing(false);
             }
          }
        }
      ]
    );
  };

  if (!data) return null;

  const isApproved = data.statusId === 2;
  const isPending = data.statusId === 1;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 mr-8">
          Chi tiết Báo Cáo
        </Text>
      </View>

      <ScrollView 
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
      >
        <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-500 text-xs font-semibold">Ngày báo cáo: {new Date(data.workDate).toLocaleDateString("vi-VN")}</Text>
            <Badge variant={isApproved ? "success" : isPending ? "secondary" : "warning"}>
              {isApproved ? "Đã duyệt" : isPending ? "Chờ duyệt" : "Đang khiếu nại"}
            </Badge>
          </View>

          <Text className="text-lg font-bold text-slate-900 mb-1">{data.jobPost?.title || "Công việc chung"}</Text>
          <Text className="text-slate-600 mb-4">{data.jobPost?.contactName || "Nông trại"}</Text>

          <View className="h-px bg-slate-100 mb-4" />

          <Text className="font-semibold text-slate-800 mb-2">Mô tả công việc:</Text>
          <Text className="text-[15px] text-slate-700 leading-6 mb-4">{data.workerDescription}</Text>
          
          {data.evidenceUrl && (
            <View className="mt-2">
              <Text className="font-semibold text-slate-800 mb-2">Hình ảnh minh chứng:</Text>
              <View className="flex-row gap-2">
                {data.evidenceUrl.split(",").map((url, i) => (
                  <TouchableOpacity 
                    key={i} 
                    className="flex-1 aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50"
                    onPress={() => {/* Full screen viewer could be added here */}}
                  >
                    <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                  </TouchableOpacity>
                ))}
                {/* Fillers for alignment */}
                {data.evidenceUrl.split(",").length === 1 && (
                  <>
                    <View className="flex-1 aspect-square" />
                    <View className="flex-1 aspect-square" />
                  </>
                )}
                {data.evidenceUrl.split(",").length === 2 && (
                    <View className="flex-1 aspect-square" />
                )}
              </View>
            </View>
          )}
        </View>

        {isApproved && (
          <View className="bg-white rounded-xl border border-primary-200 p-4 mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <FileText size={18} color="#059669" />
              <Text className="font-bold text-primary-800">Đánh giá từ chủ nông trại</Text>
            </View>
            <Text className="text-slate-700 mb-3 italic">"{data.farmerFeedback || "Khối lượng công việc tốt."}"</Text>
            
            <View className="bg-primary-50 p-3 rounded-lg flex-row justify-between">
               <Text className="text-primary-800 font-semibold">Phần trăm hoàn thành:</Text>
               <Text className="text-primary-800 font-bold text-lg">{data.farmerApprovedPercent}%</Text>
            </View>
          </View>
        )}

        {isApproved && (data.farmerApprovedPercent ?? 0) < 100 && (
          <View className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-4">
            <View className="flex-row items-start gap-2 mb-2">
              <Info size={16} color="#ca8a04" className="mt-0.5" />
              <Text className="flex-1 text-sm text-yellow-800">
                Nếu bạn thấy đánh giá không khớp với thực tế khối lượng bạn làm, bạn có thể gửi yêu cầu admin xem xét lại.
              </Text>
            </View>
            <Button variant="outline" onPress={handleAppeal} disabled={isAppealing}>
              {isAppealing ? "Đang gửi..." : "Khiếu nại kết quả"}
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
