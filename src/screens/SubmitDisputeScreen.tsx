/* AI CONTEXT:
 * Action: Allows workers to file a formal dispute against a report or payment.
 * Inputs: JobPostId, ReportId (context), DisputeType, Reason, Description, Evidence.
 * Outputs: POST request to Dispute API via disputeService.
 * Dependencies: disputeService, mediaService, expo-image-picker. */

import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Info, Camera, Send, AlertTriangle, CheckCircle2, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { disputeService } from "../services/dispute.service";
import { mediaService } from "../services/media.service";
import { dailyReportService } from "../services/daily_report.service";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { hapticFeedback } from "../utils/haptic";
import { DeviceEventEmitter } from "react-native";
import { canSubmitDispute } from "../utils/disputeRules";

const DISPUTE_TYPES = [
  { id: 1, label: "Số lượng / Chất lượng công việc", icon: "clipboard" },
  { id: 2, label: "Vấn đề thanh toán / Thù lao", icon: "dollar-sign" },
  { id: 3, label: "Lý do khác", icon: "more-horizontal" },
];

export function SubmitDisputeScreen({ navigation, route }: any) {
  const { jobPostId, reportId, farmerName, jobTitle, isKhoán } = route.params || {};

  const [disputeTypeId, setDisputeTypeId] = useState<number>(1);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info";
    onConfirm?: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    variant: "info",
  });

  const [isValidating, setIsValidating] = useState(true);

  // Item 5: Quick validation on entry
  useEffect(() => {
    const validateReport = async () => {
      if (!reportId) {
        showFeedback({
          title: "Lỗi dữ liệu",
          message: "Không tìm thấy thông tin báo cáo để khiếu nại.",
          variant: "error",
          onConfirm: () => navigation.goBack(),
        });
        return;
      }

      setIsValidating(true);
      try {
        const reportData = await dailyReportService.getReportById(reportId);
        if (!canSubmitDispute(reportData)) {
          showFeedback({
            title: "Không thể khiếu nại",
            message: "Báo cáo này hiện không ở trạng thái được phép khiếu nại hoặc đã được xử lý.",
            variant: "error",
            onConfirm: () => navigation.goBack(),
          });
          return;
        }
      } catch (error) {
        // If fetch fails, we still allow proceeding if params were passed, 
        // but it's safer to warn if we have no fallback
        if (!jobPostId) {
          showFeedback({
            title: "Lỗi kết nối",
            message: "Không thể xác thực trạng thái báo cáo. Vui lòng thử lại sau.",
            variant: "error",
            onConfirm: () => navigation.goBack(),
          });
          return;
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateReport();
  }, [reportId]);

  const showFeedback = (config: any) => setFeedback({ ...config, visible: true });
  const closeFeedback = () => {
    const cb = feedback.onConfirm;
    setFeedback(p => ({ ...p, visible: false }));
    cb?.();
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showFeedback({ title: "Quyền truy cập", message: "Ứng dụng cần quyền truy cập ảnh để gửi bằng chứng khiếu nại.", variant: "error" });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setImage({
          uri: asset.uri,
          name: asset.fileName || "dispute_evidence.jpg",
          type: asset.mimeType || "image/jpeg",
        });
      }
    } catch (error) {
      showFeedback({ title: "Lỗi", message: "Không thể chọn ảnh lúc này.", variant: "error" });
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showFeedback({ title: "Thiếu thông tin", message: "Vui lòng nhập lý do vắn tắt của khiếu nại.", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      let evidenceUrl = "";
      if (image) {
        setUploadProgress(true);
        evidenceUrl = await mediaService.uploadImage(image);
        setUploadProgress(false);
      }

      await disputeService.createDispute({
        jobPostId: jobPostId,
        disputeTypeId: disputeTypeId,
        reason: reason,
        description: description,
        evidenceUrl: evidenceUrl,
      });

      hapticFeedback.success();
      showFeedback({
        onConfirm: () => {
          DeviceEventEmitter.emit("REFRESH_DATA");
          navigation.navigate("DisputeHistory");
        },
      });
    } catch (error: any) {
      setUploadProgress(false);
      hapticFeedback.error();
      showFeedback({
        title: "Lỗi hệ thống",
        message: error.message || "Không thể gửi khiếu nại lúc này. Vui lòng thử lại sau.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 mr-8">
          Gửi khiếu nại
        </Text>
      </View>

      {isValidating ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-slate-500 font-medium mt-4">Đang kiểm tra trạng thái...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Info Card */}
        <Card variant="tinted" className="mb-6">
          <CardContent className="p-4">
            <View className="flex-row items-center gap-2 mb-1">
              <AlertTriangle size={16} color="#e11d48" />
              <Text className="text-sm font-bold text-rose-700">Lưu ý quan trọng</Text>
            </View>
            <Text className="text-[13px] text-slate-600 leading-5">
              Bạn đang khiếu nại về công việc <Text className="font-bold text-slate-800">"{jobTitle || "N/A"}"</Text> của Farmer <Text className="font-bold text-slate-800">{farmerName || "N/A"}</Text>. 
              {isKhoán && (
                <Text className="text-amber-700 font-medium">
                  {"\n"}• Vì đây là hình thức khoán, khiếu nại này sẽ là cơ sở quan trọng để đối soát thù lao vào cuối kỳ.
                </Text>
              )}
            </Text>
          </CardContent>
        </Card>

        {/* Form */}
        <View className="gap-6">
          <View>
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-3 pl-1">Loại khiếu nại</Text>
            <View className="flex-row flex-wrap gap-2">
              {DISPUTE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setDisputeTypeId(type.id)}
                  className={`px-4 py-2.5 rounded-xl border ${
                    disputeTypeId === type.id 
                      ? "bg-primary-50 border-primary-200" 
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <Text className={`text-[13px] font-bold ${
                    disputeTypeId === type.id ? "text-primary-700" : "text-slate-500"
                  }`}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-2 pl-1">Lý do chính (Reason) <Text className="text-red-500">*</Text></Text>
            <TextInput
              placeholder="VD: Farmer duyệt thiếu tiến độ..."
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
              value={reason}
              onChangeText={setReason}
              maxLength={500}
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-2 pl-1">Mô tả chi tiết (Description)</Text>
            <TextInput
              multiline
              placeholder="Vui lòng cung cấp thêm chi tiết để chúng tôi hỗ trợ tốt nhất..."
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 min-h-[100px]"
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-3 pl-1">Bằng chứng hình ảnh (Evidence)</Text>
            {image ? (
              <View className="w-40 aspect-square rounded-2xl overflow-hidden relative shadow-sm border border-slate-100">
                <Image source={{ uri: image.uri }} className="w-full h-full" />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5"
                  onPress={() => setImage(null)}
                  disabled={isSubmitting}
                >
                  <X size={14} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                disabled={isSubmitting}
                className="w-40 aspect-square border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl items-center justify-center"
              >
                <Camera size={32} color="#94a3b8" />
                <Text className="text-[11px] text-slate-400 font-bold mt-2">Chọn ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="mt-10 mb-6">
          <Button
            onPress={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="bg-rose-600 h-14 rounded-2xl shadow-lg shadow-rose-200"
          >
            {isSubmitting ? (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold">{uploadProgress ? "Đang tải ảnh..." : "Đang gửi..."}</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Send size={18} color="white" />
                <Text className="text-white font-bold text-lg">Gửi Khiếu Nại</Text>
              </View>
            )}
          </Button>
        </View>
        
        <View className="items-center pb-10">
          <Text className="text-xs text-slate-400 text-center">
            Việc lạm dụng khiếu nại sai sự thật có thể ảnh hưởng đến mức độ tin cậy của tài khoản bạn.
          </Text>
        </View>
      </ScrollView>
      )}

      <FeedbackModal
        visible={feedback.visible}
        title={feedback.title}
        message={feedback.message}
        variant={feedback.variant}
        onClose={closeFeedback}
        onConfirm={feedback.onConfirm}
      />
    </SafeAreaView>
  );
}
