/* AI CONTEXT:
 * Action: Displays details for a specific dispute report.
 * Inputs: Dispute object or disputeId from route params.
 * Outputs: Rich UI with status banner, job context, evidence, and admin notes.
 * Dependencies: jobService, lucide-react-native, expo-image. */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Calendar, Info, AlertTriangle, CheckCircle2, XCircle, Sprout, MessageSquare, ClipboardList, Edit3, Trash2 } from "lucide-react-native";
import { DisputeReportDTO, JobPostDTO } from "../types/export_type_definitions";
import { jobService } from "../services/job.service";
import { disputeService } from "../services/dispute.service";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ImageViewerModal } from "../components/report/ImageViewerModal";
import { DeviceEventEmitter } from "react-native";
import { hapticFeedback } from "../utils/haptic";

const STATUS_CONFIG: Record<number, { 
  label: string; 
  variant: "warning" | "secondary" | "success" | "danger"; 
  icon: any; 
  color: string;
  bg: string;
  border: string;
}> = {
  1: { label: "Chờ duyệt", variant: "warning", icon: AlertTriangle, color: "#d97706", bg: "#fffbeb", border: "#fef3c7" },
  2: { label: "Đang xem xét", variant: "secondary", icon: Info, color: "#475569", bg: "#f1f5f9", border: "#e2e8f0" },
  3: { label: "Đã giải quyết", variant: "success", icon: CheckCircle2, color: "#059669", bg: "#f0fdf4", border: "#dcfce7" },
  4: { label: "Bị từ chối", variant: "danger", icon: XCircle, color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
};

export function DisputeDetailScreen({ navigation, route }: any) {
  const { dispute: initialDispute }: { dispute: DisputeReportDTO } = route.params || {};
  const [dispute, setDispute] = useState<DisputeReportDTO | null>(initialDispute || null);
  const [jobPost, setJobPost] = useState<Partial<JobPostDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!initialDispute?.id) return;
    setIsLoading(true);
    try {
      // 1. Refresh the dispute itself to get latest status/admin notes
      const freshDispute = await disputeService.getDisputeById(initialDispute.id);
      setDispute(freshDispute);

      // 2. Fetch or refresh job detail context
      const freshJob = await jobService.getJobPostDetail(freshDispute.jobPostId);
      setJobPost(freshJob);
    } catch (error) {
      console.log("[DisputeDetail] Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [initialDispute?.id]);

  useEffect(() => {
    fetchAllData();
    const sub = DeviceEventEmitter.addListener("REFRESH_DATA", fetchAllData);
    return () => sub.remove();
  }, [fetchAllData]);

  const handleDelete = () => {
    if (!dispute) return;
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn hủy khiếu nại này? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xác nhận xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              await disputeService.deleteDispute(dispute.id);
              hapticFeedback.success();
              DeviceEventEmitter.emit("REFRESH_DATA");
              navigation.goBack();
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Không thể xóa khiếu nại lúc này.");
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    if (!dispute) return;
    navigation.navigate("SubmitDispute", { 
      dispute,
      jobTitle: jobPost?.title,
      farmerName: jobPost?.contactName,
    });
  };

  if (!dispute) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <Text className="text-slate-500 font-medium">Không tìm thấy thông tin khiếu nại.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-primary-600 px-6 py-2 rounded-xl">
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const status = STATUS_CONFIG[dispute.statusId] || STATUS_CONFIG[1];
  const StatusIcon = status.icon;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 mr-8">
          Chi tiết Khiếu nại
        </Text>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={fetchAllData} 
            colors={["#059669"]} 
          />
        }
      >
        {/* Status Banner */}
        <View 
          className="flex-row items-center justify-between p-4 rounded-2xl border mb-6"
          style={{ backgroundColor: status.bg, borderColor: status.border }}
        >
          <View className="flex-row items-center gap-3">
            <StatusIcon size={20} color={status.color} />
            <View>
              <Text className="text-[15px] font-bold" style={{ color: status.color }}>
                {status.label}
              </Text>
              <Text className="text-[11px] font-medium opacity-70" style={{ color: status.color }}>
                Mã: #{dispute.id.substring(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>
          <Badge variant={status.variant}>{status.label}</Badge>
        </View>

        {/* Job Info Section */}
        <Card className="mb-6 border-slate-100 overflow-hidden">
          <CardContent className="p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Sprout size={18} color="#059669" />
              <Text className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Công việc liên quan</Text>
            </View>
            
            {isLoading && !jobPost ? (
              <ActivityIndicator size="small" color="#059669" className="items-start" />
            ) : (
              <View>
                <Text className="text-lg font-extrabold text-slate-900 mb-1">
                  {jobPost?.title || "Đang tải tên công việc..."}
                </Text>
                <Text className="text-[13px] text-slate-500 mb-1">
                  Đối tác: <Text className="font-bold text-slate-700">{jobPost?.contactName || "..."}</Text>
                </Text>
              </View>
            )}
            
            <View className="h-px bg-slate-50 my-3" />
            
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Calendar size={14} color="#94a3b8" />
                <Text className="text-[12px] text-slate-500 font-medium">
                  Gửi ngày: {new Date(dispute.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Dispute Details */}
        <Card className="mb-6 border-slate-100">
          <CardContent className="p-5">
            <View className="flex-row items-center gap-2 mb-4">
              <ClipboardList size={20} color="#0f172a" />
              <Text className="text-lg font-extrabold text-slate-900">Nội dung khiếu nại</Text>
            </View>

            <View className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
              <Text className="text-xs font-bold text-slate-400 uppercase mb-1">Lý do chính</Text>
              <Text className="text-[15px] font-bold text-slate-800 leading-6">{dispute.reason}</Text>
            </View>

            {dispute.description && (
              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-1">Mô tả chi tiết</Text>
                <Text className="text-[15px] text-slate-600 leading-6">{dispute.description}</Text>
              </View>
            )}

            {dispute.evidenceUrl && (
              <View>
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Bằng chứng hình ảnh</Text>
                <TouchableOpacity 
                  onPress={() => setSelectedImage(dispute.evidenceUrl)}
                  className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200"
                >
                  <Image 
                    source={{ uri: dispute.evidenceUrl }} 
                    className="w-full h-full" 
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-3 right-3 bg-black/50 px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                    <Info size={12} color="white" />
                    <Text className="text-[10px] text-white font-bold">Xem ảnh lớn</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Admin Note Section */}
        {(dispute.adminNote || dispute.statusId >= 3) && (
          <Card className="mb-6 border-emerald-100 bg-emerald-50/20">
            <CardContent className="p-5">
              <View className="flex-row items-center gap-2 mb-4">
                <MessageSquare size={20} color="#059669" />
                <Text className="text-lg font-extrabold text-emerald-900">Phản hồi từ Ban quản trị</Text>
              </View>

              <View className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                <Text className="text-[14px] text-slate-700 leading-6 italic">
                  {dispute.adminNote || "Khiếu nại đang được xử lý. Chúng tôi sẽ sớm đưa ra kết luận cuối cùng dựa trên các bằng chứng liên quan."}
                </Text>
                {dispute.resolvedAt && (
                  <Text className="text-[11px] text-emerald-600 font-bold mt-3 text-right">
                    Giải quyết lúc: {new Date(dispute.resolvedAt).toLocaleDateString("vi-VN")}
                  </Text>
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <View className="items-center px-6 mt-4">
          <Text className="text-[11px] text-slate-400 text-center leading-4">
            Mọi khiếu nại sẽ được xem xét công bằng dựa trên bằng chứng bạn cung cấp và phản hồi từ đối tác. Quyết định của Ban quản trị là quyết định cuối cùng.
          </Text>
        </View>

        {/* Action Buttons for Pending Status */}
        {dispute.statusId === 1 && (
          <View className="flex-row gap-4 mt-8">
            <Button
              variant="outline"
              style={{ flex: 1 }}
              className="border-slate-200 h-14 rounded-2xl"
              onPress={handleEdit}
            >
              <View className="flex-row items-center gap-2">
                <Edit3 size={18} color="#475569" />
                <Text className="text-slate-700 font-bold text-[15px]">Chỉnh sửa</Text>
              </View>
            </Button>
            
            <Button
              style={{ flex: 1 }}
              className="bg-rose-50 border border-rose-100 h-14 rounded-2xl"
              onPress={handleDelete}
            >
              <View className="flex-row items-center gap-2">
                <Trash2 size={18} color="#e11d48" />
                <Text className="text-rose-600 font-bold text-[15px]">Hủy bỏ</Text>
              </View>
            </Button>
          </View>
        )}
      </ScrollView>

      {selectedImage && (
        <ImageViewerModal
          visible={!!selectedImage}
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </SafeAreaView>
  );
}
