import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  CheckCircle,
} from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { jobService, JobPostDTO } from "../services";
import { useAuth } from "../context/AuthContext";

export function JobDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { jobId } = route.params;
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const { isAuthenticated, user } = useAuth();

  const demoJobDetail = {
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
    },
    wage: 250000,
    duration: "1 ngày",
    workload: "5 mẫu ruộng (~2000m²)",
    requiredWorkers: 5,
    appliedWorkers: 2,
    requiredSkills: "Thu hoạch, Vận chuyển",
    genderPreference: "Không yêu cầu",
    ageRequirement: "18-55",
    wageTypeId: "Theo ngày",
    paymentMethodId: "Tiền mặt",
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

  const emptyJobDetail = {
    ...demoJobDetail,
    title: "",
    description: "",
    location: { ...demoJobDetail.location, address: "", distance: 0 },
    wage: 0,
    duration: "",
    workload: "",
    requiredWorkers: 0,
    appliedWorkers: 0,
    requiredSkills: "",
    genderPreference: "",
    ageRequirement: "",
    wageTypeId: "",
    paymentMethodId: "",
    jobType: "",
    urgent: false,
    postedDate: "",
  };

  const [jobDetail, setJobDetail] = useState(demoJobDetail);

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) {
      setJobDetail(demoJobDetail);
      return;
    }
    const loadJobDetail = async () => {
      try {
        const data = await jobService.getJobPostDetail(String(jobId));
        setJobDetail({
          ...demoJobDetail,
          id: data.id,
          title: data.title,
          description: data.description,
          jobType: data.jobCategoryId,
          location: {
            ...demoJobDetail.location,
            address: data.address,
            distance: 0,
          },
          wage: data.wageAmount,
          duration: data.estimatedHours ? `${data.estimatedHours} giờ` : "N/A",
          requiredWorkers: data.workersNeeded,
          appliedWorkers: data.workersAccepted,
          workload: data.estimatedHours
            ? `${data.estimatedHours} giờ`
            : demoJobDetail.workload,
          farmer: { ...demoJobDetail.farmer, name: data.farmerProfileId },
          requiredSkills: data.requiredSkills,
          genderPreference: data.genderPreference,
          ageRequirement: data.ageRequirement,
          wageTypeId: data.wageTypeId,
          paymentMethodId: data.paymentMethodId,
          urgent: data.isUrgent,
          postedDate: data.publishedAt
            ? new Date(data.publishedAt).toLocaleDateString("vi-VN")
            : demoJobDetail.postedDate,
        });
      } catch {
        setJobDetail(emptyJobDetail);
      }
    };
    loadJobDetail().catch(() => undefined);
  }, [isAuthenticated, user?.isDemo, jobId]);

  const toggleTimeSlot = (slotId: number) => {
    const slot = jobDetail.timeSlots.find((s) => s.id === slotId);
    if (!slot?.available) return;
    const key = `${slot.date}-${slot.time}`;
    setSelectedTimeSlots((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  };

  const handleQuickApply = () => {
    if (selectedTimeSlots.length === 0) {
      alert("Vui lòng chọn ít nhất một khung giờ");
      return;
    }
    alert(`Đã apply thành công cho ${selectedTimeSlots.length} khung giờ!`);
    navigation.goBack();
  };

  const infoRows = [
    {
      icon: MapPin,
      label: "Địa điểm",
      value: jobDetail.location.address,
      hint: `Cách bạn ${jobDetail.location.distance} km`,
    },
    { icon: Clock, label: "Thời gian", value: jobDetail.duration },
    { icon: Briefcase, label: "Khối lượng", value: jobDetail.workload },
    {
      icon: Users,
      label: "Số người tuyển",
      value: `${jobDetail.requiredWorkers} người (đã có ${jobDetail.appliedWorkers})`,
    },
    {
      icon: Wrench,
      label: "Kỹ năng yêu cầu",
      value: jobDetail.requiredSkills || "Không yêu cầu",
    },
    {
      icon: Users,
      label: "Giới tính",
      value: jobDetail.genderPreference || "Không yêu cầu",
    },
    {
      icon: Calendar,
      label: "Độ tuổi",
      value: jobDetail.ageRequirement || "Không yêu cầu",
    },
    {
      icon: Banknote,
      label: "Hình thức lương",
      value: jobDetail.wageTypeId || "N/A",
    },
    {
      icon: Briefcase,
      label: "Thanh toán",
      value: jobDetail.paymentMethodId || "N/A",
    },
  ];

  return (
    <View style={styles.root}>
      {/* ── HEADER ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={COLORS.slate[700]} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Chi tiết công việc</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── JOB HERO ── */}
        <View style={styles.jobHero}>
          {/* type tag */}
          {jobDetail.jobType ? (
            <Badge
              variant={jobDetail.urgent ? "danger" : "success"}
              style={styles.heroTag}
            >
              {jobDetail.urgent ? "🔥 Cần gấp" : jobDetail.jobType}
            </Badge>
          ) : null}

          <Text style={styles.heroTitle}>{jobDetail.title}</Text>
          <Text style={styles.heroLocation}>
            <MapPin size={14} color={COLORS.emerald[600]} />{" "}
            {jobDetail.location.address}
          </Text>

          {/* wage highlight */}
          <View style={styles.wageRow}>
            <View style={styles.wagePill}>
              <Banknote size={20} color={COLORS.emerald[600]} />
              <Text style={styles.wageAmount}>
                {jobDetail.wage.toLocaleString("vi-VN")}
                <Text style={styles.wageCurrency}> đ</Text>
              </Text>
            </View>
            <Text style={styles.wageType}>
              / {jobDetail.wageTypeId || "ngày"}
            </Text>
          </View>
        </View>

        {/* ── FARMER CARD ── */}
        {!isAuthenticated || user?.isDemo ? (
          <View style={styles.farmerCard}>
            <Avatar source={{ uri: jobDetail.farmer.avatar }} size={50} />
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>{jobDetail.farmer.name}</Text>
              <View style={styles.farmerRating}>
                <Star
                  size={14}
                  color={COLORS.amber[400]}
                  fill={COLORS.amber[400]}
                />
                <Text style={styles.farmerRatingText}>
                  {jobDetail.farmer.rating}
                </Text>
                <Text style={styles.farmerJobs}>
                  • {jobDetail.farmer.totalJobs} công việc
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() =>
                navigation.navigate("Chat", { farmerId: jobDetail.farmer.name })
              }
            >
              <MessageCircle size={18} color={COLORS.emerald[600]} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.farmerCard}>
            <Avatar fallback="#" size={50} />
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>
                Farmer ID: {jobDetail.farmer?.name || "N/A"}
              </Text>
            </View>
          </View>
        )}

        {/* ── DESCRIPTION ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả công việc</Text>
          <Text style={styles.descText}>{jobDetail.description}</Text>
        </View>

        {/* ── INFO GRID ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <View style={styles.infoGrid}>
            {infoRows.map((row, i) => {
              const IconComp = row.icon;
              return (
                <View key={i} style={styles.infoItem}>
                  <View style={styles.infoIconWrap}>
                    <IconComp size={16} color={COLORS.emerald[600]} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                    {row.hint && (
                      <Text style={styles.infoHint}>{row.hint}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── TOOLS ── */}
        {(!isAuthenticated || user?.isDemo) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dụng cụ</Text>
            <View style={styles.toolsGrid}>
              {jobDetail.requiredTools.map((tool, i) => (
                <View
                  key={`r-${i}`}
                  style={[styles.toolChip, styles.toolChipRequired]}
                >
                  <Wrench size={13} color={COLORS.amber[600]} />
                  <Text style={styles.toolChipText}>{tool}</Text>
                  <Text style={styles.toolTag}>Tự mang</Text>
                </View>
              ))}
              {jobDetail.providedTools.map((tool, i) => (
                <View
                  key={`p-${i}`}
                  style={[styles.toolChip, styles.toolChipProvided]}
                >
                  <CheckCircle size={13} color={COLORS.emerald[600]} />
                  <Text style={styles.toolChipText}>{tool}</Text>
                  <Text
                    style={[styles.toolTag, { color: COLORS.emerald[600] }]}
                  >
                    Có sẵn
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── TIME SLOTS ── */}
        {(!isAuthenticated || user?.isDemo) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
            <Text style={styles.slotHint}>
              Chọn các khung giờ bạn có thể làm việc
            </Text>
            <View style={styles.slotsGrid}>
              {jobDetail.timeSlots.map((slot) => {
                const key = `${slot.date}-${slot.time}`;
                const selected = selectedTimeSlots.includes(key);
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotCard,
                      !slot.available && styles.slotDisabled,
                      selected && styles.slotSelected,
                    ]}
                    onPress={() => toggleTimeSlot(slot.id)}
                    disabled={!slot.available}
                    activeOpacity={0.85}
                  >
                    <Calendar
                      size={18}
                      color={
                        selected
                          ? COLORS.white
                          : slot.available
                            ? COLORS.emerald[600]
                            : COLORS.slate[300]
                      }
                    />
                    <Text
                      style={[
                        styles.slotDate,
                        selected && styles.slotTextSelected,
                        !slot.available && styles.slotTextDisabled,
                      ]}
                    >
                      {slot.date}
                    </Text>
                    <Text
                      style={[
                        styles.slotTime,
                        selected && styles.slotTextSelected,
                        !slot.available && styles.slotTextDisabled,
                      ]}
                    >
                      {slot.time}
                    </Text>
                    {!slot.available && (
                      <Badge variant="secondary">Đã đủ</Badge>
                    )}
                    {selected && slot.available && (
                      <View style={styles.slotCheck}>
                        <Text style={styles.slotCheckMark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── FOOTER / APPLY ── */}
      {(!isAuthenticated || user?.isDemo) && (
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + SPACING.sm }]}
        >
          <View style={styles.footerLeft}>
            <Text style={styles.footerLabel}>Thu nhập dự kiến</Text>
            <Text style={styles.footerAmount}>
              {(jobDetail.wage * selectedTimeSlots.length).toLocaleString(
                "vi-VN",
              )}{" "}
              đ
            </Text>
            {selectedTimeSlots.length > 0 && (
              <Text style={styles.footerSlots}>
                {selectedTimeSlots.length} khung giờ
              </Text>
            )}
          </View>
          <Button
            onPress={handleQuickApply}
            disabled={selectedTimeSlots.length === 0}
            size="lg"
            style={styles.applyBtn}
          >
            Ứng tuyển ngay
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.sage[50] },

  /* Top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.slate[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  topBarTitle: { fontSize: 16, fontWeight: "700", color: COLORS.slate[800] },

  scrollContent: { padding: SPACING.md },

  /* Job hero */
  jobHero: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  heroTag: { marginBottom: SPACING.sm, alignSelf: "flex-start" },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.slate[900],
    letterSpacing: -0.4,
    marginBottom: SPACING.xs,
  },
  heroLocation: {
    fontSize: 13,
    color: COLORS.slate[500],
    marginBottom: SPACING.md,
  },
  wageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.emerald[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.emerald[100],
  },
  wagePill: { flexDirection: "row", alignItems: "center", gap: 8 },
  wageAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.emerald[700],
    letterSpacing: -0.5,
  },
  wageCurrency: { fontSize: 18, fontWeight: "600" },
  wageType: { fontSize: 14, color: COLORS.slate[500] },

  /* Farmer card */
  farmerCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.xs,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  farmerInfo: { flex: 1 },
  farmerName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.slate[800],
    marginBottom: 4,
  },
  farmerRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  farmerRatingText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.slate[700],
  },
  farmerJobs: { fontSize: 13, color: COLORS.slate[500] },
  chatBtn: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.emerald[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
  },

  /* Section */
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.xs,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.slate[800],
    marginBottom: SPACING.md,
    letterSpacing: -0.2,
  },
  descText: { fontSize: 14, color: COLORS.slate[600], lineHeight: 22 },

  /* Info grid */
  infoGrid: { gap: 12 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.emerald[50],
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: COLORS.slate[400],
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  infoValue: { fontSize: 14, color: COLORS.slate[700], fontWeight: "600" },
  infoHint: { fontSize: 12, color: COLORS.emerald[600], marginTop: 2 },

  /* Tools */
  toolsGrid: { gap: 8 },
  toolChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  toolChipRequired: {
    backgroundColor: COLORS.amber[50],
    borderColor: COLORS.amber[200],
  },
  toolChipProvided: {
    backgroundColor: COLORS.emerald[50],
    borderColor: COLORS.emerald[200],
  },
  toolChipText: { flex: 1, fontSize: 13, color: COLORS.slate[700] },
  toolTag: { fontSize: 11, fontWeight: "700", color: COLORS.amber[600] },

  /* Time slots */
  slotHint: {
    fontSize: 13,
    color: COLORS.slate[400],
    marginBottom: SPACING.md,
  },
  slotsGrid: { gap: 10 },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.slate[200],
  },
  slotDisabled: {
    backgroundColor: COLORS.slate[50],
    borderColor: COLORS.slate[100],
  },
  slotSelected: {
    backgroundColor: COLORS.emerald[600],
    borderColor: COLORS.emerald[700],
  },
  slotDate: { fontSize: 15, fontWeight: "700", color: COLORS.slate[800] },
  slotTime: { fontSize: 13, color: COLORS.slate[500] },
  slotTextSelected: { color: COLORS.white },
  slotTextDisabled: { color: COLORS.slate[300] },
  slotCheck: {
    marginLeft: "auto",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  slotCheckMark: {
    fontSize: 14,
    color: COLORS.emerald[600],
    fontWeight: "800",
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100],
    ...SHADOWS.lg,
  },
  footerLeft: { flex: 1 },
  footerLabel: { fontSize: 12, color: COLORS.slate[500] },
  footerAmount: { fontSize: 22, fontWeight: "800", color: COLORS.emerald[700] },
  footerSlots: { fontSize: 12, color: COLORS.slate[400] },
  applyBtn: { flexShrink: 0 },
});
