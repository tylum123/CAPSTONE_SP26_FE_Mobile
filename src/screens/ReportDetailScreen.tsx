/* AI CONTEXT:
 * Action: Orchestrates the Report Detail view — data fetching, state, composition only.
 * Inputs: reportId / report object from route params.
 * Outputs: Full-page report detail composed from extracted sub-components.
 * Dependencies: dailyReportService, disputeService, report/* components. */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  DeviceEventEmitter,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { JobDetailDTO } from "../types/export_type_definitions";
import { dailyReportService } from "../services/daily_report.service";
import { disputeService } from "../services/dispute.service";
import { ReportSummaryCard } from "../components/report/ReportSummaryCard";
import { ReportFeedbackCard } from "../components/report/ReportFeedbackCard";
import { ReportActionBar } from "../components/report/ReportActionBar";
import { ImageViewerModal } from "../components/report/ImageViewerModal";

export function ReportDetailScreen({ navigation, route }: any) {
  const { reportId, report } = route.params as {
    reportId?: string;
    report?: JobDetailDTO;
  };

  const [data, setData] = useState<JobDetailDTO | null>(report || null);
  const [isAppealing, setIsAppealing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(!report);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [disputeTypeId, setDisputeTypeId] = useState(1); // 1=JobQuality, 2=Payment, 3=Other
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");

  const loadData = useCallback(async () => {
    try {
      if (!reportId) return;
      const res = await dailyReportService.getReportById(reportId);
      if (res) setData(res);
    } catch {
      // Keep existing data silently
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (!report) loadData();
    else setLoading(false);
    const sub = DeviceEventEmitter.addListener("REFRESH_DATA", loadData);
    return () => sub.remove();
  }, [loadData, report]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAppeal = () => {
    setDisputeReason("");
    setDisputeDescription("");
    setDisputeTypeId(1);
    setDisputeModalVisible(true);
  };

  const submitDispute = async () => {
    if (!data) return;
    if (!disputeReason.trim()) {
      Alert.alert("Thiếu lý do", "Vui lòng nhập lý do khiếu nại.");
      return;
    }
    setIsAppealing(true);
    setDisputeModalVisible(false);
    try {
      await disputeService.createDispute({
        jobPostId: data.jobPostId || "",
        disputeTypeId,
        reason: disputeReason.trim(),
        description: disputeDescription.trim() || undefined,
      });
      Alert.alert(
        "Đã gửi thành công",
        "Khiếu nại của bạn đã được ghi nhận. Admin sẽ xem xét và phản hồi sớm nhất.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert("Lỗi", "Không thể gửi khiếu nại. Vui lòng thử lại sau.");
    } finally {
      setIsAppealing(false);
    }
  };

  // ─── Derived state ──────────────────────────────────────────────────────────

  const isApproved = data?.statusId === 2;
  const isPending = data?.statusId === 1;
  const approvedPercent = data?.farmerApprovedPercent ?? 0;
  const evidenceUrls = data?.attachments
    ? data.attachments.map((a) => a.fileUrl).filter(Boolean)
    : [];

  // ─── Loading skeleton ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["top"]}>
        <ScreenHeader onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["top"]}>
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#059669"]}
            tintColor="#059669"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ReportSummaryCard
          data={data}
          evidenceUrls={evidenceUrls}
          onImagePress={setSelectedImage}
        />

        {isApproved && <ReportFeedbackCard data={data} approvedPercent={approvedPercent} />}

        <ReportActionBar
          isPending={isPending}
          isApproved={isApproved}
          approvedPercent={approvedPercent}
          isAppealing={isAppealing}
          onAppeal={handleAppeal}
        />
      </ScrollView>

      {selectedImage && (
        <ImageViewerModal
          visible={!!selectedImage}
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* ─── Dispute Modal Form ───────────────────────────────────────── */}
      <Modal
        visible={disputeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDisputeModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}>
            <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 16 }}>
                Gửi khiếu nại
              </Text>

              {/* Dispute type picker */}
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 }}>Loại khiếu nại</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {[
                  { id: 1, label: "Chất lượng" },
                  { id: 2, label: "Thanh toán" },
                  { id: 3, label: "Khác" },
                ].map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setDisputeTypeId(t.id)}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                      backgroundColor: disputeTypeId === t.id ? "#059669" : "#f1f5f9",
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "600", color: disputeTypeId === t.id ? "#fff" : "#475569" }}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reason input */}
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 }}>
                Lý do <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>
              <TextInput
                value={disputeReason}
                onChangeText={setDisputeReason}
                placeholder="Mô tả ngắn gọn lý do khiếu nại..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                maxLength={512}
                style={{
                  borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10,
                  padding: 12, fontSize: 14, color: "#0f172a",
                  minHeight: 80, textAlignVertical: "top", marginBottom: 12,
                }}
              />

              {/* Description input */}
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 }}>Chi tiết thêm (tùy chọn)</Text>
              <TextInput
                value={disputeDescription}
                onChangeText={setDisputeDescription}
                placeholder="Mô tả chi tiết hơn (không bắt buộc)..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={2}
                style={{
                  borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10,
                  padding: 12, fontSize: 14, color: "#0f172a",
                  minHeight: 60, textAlignVertical: "top", marginBottom: 20,
                }}
              />

              {/* Actions */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setDisputeModalVisible(false)}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#64748b" }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitDispute}
                  disabled={isAppealing}
                  style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#dc2626", alignItems: "center", opacity: isAppealing ? 0.6 : 1 }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>Gửi khiếu nại</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Local tiny component (screen-scoped only) ─────────────────────────────

function ScreenHeader({ onBack }: { onBack: () => void }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
      }}
    >
      <TouchableOpacity onPress={onBack} style={{ padding: 8, marginLeft: -8 }}>
        <ChevronLeft size={24} color="#0f172a" />
      </TouchableOpacity>
      <Text
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: 17,
          fontWeight: "700",
          color: "#0f172a",
          marginRight: 32,
        }}
      >
        Chi tiết Báo Cáo
      </Text>
    </View>
  );
}
