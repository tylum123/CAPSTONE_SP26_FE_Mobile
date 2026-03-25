import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Star } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";

export function ReviewScreen({ navigation, route }: any) {
  const { jobId } = route.params;
  const [rating, setRating]           = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview]           = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const jobInfo = { id: jobId, title: "Thu hoạch lúa", farmer: { name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=12" }, completedDate: "18/01/2026" };
  const TAGS = ["Nhiệt tình", "Đúng giờ", "Rõ ràng", "Tử tế", "Công việc tốt", "Môi trường an toàn", "Trả lương đúng hạn", "Sẽ làm lại"];
  const RATING_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];

  const handleTagToggle = (tag: string) =>
    setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);

  const handleSubmit = () => {
    if (rating === 0) { alert("Vui lòng chọn số sao đánh giá"); return; }
    alert("Đánh giá của bạn đã được gửi thành công!");
    DeviceEventEmitter.emit("REFRESH_DATA");
    navigation.goBack();
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

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Job info */}
          <Card className="m-4 mb-0">
            <CardContent>
              <View className="flex-row gap-4">
                <Avatar source={{ uri: jobInfo.farmer.avatar }} size={56} />
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
                  <TouchableOpacity key={star} className="p-1" onPress={() => setRating(star)} onPressIn={() => setHoveredRating(star)} onPressOut={() => setHoveredRating(0)}>
                    <Star size={48} color="#fbbf24" fill={star <= (hoveredRating || rating) ? "#fbbf24" : "none"} />
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

        {/* Footer */}
        <View className="p-4 bg-white border-t border-slate-200">
          <Button onPress={handleSubmit} disabled={rating === 0} fullWidth>Gửi đánh giá</Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
