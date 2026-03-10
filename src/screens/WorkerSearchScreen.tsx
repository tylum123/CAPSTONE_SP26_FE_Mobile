import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Banknote,
  Star,
  X,
  ChevronRight,
  Flame,
} from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { jobService, JobCategoryDTO, JobPostDTO } from "../services";

interface FilterOptions {
  jobType: string[];
  sortBy: "distance" | "wage" | "rating";
}

const mockCategories: JobCategoryDTO[] = [
  {
    id: "1",
    name: "Trồng trọt",
    description: "Gieo trồng, chăm sóc cây",
    isActive: true,
  },
  {
    id: "2",
    name: "Chăn nuôi",
    description: "Nuôi gia súc, gia cầm",
    isActive: true,
  },
  {
    id: "3",
    name: "Thu hoạch",
    description: "Gặt hái nông sản",
    isActive: true,
  },
  {
    id: "4",
    name: "Vận chuyển",
    description: "Di chuyển hàng hóa",
    isActive: true,
  },
  {
    id: "5",
    name: "Làm đất",
    description: "Cày xới, chuẩn bị đất",
    isActive: true,
  },
];

const _base = {
  statusId: "1",
  requiredSkills: "",
  latitude: 0,
  longitude: 0,
  startDate: "2026-01-20",
  endDate: "2026-01-22",
  workersNeeded: 5,
  workersAccepted: 1,
  wageTypeId: "1",
  paymentMethodId: "1",
  genderPreference: "none",
  ageRequirement: "any",
  publishedAt: "2026-01-01",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

const mockJobs: JobPostDTO[] = [
  {
    ..._base,
    id: "1",
    title: "Thu hoạch lúa",
    address: "Cần Thơ",
    wageAmount: 250000,
    estimatedHours: 8,
    jobCategoryId: "3",
    isUrgent: true,
    farmerProfileId: "abc",
    description: "Thu hoạch 5 mẫu ruộng lúa mùa đông",
  },
  {
    ..._base,
    id: "2",
    title: "Chăm sóc lợn",
    address: "Đồng Tháp",
    wageAmount: 300000,
    estimatedHours: 6,
    jobCategoryId: "2",
    isUrgent: false,
    farmerProfileId: "def",
    description: "Vệ sinh chuồng trại và cho ăn",
  },
  {
    ..._base,
    id: "3",
    title: "Phun thuốc trừ sâu",
    address: "Sóc Trăng",
    wageAmount: 200000,
    estimatedHours: 4,
    jobCategoryId: "1",
    isUrgent: false,
    farmerProfileId: "ghi",
    description: "Phun thuốc cho vườn cam 2 héc-ta",
  },
  {
    ..._base,
    id: "4",
    title: "Vận chuyển phân bón",
    address: "An Giang",
    wageAmount: 180000,
    estimatedHours: 5,
    jobCategoryId: "4",
    isUrgent: false,
    farmerProfileId: "jkl",
    description: "Bốc dỡ và vận chuyển 3 tấn phân bón",
  },
  {
    ..._base,
    id: "5",
    title: "Cày đất trồng rau",
    address: "Vĩnh Long",
    wageAmount: 280000,
    estimatedHours: 7,
    jobCategoryId: "5",
    isUrgent: true,
    farmerProfileId: "mno",
    description: "Cày xới 1 héc-ta đất chuẩn bị gieo hạt",
  },
  {
    ..._base,
    id: "6",
    title: "Hái cà phê",
    address: "Đắk Lắk",
    wageAmount: 220000,
    estimatedHours: 8,
    jobCategoryId: "3",
    isUrgent: false,
    farmerProfileId: "pqr",
    description: "Hái cà phê chín trên 3 héc-ta vườn",
  },
];

export function WorkerSearchScreen({ navigation }: any) {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [jobs, setJobs] = useState<JobPostDTO[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    jobType: [],
    sortBy: "distance",
  });

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) {
      setCategories(mockCategories);
      setJobs(mockJobs);
      return;
    }
    const loadData = async () => {
      try {
        const [jobPosts, jobCategories] = await Promise.all([
          jobService.getJobPosts(),
          jobService.getCategories(),
        ]);
        setJobs(jobPosts);
        setCategories(jobCategories);
      } catch {
        setJobs([]);
        setCategories([]);
      }
    };
    loadData().catch(() => undefined);
  }, [isAuthenticated, user?.isDemo]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const jobTypes = useMemo(() => categories.map((c) => c.name), [categories]);

  const toggleJobType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      jobType: prev.jobType.includes(type)
        ? prev.jobType.filter((t) => t !== type)
        : [...prev.jobType, type],
    }));
  };

  const mappedJobs = useMemo(
    () =>
      jobs.map((job) => ({
        id: job.id,
        title: job.title,
        farmer: "Chủ nông trại",
        location: job.address,
        distance: 0,
        wage: job.wageAmount,
        duration: job.estimatedHours ? `${job.estimatedHours} giờ` : "",
        rating: 0,
        jobType: categoryMap.get(job.jobCategoryId) || job.jobCategoryId,
        urgent: job.isUrgent,
      })),
    [jobs, categoryMap],
  );

  const filteredJobs = mappedJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filters.jobType.length === 0 || filters.jobType.includes(job.jobType);
    return matchesSearch && matchesType;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (filters.sortBy === "wage") return b.wage - a.wage;
    if (filters.sortBy === "rating") return b.rating - a.rating;
    return a.distance - b.distance;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Search size={18} color={COLORS.slate[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm công việc, địa điểm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.slate[300]}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color={COLORS.slate[400]} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal
            size={18}
            color={showFilters ? COLORS.emerald[600] : COLORS.slate[600]}
          />
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Job types */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
          >
            {jobTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  filters.jobType.includes(type) && styles.chipActive,
                ]}
                onPress={() => toggleJobType(type)}
              >
                <Text
                  style={[
                    styles.chipText,
                    filters.jobType.includes(type) && styles.chipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort */}
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Sắp xếp:</Text>
            {[
              { value: "distance", label: "Gần nhất" },
              { value: "wage", label: "Lương cao" },
              { value: "rating", label: "Đánh giá" },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.sortChip,
                  filters.sortBy === opt.value && styles.sortChipActive,
                ]}
                onPress={() =>
                  setFilters((prev) => ({ ...prev, sortBy: opt.value as any }))
                }
              >
                <Text
                  style={[
                    styles.sortText,
                    filters.sortBy === opt.value && styles.sortTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          <Text style={styles.resultsCount}>{sortedJobs.length}</Text> công việc
          phù hợp
        </Text>
        {(filters.jobType.length > 0 || filters.sortBy !== "distance") && (
          <TouchableOpacity
            onPress={() => setFilters({ jobType: [], sortBy: "distance" })}
          >
            <Text style={styles.clearFilters}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Job List */}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={sortedJobs}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: job }) => (
          <TouchableOpacity
            style={styles.jobCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
          >
            {/* left accent */}
            <View
              style={[
                styles.accent,
                job.urgent && { backgroundColor: COLORS.rose[500] },
              ]}
            />

            <View style={styles.cardBody}>
              {/* header row */}
              <View style={styles.cardHeader}>
                <Avatar fallback={job.farmer[0]} size={46} />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.jobFarmer}>{job.farmer}</Text>
                </View>
                <View style={styles.wageBox}>
                  {job.urgent && <Flame size={13} color={COLORS.rose[500]} />}
                  <Text style={styles.wageLabel}>
                    {job.wage.toLocaleString("vi-VN")}đ
                  </Text>
                </View>
              </View>

              {/* divider */}
              <View style={styles.divider} />

              {/* meta */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={13} color={COLORS.slate[400]} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {job.location}
                  </Text>
                </View>
                {job.duration ? (
                  <View style={styles.metaItem}>
                    <Clock size={13} color={COLORS.slate[400]} />
                    <Text style={styles.metaText}>{job.duration}</Text>
                  </View>
                ) : null}
                {job.rating > 0 && (
                  <View style={styles.metaItem}>
                    <Star
                      size={13}
                      color={COLORS.amber[400]}
                      fill={COLORS.amber[400]}
                    />
                    <Text style={styles.metaText}>{job.rating}</Text>
                  </View>
                )}
                <ChevronRight
                  size={16}
                  color={COLORS.slate[300]}
                  style={{ marginLeft: "auto" }}
                />
              </View>

              {/* tags */}
              {job.jobType && (
                <View style={styles.tagsRow}>
                  <Badge variant="secondary">{job.jobType}</Badge>
                  {job.urgent && <Badge variant="danger">🔥 Cần gấp</Badge>}
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Search size={48} color={COLORS.slate[200]} />
            <Text style={styles.emptyTitle}>Không tìm thấy việc phù hợp</Text>
            <Text style={styles.emptyText}>
              Thử thay đổi từ khóa hoặc xóa bộ lọc
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.sage[50] },

  /* Search header */
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.slate[50],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.slate[200],
    paddingHorizontal: SPACING.md,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.slate[800] },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.slate[50],
    borderWidth: 1.5,
    borderColor: COLORS.slate[200],
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: COLORS.emerald[50],
    borderColor: COLORS.emerald[300],
  },

  /* Filters */
  filtersPanel: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
    paddingVertical: SPACING.sm,
  },
  filterScroll: { marginBottom: SPACING.xs },
  filterScrollContent: { paddingHorizontal: SPACING.md, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.slate[100],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  chipActive: {
    backgroundColor: COLORS.emerald[50],
    borderColor: COLORS.emerald[500],
  },
  chipText: { fontSize: 13, color: COLORS.slate[600], fontWeight: "600" },
  chipTextActive: { color: COLORS.emerald[700] },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    gap: 8,
    marginTop: 4,
  },
  sortLabel: { fontSize: 13, color: COLORS.slate[500], fontWeight: "500" },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.slate[100],
  },
  sortChipActive: { backgroundColor: COLORS.emerald[600] },
  sortText: { fontSize: 13, color: COLORS.slate[600], fontWeight: "500" },
  sortTextActive: { color: COLORS.white, fontWeight: "700" },

  /* Results bar */
  resultsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  resultsText: { fontSize: 13, color: COLORS.slate[500] },
  resultsCount: { fontWeight: "700", color: COLORS.slate[800] },
  clearFilters: { fontSize: 13, color: COLORS.emerald[600], fontWeight: "600" },

  /* List */
  list: { flex: 1 },
  listContent: { padding: SPACING.md, paddingBottom: 110, gap: SPACING.sm },

  /* Job card */
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: "row",
    overflow: "hidden",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  accent: { width: 4, backgroundColor: COLORS.emerald[400] },
  cardBody: { flex: 1, padding: SPACING.md },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cardHeaderText: { flex: 1 },
  jobTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.slate[800],
    marginBottom: 2,
  },
  jobFarmer: { fontSize: 12, color: COLORS.slate[500] },
  wageBox: { alignItems: "flex-end", gap: 2 },
  wageLabel: { fontSize: 15, fontWeight: "800", color: COLORS.emerald[600] },
  divider: {
    height: 1,
    backgroundColor: COLORS.slate[100],
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: SPACING.sm,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.slate[500] },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },

  /* Empty */
  emptyWrap: { alignItems: "center", paddingTop: 60, gap: SPACING.sm },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.slate[600] },
  emptyText: { fontSize: 14, color: COLORS.slate[400], textAlign: "center" },
});
