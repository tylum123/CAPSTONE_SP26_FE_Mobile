/* AI CONTEXT:
 * Action: Facilitates submitting or viewing ratings after job completion.
 * Inputs: Job ID, user rating score, written feedback.
 * Outputs: Review submission API request.
 * Dependencies: Rating service, Job context. */

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, DeviceEventEmitter, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Star, Calendar, Trash2 } from "lucide-react-native";
import { Avatar, FeedbackModal } from "../components/ui/export_ui_components";
import { ratingService } from "../services/rating.service";
import { jobService } from "../services/job.service";
import { dailyReportService } from "../services/daily_report.service";
import { hapticFeedback } from "../utils/haptic";
import { useAuth } from "../context/AuthContext";
import { handleError } from "../utils/errorHandler";
import { COLORS, SHADOWS } from "../constants/theme";

export function ReviewScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { jobId, raterId: passedRaterId, rateeId: passedRateeId, ratingId, existingRating } = route.params || {};
  const { user, isAuthenticated } = useAuth();
  
  const [rating, setRating]           = useState(existingRating?.ratingScore || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview]           = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (existingRating?.reviewText) {
      const match = existingRating.reviewText.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        const tags = match[1].split(", ").map((t: string) => t.trim());
        setSelectedTags(tags);
        setReview(match[2]);
      } else {
        setReview(existingRating.reviewText);
      }
    }
  }, [existingRating]);

  const [isLoading, setIsLoading] = useState(true);
  const [jobInfo, setJobInfo] = useState<any>(null);

  const TAGS = ["Nhiệt tình", "Đúng giờ", "Rõ ràng", "Tử tế", "Công việc tốt", "Môi trường an toàn", "Trả thù lao đúng hạn", "Sẽ làm lại"];
  const RATING_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];

  const handleTagToggle = (tag: string) =>
    setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ 
    visible: boolean; 
    title: string; 
    message: string; 
    variant: "success" | "error" | "info"; 
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onClose?: () => void;
  }>({ 
    visible: false, 
    title: "", 
    message: "", 
    variant: "info" 
  });

  const showFeedback = (params: { 
    title: string; 
    message: string; 
    variant?: "success" | "error" | "info"; 
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onClose?: () => void;
  }) => setFeedback({ 
    visible: true, 
    title: params.title, 
    message: params.message, 
    variant: params.variant || "info", 
    confirmLabel: params.confirmLabel,
    cancelLabel: params.cancelLabel,
    onConfirm: params.onConfirm,
    onClose: params.onClose
  });

  const closeFeedback = () => { 
    const cb = feedback.onClose; 
    setFeedback((p) => ({ ...p, visible: false })); 
    cb?.(); 
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        if (!jobId) {
          setIsLoading(false);
          return;
        }
        
        // Fetch real job data to get farmer detail and job title
        if (isAuthenticated && !user?.isDemo) {
          const [detail, reports] = await Promise.all([
            jobService.getJobPostDetail(jobId),
            dailyReportService.getReportsByJobPostId(jobId)
          ]);

          const reportWithFarmer = reports?.find(r => r?.farmer?.userId);
          const farmerUserId = reportWithFarmer?.farmer?.userId || detail?.farmer?.userId || detail?.farmerProfile?.userId || passedRateeId;

          setJobInfo({
            id: detail.id,
            title: detail.title || "Công việc nông nghiệp",
            farmer: {
              name: reportWithFarmer?.farmer?.contactName || detail?.farmer?.contactName || (detail?.contactName && detail?.contactName !== "string" ? detail?.contactName : "Chủ kinh doanh"),
              avatar: reportWithFarmer?.farmer?.avatarUrl || detail?.farmer?.avatarUrl || detail?.farmerProfile?.avatarUrl || undefined,
            },
            completedDate: new Date().toLocaleDateString("vi-VN"), // Typically updated date
            farmerProfileId: detail.farmerProfileId,
            farmerUserId: farmerUserId,
          });
        } else {
          // Keep mock data for Demo users
          setJobInfo({
             id: jobId, 
             title: "Thu hoạch lúa (Demo)", 
             farmer: { name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=12" }, 
             completedDate: new Date().toLocaleDateString("vi-VN"),
             farmerProfileId: passedRateeId || "00000000-0000-0000-0000-000000000000",
             farmerUserId: passedRateeId || "00000000-0000-0000-0000-000000000000"
          });
        }
      } catch (err) {
        console.error("Fetch job for review error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobDetail();
  }, [jobId, isAuthenticated, user?.isDemo, passedRateeId]);

  const handleRatingPress = (star: number) => {
    hapticFeedback.medium();
    setRating(star);
  };

  const handleSubmit = async () => {
    if (rating === 0) { 
      handleError(null, "Vui lòng chọn số sao đánh giá"); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      const actualRaterId = passedRaterId || user?.id || "00000000-0000-0000-0000-000000000000";
      // Backend REQUIRES User ID, not Profile ID for ratee
      const actualRateeId = passedRateeId || jobInfo?.farmerUserId || "00000000-0000-0000-0000-000000000000";

      if (ratingId) {
        await ratingService.updateRating(ratingId, {
          jobPostId: jobId,
          raterId: actualRaterId,
          rateeId: actualRateeId,
          ratingScore: rating,
          typeId: 2, 
          reviewText: selectedTags.length > 0 
            ? `[${selectedTags.join(", ")}] ${review}` 
            : review,
        });
      } else {
        await ratingService.createRating({
          jobPostId: jobId,
          raterId: actualRaterId,
          rateeId: actualRateeId,
          ratingScore: rating,
          typeId: 2, // 2 = WorkerToFarmer
          reviewText: selectedTags.length > 0 
            ? `[${selectedTags.join(", ")}] ${review}` 
            : review,
        });
      }
      
      hapticFeedback.success();
      showFeedback({ 
        title: "Thành công", 
        message: ratingId ? "Cập nhật đánh giá thành công!" : "Cảm ơn bạn đã đóng góp ý kiến để xây dựng cộng đồng nông nghiệp tốt hơn!", 
        variant: "success",
        onConfirm: () => {
          DeviceEventEmitter.emit("REFRESH_DATA");
          navigation.goBack();
        },
        onClose: () => {
          DeviceEventEmitter.emit("REFRESH_DATA");
          navigation.goBack();
        }
      });
    } catch (error: any) {
      hapticFeedback.error();
      handleError(error, "Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!ratingId) return;
    
    showFeedback({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa đánh giá này không?",
      variant: "info",
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          await ratingService.deleteRating(ratingId);
          hapticFeedback.success();
          DeviceEventEmitter.emit("REFRESH_DATA");
          showFeedback({
            title: "Đã xóa",
            message: "Đánh giá của bạn đã được xóa thành công.",
            variant: "success",
            onConfirm: () => navigation.goBack(),
            onClose: () => navigation.goBack()
          });
        } catch (error: any) {
          hapticFeedback.error();
          handleError(error, "Không thể xóa đánh giá lúc này.");
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="px-6 pt-10 pb-6 bg-white shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[28px] font-black text-slate-900 leading-tight">
                {ratingId ? "Sửa đánh giá" : "Đánh giá"}
              </Text>
              <Text className="text-[14px] text-slate-500 font-medium">Chia sẻ trải nghiệm làm việc của bạn</Text>
            </View>
            <View className="flex-row gap-2">
              {ratingId && (
                <TouchableOpacity 
                  className="w-10 h-10 rounded-full bg-rose-50 items-center justify-center border border-rose-100" 
                  onPress={handleDelete}
                  disabled={isSubmitting}
                >
                  <Trash2 size={20} color="#f43f5e" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center" 
                onPress={() => navigation.goBack()}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : !jobInfo ? (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-slate-500">Thiếu thông tin công việc, không thể đánh giá vào lúc này.</Text>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Job info */}
            <View className="mx-6 mt-6 mb-2">
              <View className="flex-row items-center gap-4 bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
                <Avatar 
                  source={jobInfo?.farmer?.avatar ? { uri: jobInfo?.farmer?.avatar } : undefined} 
                  fallback={jobInfo?.farmer?.name?.[0] || "C"}
                  size={60} 
                />
                <View className="flex-1">
                  <Text className="text-[17px] font-extrabold text-slate-900 mb-0.5" numberOfLines={1}>{jobInfo.title}</Text>
                  <Text className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">{jobInfo.farmer.name}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Calendar size={12} color="#94a3b8" />
                    <Text className="text-[11px] text-slate-400 font-medium">Hoàn thành: {jobInfo.completedDate}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Rating */}
            <View className="mx-6 mt-4">
              <Text className="text-[16px] font-black text-slate-800 mb-4 px-1">Mức độ hài lòng của bạn?</Text>
              <View className="bg-white rounded-[32px] p-8 items-center border border-slate-100 shadow-sm">
                <View className="flex-row justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity 
                      key={star} 
                      className="p-1" 
                      onPress={() => handleRatingPress(star)} 
                      onPressIn={() => setHoveredRating(star)} 
                      onPressOut={() => setHoveredRating(0)}
                      activeOpacity={0.7}
                    >
                      <Star 
                        size={44} 
                        color={star <= (hoveredRating || rating) ? "#fbbf24" : "#f1f5f9"} 
                        fill={star <= (hoveredRating || rating) ? "#fbbf24" : "none"} 
                        strokeWidth={1.5}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {rating > 0 ? (
                  <View className="mt-6 bg-amber-50 px-6 py-2 rounded-full border border-amber-100">
                    <Text className="text-[18px] font-black text-amber-600">{RATING_LABELS[rating]}</Text>
                  </View>
                ) : (
                  <Text className="mt-6 text-[14px] text-slate-400 font-medium italic">Chạm vào sao để đánh giá</Text>
                )}
              </View>
            </View>

            {/* Tags */}
            <View className="mx-6 mt-6">
              <Text className="text-[16px] font-black text-slate-800 mb-4 px-1">Điều gì làm bạn ấn tượng? <Text className="text-slate-400 font-medium">(Tùy chọn)</Text></Text>
              <View className="flex-row flex-wrap gap-2.5">
                {TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        backgroundColor: isSelected ? COLORS.primary[600] : COLORS.white,
                        borderColor: isSelected ? COLORS.primary[600] : COLORS.slate[100],
                        ...(isSelected ? SHADOWS.sm : {})
                      }}
                      onPress={() => handleTagToggle(tag)}
                    >
                      <Text style={{
                        fontSize: 13,
                        fontWeight: "900",
                        color: isSelected ? COLORS.white : COLORS.slate[600]
                      }}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Review text */}
            <View className="mx-6 mt-6 pb-10">
              <Text className="text-[16px] font-black text-slate-800 mb-4 px-1">Lời nhắn gửi <Text className="text-slate-400 font-medium">(Tùy chọn)</Text></Text>
              <View className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm">
                <TextInput
                  className="min-h-[140px] text-[15px] text-slate-900 leading-[24px]"
                  placeholder="Chia sẻ chi tiết hơn về trải nghiệm của bạn..." 
                  placeholderTextColor="#94a3b8"
                  value={review} 
                  onChangeText={setReview} 
                  multiline 
                  numberOfLines={6} 
                  maxLength={500} 
                  textAlignVertical="top"
                />
                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-50">
                  <Text className="text-[11px] text-slate-400 font-medium italic">Ý kiến của bạn giúp cộng đồng tốt hơn</Text>
                  <Text className="text-[11px] text-slate-500 font-bold">{review.length}/500</Text>
                </View>
              </View>
            </View>

          </ScrollView>
        )}

        {/* Footer */}
        <View 
          className="px-6 py-6 bg-white shadow-2xl"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <TouchableOpacity 
            className={["w-full h-[56px] rounded-2xl items-center justify-center shadow-lg transition-all", rating === 0 || isSubmitting ? "bg-slate-200" : "bg-primary-600"].join(" ")}
            onPress={handleSubmit} 
            disabled={rating === 0 || isSubmitting || isLoading || !jobInfo}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-[16px] font-black text-white uppercase tracking-widest">
                {ratingId ? "Cập nhật đánh giá" : "Gửi đánh giá ngay"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FeedbackModal
        visible={feedback.visible}
        title={feedback.title}
        message={feedback.message}
        variant={feedback.variant}
        confirmLabel={feedback.confirmLabel}
        cancelLabel={feedback.cancelLabel}
        onClose={closeFeedback}
        onConfirm={feedback.onConfirm}
      />
    </SafeAreaView>
  );
}
