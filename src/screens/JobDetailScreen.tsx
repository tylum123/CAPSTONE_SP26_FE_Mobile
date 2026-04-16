/* AI CONTEXT:
 * Action: Displays full details and requirements for a specific farming job.
 * Inputs: Job ID from route parameters.
 * Outputs: Job details UI, apply/accept action payloads.
 * Dependencies: Job hooks, UI components, Navigation. */

import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Clock, Briefcase, Users, Wrench, Calendar, Banknote, ArrowLeft } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { FeedbackModal } from "../components/ui/FeedbackModal";

// Custom Hooks
import { useFetchJobDetail } from "../hooks/use_fetch_job_detail";
import { useApplyForJob } from "../hooks/use_apply_for_job";

// UI Components
import { RenderJobHeader } from "../components/job/render_job_header";
import { RenderFarmerInfoCard } from "../components/job/render_farmer_info_card";
import { RenderJobInfoSections } from "../components/job/render_job_info_sections";
import { RenderTimeSlotsAndReports } from "../components/job/render_time_slots_and_reports";
import { RenderJobActionBar } from "../components/job/render_job_action_bar";

export function JobDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { jobId } = route.params;
  const { isAuthenticated, user } = useAuth();

  const {
    jobDetail, isLoading, refreshing, isApplied, setIsApplied,
    applicationInfo, selectedTimeSlots, setSelectedTimeSlots,
    lastMessage, loadJobData, onRefresh, toggleTimeSlot
  } = useFetchJobDetail(jobId, isAuthenticated, user);

  const {
    isSubmitting, feedback, showFeedback, closeFeedback, handleQuickApply
  } = useApplyForJob(jobId, isAuthenticated, user, jobDetail, selectedTimeSlots, setIsApplied, () => navigation.goBack());

  const infoRows = useMemo(() => {
    if (!jobDetail) return [];
    return [
      { Icon: MapPin,    label: "Địa điểm",        value: jobDetail.location?.address, hint: jobDetail.location?.distance ? `Cách bạn ${jobDetail.location.distance} km` : "" },
      { Icon: Clock,     label: "Thời gian",        value: jobDetail.duration },
      { Icon: Users,     label: "Số lượng cần tuyển",value: `${jobDetail.appliedWorkers || 0}/${jobDetail.requiredWorkers || 0} người` },
      { Icon: Wrench,    label: "Kỹ năng yêu cầu",  value: jobDetail.requiredSkills || "Không yêu cầu" },
      { Icon: Banknote,  label: "Loại Hình", value: jobDetail.wageTypeId || "N/A" },
    ];
  }, [jobDetail]);

  const rootStyle = Platform.OS === 'web'
    ? { height: '100vh' as any, display: 'flex' as any, flexDirection: 'column' as any, backgroundColor: '#f0fdf4' }
    : { flex: 1, backgroundColor: '#f0fdf4' };
  const scrollStyle = Platform.OS === 'web'
    ? { flex: 1, overflowY: 'scroll' as any }
    : { flex: 1 };

  return (
    <View style={rootStyle}>
      <View className="flex-row items-center justify-between px-4 pb-2 bg-white border-b border-slate-100" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 justify-center items-center" onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">Chi tiết công việc</Text>
        <View className="w-10" />
      </View>

      {isLoading ? (
        <View style={[scrollStyle, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : !jobDetail ? (
        <View style={[scrollStyle, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
          <Text className="text-slate-500 font-medium text-center">Không tìm thấy thông tin công việc hoặc có lỗi xảy ra.</Text>
          <Button variant="outline" onPress={loadJobData} className="mt-4">Thử lại</Button>
        </View>
      ) : (
        <>
          <ScrollView
            style={scrollStyle} contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false} scrollEnabled={true}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
          >
            <RenderJobHeader jobDetail={jobDetail} />
            <RenderFarmerInfoCard 
              jobDetail={jobDetail} 
              isAuthenticated={isAuthenticated} 
              user={user} 
              lastMessage={lastMessage} 
              onChatPress={() => {
                // farmer.userId comes from JobDetailResponseDTO (enriched from reports)
                // This is the User table ID needed by the Messages API
                const partnerId = jobDetail.farmer?.userId;
                if (!partnerId) {
                  console.warn("No farmer userId available — worker may not have reports yet for this job.");
                  return;
                }
                
                let chatName = jobDetail.farmer.name;
                let chatAvatar = jobDetail.farmer.avatar;
                
                // Enrich from last message data if available
                if (lastMessage) {
                  const fId = partnerId.toLowerCase();
                  const partner = lastMessage.senderId?.toLowerCase() === fId 
                    ? lastMessage.sender 
                    : lastMessage.receiverId?.toLowerCase() === fId 
                      ? lastMessage.receiver 
                      : null;
                  if (partner) {
                    if (partner.name) chatName = partner.name;
                    if (partner.avatarUrl) chatAvatar = partner.avatarUrl;
                  }
                }

                navigation.navigate("Chat", { 
                  farmerId: partnerId, 
                  farmerName: chatName, 
                  farmerAvatar: chatAvatar 
                });
              }} 
            />
            <RenderJobInfoSections jobDetail={jobDetail} infoRows={infoRows} />
            <RenderTimeSlotsAndReports jobDetail={jobDetail} applicationInfo={applicationInfo} selectedTimeSlots={selectedTimeSlots} isApplied={isApplied} toggleTimeSlot={toggleTimeSlot} />

            <View style={{ height: 120 }} />
          </ScrollView>

          <RenderJobActionBar 
            jobDetail={jobDetail} selectedTimeSlots={selectedTimeSlots} isApplied={isApplied} 
            applicationInfo={applicationInfo} insets={insets} isSubmitting={isSubmitting} 
            onReportPress={() => navigation.navigate("SubmitReport", { jobApplicationId: applicationInfo.id })} 
            onApplyPress={handleQuickApply} 
          />
        </>
      )}

      <FeedbackModal visible={feedback.visible} title={feedback.title} message={feedback.message} variant={feedback.variant} onClose={closeFeedback} onConfirm={feedback.onConfirm} />
    </View>
  );
}
