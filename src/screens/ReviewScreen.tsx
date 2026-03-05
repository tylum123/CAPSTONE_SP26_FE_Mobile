import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Star } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING } from "../constants/theme";

export function ReviewScreen({ navigation, route }: any) {
  const { jobId } = route.params;
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Mock data
  const jobInfo = {
    id: jobId,
    title: "Thu hoạch lúa",
    farmer: {
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    completedDate: "18/01/2026",
    wage: 250000,
  };

  const reviewTags = [
    "Nhiệt tình",
    "Đúng giờ",
    "Rõ ràng",
    "Tử tế",
    "Công việc tốt",
    "Môi trường an toàn",
    "Trả lương đúng hạn",
    "Sẽ làm lại",
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá");
      return;
    }

    // TODO: Call API to submit review
    const reviewData = {
      jobId,
      rating,
      review,
      tags: selectedTags,
    };

    console.log("Submitting review:", reviewData);
    alert("Đánh giá của bạn đã được gửi thành công!");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đánh giá công việc</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <X size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Job Info */}
          <Card style={styles.jobCard}>
            <CardContent>
              <View style={styles.jobHeader}>
                <Avatar source={{ uri: jobInfo.farmer.avatar }} size={56} />
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{jobInfo.title}</Text>
                  <Text style={styles.farmerName}>{jobInfo.farmer.name}</Text>
                  <Text style={styles.completedDate}>
                    Hoàn thành: {jobInfo.completedDate}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Rating Section */}
          <Card style={styles.ratingCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>
                Bạn đánh giá thế nào về công việc này?
              </Text>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    onPressIn={() => setHoveredRating(star)}
                    onPressOut={() => setHoveredRating(0)}
                    style={styles.starButton}
                  >
                    <Star
                      size={48}
                      color={COLORS.amber[400]}
                      fill={
                        star <= (hoveredRating || rating)
                          ? COLORS.amber[400]
                          : "none"
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 && "Rất tệ"}
                  {rating === 2 && "Tệ"}
                  {rating === 3 && "Bình thường"}
                  {rating === 4 && "Tốt"}
                  {rating === 5 && "Xuất sắc"}
                </Text>
              )}
            </CardContent>
          </Card>

          {/* Tags Section */}
          <Card style={styles.tagsCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>
                Thêm nhãn đánh giá (tùy chọn)
              </Text>

              <View style={styles.tagsContainer}>
                {reviewTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tag,
                      selectedTags.includes(tag) && styles.tagSelected,
                    ]}
                    onPress={() => handleTagToggle(tag)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag) && styles.tagTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Review Text */}
          <Card style={styles.reviewCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>
                Chia sẻ trải nghiệm của bạn (tùy chọn)
              </Text>

              <TextInput
                style={styles.reviewInput}
                placeholder="Viết đánh giá chi tiết về công việc, người thuê, môi trường làm việc..."
                placeholderTextColor={COLORS.gray[400]}
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={6}
                maxLength={500}
                textAlignVertical="top"
              />

              <Text style={styles.characterCount}>
                {review.length}/500 ký tự
              </Text>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card style={styles.tipsCard}>
            <CardContent>
              <Text style={styles.tipsTitle}>💡 Gợi ý đánh giá:</Text>
              <Text style={styles.tipsText}>
                • Đánh giá về thái độ và sự hỗ trợ của người thuê{"\n"}• Điều
                kiện làm việc và môi trường{"\n"}• Tính rõ ràng của công việc
                {"\n"}• Việc thanh toán có đúng hạn không
              </Text>
            </CardContent>
          </Card>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            onPress={handleSubmit}
            disabled={rating === 0}
            style={styles.submitButton}
          >
            Gửi đánh giá
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  jobHeader: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  jobInfo: {
    flex: 1,
    justifyContent: "center",
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  farmerName: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  completedDate: {
    fontSize: 12,
    color: COLORS.emerald[600],
  },
  ratingCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  starButton: {
    padding: SPACING.xs,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.amber[600],
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  tagsCard: {
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  tagSelected: {
    backgroundColor: COLORS.emerald[100],
    borderColor: COLORS.emerald[600],
  },
  tagText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  tagTextSelected: {
    color: COLORS.emerald[700],
    fontWeight: "600",
  },
  reviewCard: {
    marginBottom: SPACING.md,
  },
  reviewInput: {
    minHeight: 120,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    fontSize: 15,
    color: COLORS.gray[900],
    lineHeight: 22,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: "right",
    marginTop: SPACING.xs,
  },
  tipsCard: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.blue[50],
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.blue[900],
    marginBottom: SPACING.sm,
  },
  tipsText: {
    fontSize: 13,
    color: COLORS.blue[800],
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  submitButton: {
    width: "100%",
  },
});
