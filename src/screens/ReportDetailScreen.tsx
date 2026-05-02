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
  RefreshControl,
  DeviceEventEmitter,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { JobDetailDTO } from "../types/export_type_definitions";
import { dailyReportService } from "../services/daily_report.service";
import { jobService } from "../services/job.service";
import { ReportSummaryCard } from "../components/report/ReportSummaryCard";
import { ReportFeedbackCard } from "../components/report/ReportFeedbackCard";
import { ReportActionBar } from "../components/report/ReportActionBar";
import { ImageViewerModal } from "../components/report/ImageViewerModal";
import { canSubmitDispute } from "../utils/disputeRules";
import { JobStatus } from "../constants/enums";

export function ReportDetailScreen({ navigation, route }: any) {
  const { reportId, report } = route.params as {
    reportId?: string;
    report?: JobDetailDTO;
  };

  const [data, setData] = useState<JobDetailDTO | null>(report || null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(!report);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      if (!reportId) return;
      const res = await dailyReportService.getReportById(reportId);
      if (res) {
        // If backend didn't join jobPost, fetch it manually to show title/address
        if (!res.jobPost && res.jobPostId) {
          try {
            const jobPostData = await jobService.getJobPostDetail(res.jobPostId);
            res.jobPost = jobPostData;
          } catch (jobErr) {
            console.log("[ReportDetail] Could not fetch jobPost fallback:", jobErr);
          }
        }
        setData(res);
      }
    } catch {
      // Keep existing data silently
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadData();
    const sub = DeviceEventEmitter.addListener("REFRESH_DATA", loadData);
    return () => sub.remove();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAppeal = () => {
    if (!data) return;
    navigation.navigate("SubmitDispute", {
      jobPostId: data.jobPostId,
      reportId: data.id,
      farmerName: data.farmer?.contactName || data.jobPost?.contactName || "Farmer",
      jobTitle: data.jobPost?.title || "Công việc",
      isPerJob: data.jobPost?.jobTypeId === 1,
    });
  };

  // ─── Derived state ──────────────────────────────────────────────────────────
  
  const isApproved = data?.statusId === JobStatus.Completed;
  const isPending = data?.statusId === JobStatus.Reported;
  const showDisputeButton = canSubmitDispute(data);
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
          approvedPercent={approvedPercent}
          showDisputeButton={showDisputeButton}
          isAppealing={false}
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
