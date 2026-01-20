import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import {
  MapPin,
  Clock,
  Banknote,
  Star,
  Calendar,
  Users,
  Wrench,
  Briefcase,
  MessageCircle,
  ArrowLeft,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { tabBarTranslateY } from "../navigation/WorkerTabNavigator";

export function JobDetailScreen({ navigation, route }: any) {
  const { jobId } = route.params;
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const scrollY = useRef(0);
  const lastScrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;

    if (scrollDiff > 5) {
      // Scrolling down - hide tab bar
      Animated.timing(tabBarTranslateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (scrollDiff < -5) {
      // Scrolling up - show tab bar
      Animated.timing(tabBarTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };

  // Mock data - sẽ thay bằng API call
  const jobDetail = {
    id: jobId,
    title: "Thu hoạch lúa mùa",
    description:
      "Cần tuyển người thu hoạch lúa cho 5 mẫu ruộng. Công việc bao gồm: gặt lúa, phơi lúa, và vận chuyển vào kho. Yêu cầu có kinh nghiệm làm việc ngoài trời và chịu khó.",
    farmer: {
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=12",
      rating: 4.8,
      totalJobs: 45,
    },
    location: {
      address: "Ấp Tân Thạnh, xã Tân Lộc, huyện Thốt Nốt, TP. Cần Thơ",
      distance: 2.5,
      coordinates: { lat: 10.029, lng: 105.785 },
    },
    wage: 250000,
    duration: "1 ngày",
    workload: "5 mẫu ruộng (~2000m²)",
    requiredWorkers: 5,
    appliedWorkers: 2,
    requiredTools: [
      "Liềm cắt lúa",
      "Găng tay bảo hộ",
      "Nón lá",
      "Bao tải đựng lúa",
    ],
    providedTools: ["Máy gặt lúa", "Xe vận chuyển"],
    timeSlots: [
      { id: 1, date: "22/01/2026", time: "06:00 - 12:00", available: true },
      { id: 2, date: "22/01/2026", time: "13:00 - 18:00", available: true },
      { id: 3, date: "23/01/2026", time: "06:00 - 12:00", available: true },
      { id: 4, date: "23/01/2026", time: "13:00 - 18:00", available: false },
    ],
    jobType: "Thu hoạch",
    urgent: true,
    postedDate: "20/01/2026",
  };

  const toggleTimeSlot = (slotId: number) => {
    const slot = jobDetail.timeSlots.find((s) => s.id === slotId);
    if (!slot?.available) return;

    const slotKey = `${slot.date}-${slot.time}`;
    setSelectedTimeSlots((prev) =>
      prev.includes(slotKey)
        ? prev.filter((s) => s !== slotKey)
        : [...prev, slotKey]
    );
  };

  const handleQuickApply = () => {
    if (selectedTimeSlots.length === 0) {
      alert("Vui lòng chọn ít nhất một khung giờ làm việc");
      return;
    }
    // TODO: Call API to apply
    alert(`Đã apply thành công cho ${selectedTimeSlots.length} khung giờ!`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết công việc</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Job Header */}
        <Card style={styles.jobHeader}>
          <CardContent>
            {jobDetail.urgent && (
              <Badge variant="danger" style={styles.urgentBadge}>
                Tuyển gấp
              </Badge>
            )}
            <Text style={styles.jobTitle}>{jobDetail.title}</Text>
            <Badge variant="secondary" style={styles.jobTypeBadge}>
              {jobDetail.jobType}
            </Badge>

            <View style={styles.wageSection}>
              <Banknote size={24} color={COLORS.emerald[600]} />
              <View>
                <Text style={styles.wageLabel}>Mức lương</Text>
                <Text style={styles.wageAmount}>
                  {jobDetail.wage.toLocaleString("vi-VN")} VNĐ
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Farmer Info */}
        <Card style={styles.farmerCard}>
          <CardContent>
            <View style={styles.farmerHeader}>
              <Avatar source={{ uri: jobDetail.farmer.avatar }} size={48} />
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerName}>{jobDetail.farmer.name}</Text>
                <View style={styles.farmerStats}>
                  <Star
                    size={14}
                    color={COLORS.amber[400]}
                    fill={COLORS.amber[400]}
                  />
                  <Text style={styles.ratingText}>
                    {jobDetail.farmer.rating}
                  </Text>
                  <Text style={styles.statsText}>
                    • {jobDetail.farmer.totalJobs} công việc
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() =>
                  navigation.navigate("Chat", {
                    farmerId: jobDetail.farmer.name,
                  })
                }
              >
                <MessageCircle size={20} color={COLORS.emerald[600]} />
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card style={styles.detailCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Thông tin công việc</Text>

            <View style={styles.detailRow}>
              <MapPin size={20} color={COLORS.emerald[600]} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Địa điểm</Text>
                <Text style={styles.detailText}>
                  {jobDetail.location.address}
                </Text>
                <Text style={styles.distanceText}>
                  Cách bạn {jobDetail.location.distance} km
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Clock size={20} color={COLORS.emerald[600]} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Thời gian</Text>
                <Text style={styles.detailText}>{jobDetail.duration}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Briefcase size={20} color={COLORS.emerald[600]} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Khối lượng công việc</Text>
                <Text style={styles.detailText}>{jobDetail.workload}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Users size={20} color={COLORS.emerald[600]} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Số người cần tuyển</Text>
                <Text style={styles.detailText}>
                  {jobDetail.requiredWorkers} người (đã có{" "}
                  {jobDetail.appliedWorkers})
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Description */}
        <Card style={styles.descriptionCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Mô tả công việc</Text>
            <Text style={styles.description}>{jobDetail.description}</Text>
          </CardContent>
        </Card>

        {/* Required Tools */}
        <Card style={styles.toolsCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Công cụ cần thiết</Text>
            <View style={styles.toolsList}>
              {jobDetail.requiredTools.map((tool, index) => (
                <View key={index} style={styles.toolItem}>
                  <Wrench size={16} color={COLORS.emerald[600]} />
                  <Text style={styles.toolText}>{tool}</Text>
                  <Badge variant="secondary">Tự mang</Badge>
                </View>
              ))}
              {jobDetail.providedTools.map((tool, index) => (
                <View key={`provided-${index}`} style={styles.toolItem}>
                  <Wrench size={16} color={COLORS.gray[400]} />
                  <Text style={styles.toolText}>{tool}</Text>
                  <Badge variant="success">Có sẵn</Badge>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card style={styles.timeSlotsCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Chọn khung giờ làm việc</Text>
            <Text style={styles.timeSlotHint}>
              Chọn các khung giờ bạn có thể làm việc
            </Text>
            {jobDetail.timeSlots.map((slot) => {
              const slotKey = `${slot.date}-${slot.time}`;
              const isSelected = selectedTimeSlots.includes(slotKey);

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlot,
                    !slot.available && styles.timeSlotDisabled,
                    isSelected && styles.timeSlotSelected,
                  ]}
                  onPress={() => toggleTimeSlot(slot.id)}
                  disabled={!slot.available}
                >
                  <View style={styles.timeSlotContent}>
                    <Calendar
                      size={20}
                      color={isSelected ? COLORS.white : COLORS.emerald[600]}
                    />
                    <View style={styles.timeSlotInfo}>
                      <Text
                        style={[
                          styles.timeSlotDate,
                          !slot.available && styles.timeSlotTextDisabled,
                          isSelected && styles.timeSlotTextSelected,
                        ]}
                      >
                        {slot.date}
                      </Text>
                      <Text
                        style={[
                          styles.timeSlotTime,
                          !slot.available && styles.timeSlotTextDisabled,
                          isSelected && styles.timeSlotTextSelected,
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </View>
                  </View>
                  {!slot.available && <Badge variant="secondary">Đã đủ</Badge>}
                  {isSelected && slot.available && (
                    <View style={styles.selectedCheck}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </CardContent>
        </Card>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Tổng thu nhập dự kiến</Text>
          <Text style={styles.footerAmount}>
            {(jobDetail.wage * selectedTimeSlots.length).toLocaleString(
              "vi-VN"
            )}{" "}
            VNĐ
          </Text>
          {selectedTimeSlots.length > 0 && (
            <Text style={styles.footerSubtext}>
              {selectedTimeSlots.length} khung giờ được chọn
            </Text>
          )}
        </View>
        <Button
          onPress={handleQuickApply}
          disabled={selectedTimeSlots.length === 0}
          style={styles.applyButton}
        >
          Ứng tuyển ngay
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.emerald[50],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  jobHeader: {
    marginBottom: SPACING.md,
  },
  urgentBadge: {
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  jobTypeBadge: {
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  wageSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.emerald[50],
    borderRadius: BORDER_RADIUS.md,
  },
  wageLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  wageAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.emerald[700],
  },
  farmerCard: {
    marginBottom: SPACING.md,
  },
  farmerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  farmerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[700],
  },
  statsText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  chatButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.emerald[50],
    borderRadius: BORDER_RADIUS.full,
  },
  detailCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.emerald[600],
    marginTop: SPACING.xs,
  },
  descriptionCard: {
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  toolsCard: {
    marginBottom: SPACING.md,
  },
  toolsList: {
    gap: SPACING.sm,
  },
  toolItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
  },
  toolText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray[700],
  },
  timeSlotsCard: {
    marginBottom: SPACING.xl,
  },
  timeSlotHint: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  timeSlotDisabled: {
    backgroundColor: COLORS.gray[50],
    borderColor: COLORS.gray[100],
  },
  timeSlotSelected: {
    backgroundColor: COLORS.emerald[600],
    borderColor: COLORS.emerald[700],
  },
  timeSlotContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  timeSlotInfo: {
    gap: SPACING.xs,
  },
  timeSlotDate: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  timeSlotTime: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  timeSlotTextDisabled: {
    color: COLORS.gray[400],
  },
  timeSlotTextSelected: {
    color: COLORS.white,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    fontSize: 16,
    color: COLORS.emerald[600],
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.emerald[700],
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  applyButton: {
    paddingHorizontal: SPACING.lg,
  },
});
