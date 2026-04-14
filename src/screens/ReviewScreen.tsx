/* AI CONTEXT:
 * Action: Facilitates submitting or viewing ratings after job completion.
 * Inputs: Job ID, user rating score, written feedback.
 * Outputs: Review submission API request.
 * Dependencies: Rating service, Job context. */

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, DeviceEventEmitter, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Star } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { ratingService } from "../services/rating.service";
import { jobService } from "../services/job.service";
import { hapticFeedback } from "../utils/haptic";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { useAuth } from "../context/AuthContext";

export function ReviewScreen({ navigation, route }: any) {
  const { jobId, raterId: passedRaterId, rateeId: passedRateeId } = route.params || {};
  const { user, isAuthenticated } = useAuth();
  
  const [rating, setRating]           = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview]           = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
    onConfirm?: () => void 
  }>({ 
    visible: false, 
    title: "", 
    message: "", 
    variant: "info" 
  });

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        if (!jobId) {
          setIsLoading(false);
          return;
        }
        
        // Fetch real job data to get farmer detail and job title
        if (isAuthenticated && !user?.isDemo) {
          const detail = await jobService.getJobPostDetail(jobId);
          setJobInfo({
            id: detail.id,
            title: detail.title || "Công việc nông nghiệp",
            farmer: {
              name: detail.contactName && detail.contactName !== "string" ? detail.contactName : "Chủ kinh doanh",
              avatar: (detail as any).farmerAvatar || (detail as any).avatarUrl || undefined,
            },
            completedDate: new Date().toLocaleDateString("vi-VN"), // Typically updated date
            farmerProfileId: detail.farmerProfileId,
          });
        } else {
          // Keep mock data for Demo users
          setJobInfo({
             id: jobId, 
             title: "Thu hoạch lúa (Demo)", 
             farmer: { name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=12" }, 
             completedDate: new Date().toLocaleDateString("vi-VN"),
             farmerProfileId: passedRateeId || "00000000-0000-0000-0000-000000000000"
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

  const showFeedback = (params: { 
    title: string; 
    message: string; 
    variant?: "success" | "error" | "info"; 
    onConfirm?: () => void 
  }) => setFeedback({ 
    visible: true, 
    title: params.title, 
    message: params.message, 
    variant: params.variant || "info", 
    onConfirm: params.onConfirm 
  });

  const closeFeedback = () => { 
    const cb = feedback.onConfirm; 
    setFeedback((p) => ({ ...p, visible: false })); 
    cb?.(); 
  };

  const handleRatingPress = (star: number) => {
    hapticFeedback.medium();
    setRating(star);
  };

  const handleSubmit = async () => {
    if (rating === 0) { 
      showFeedback({ title: "Thông báo", message: "Vui lòng chọn số sao đánh giá", variant: "info" }); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      const actualRaterId = passedRaterId || user?.id || "00000000-0000-0000-0000-000000000000";
      const actualRateeId = passedRateeId || jobInfo?.farmerProfileId || "00000000-0000-0000-0000-000000000000";

      await ratingService.createRating({
        jobPostId: jobId,
        raterId: actualRaterId,
        rateeId: actualRateeId,
        ratingScore: rating,
        reviewText: selectedTags.length > 0 
          ? `[${selectedTags.join(", ")}] ${review}` 
          : review,
      });
      
      hapticFeedback.success();
      showFeedback({ 
        title: "Thành công", 
        message: "Cảm ơn bạn đã đóng góp ý kiến để xây dựng cộng đồng nông nghiệp tốt hơn!", 
        variant: "success",
        onConfirm: () => {
          DeviceEventEmitter.emit("REFRESH_DATA");
          navigation.goBack();
        }
      });
    } catch (error: any) {
      hapticFeedback.error();
      showFeedback({ 
        title: "Lỗi", 
        message: error.message || "Không thể gửi đánh giá. Vui lòng thử lại sau.", 
        variant: "error" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <Text className="text-xl font-bold text-slate-900">Đánh giá công việc</Text>
          <TouchableOpacity className="p-1" onPress={() => navigation.goBack()}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
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
            <Card className="m-4 mb-0">
              <CardContent>
                <View className="flex-row gap-4">
                  <Avatar 
                    source={jobInfo.farmer.avatar ? { uri: jobInfo.farmer.avatar } : undefined} 
                    fallback={jobInfo.farmer.name?.[0] || "C"}
                    size={56} 
                  />
                  <View className="flex-1 justify-center">
                    <Text className="text-lg font-bold text-slate-900 mb-1">{jobInfo.title}</Text>
                    <Text className="text-sm text-slate-600 mb-1">{jobInfo.farmer.name}</Text>
                    <Text className="text-xs text-primary-600">Hoàn thành: {jobInfo.completedDate}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Rating */}
            <Card className="m-4 mb-0">
              <CardContent>
                <Text className="text-base font-semibold text-slate-900 mb-4">Bạn đánh giá thế nào về công việc này?</Text>
                <View className="flex-row justify-center gap-2 my-4">
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
                        size={48} 
                        color={star <= (hoveredRating || rating) ? "#fbbf24" : "#e2e8f0"} 
                        fill={star <= (hoveredRating || rating) ? "#fbbf24" : "none"} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {rating > 0 && (
                  <Text className="text-lg font-semibold text-rice-600 text-center mt-2">{RATING_LABELS[rating]}</Text>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="m-4 mb-0">
              <CardContent>
                <Text className="text-base font-semibold text-slate-900 mb-4">Thêm nhãn đánh giá (tùy chọn)</Text>
                <View className="flex-row flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      className={["px-4 py-2 border", selectedTags.includes(tag) ? "bg-primary-100 border-primary-600" : "bg-slate-100 border-slate-200"].join(" ")}
                      onPress={() => handleTagToggle(tag)}
                    >
                      <Text className={selectedTags.includes(tag) ? "text-sm text-primary-700 font-semibold" : "text-sm text-slate-600"}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </CardContent>
            </Card>

            {/* Review text */}
            <Card className="m-4 mb-0">
              <CardContent>
                <Text className="text-base font-semibold text-slate-900 mb-4">Chia sẻ trải nghiệm của bạn (tùy chọn)</Text>
                <TextInput
                  className="min-h-[120px] p-4 bg-slate-50 border border-slate-200 text-[15px] text-slate-900 leading-[22px]"
                  placeholder="Viết đánh giá chi tiết về công việc, người thuê, môi trường làm việc..." placeholderTextColor="#9ca3af"
                  value={review} onChangeText={setReview} multiline numberOfLines={6} maxLength={500} textAlignVertical="top"
                />
                <Text className="text-xs text-slate-500 text-right mt-1">{review.length}/500 ký tự</Text>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="m-4 bg-blue-50">
              <CardContent>
                <Text className="text-sm font-semibold text-blue-900 mb-2">💡 Gợi ý đánh giá:</Text>
                <Text className="text-[13px] text-blue-800 leading-5">
                  • Đánh giá về thái độ và sự hỗ trợ của người thuê{"\n"}• Điều kiện làm việc và môi trường{"\n"}• Tính rõ ràng của công việc{"\n"}• Việc thanh toán có đúng hạn không
                </Text>
              </CardContent>
            </Card>
          </ScrollView>
        )}

        {/* Footer */}
        <View className="p-4 bg-white border-t border-slate-200">
          <Button 
            onPress={handleSubmit} 
            disabled={rating === 0 || isSubmitting || isLoading || !jobInfo} 
            loading={isSubmitting}
            fullWidth
          >
            Gửi đánh giá
          </Button>
        </View>
      </View>

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
