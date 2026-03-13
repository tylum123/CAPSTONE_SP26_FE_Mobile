import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Banknote,
  Star,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ListItem } from "../components/ui/ListItem";
import { Avatar } from "../components/ui/Avatar";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from "../constants/theme";
import { jobService, JobCategoryDTO, JobPostDTO } from "../services";

interface FilterOptions {
  jobType: string[];
  maxDistance: number;
  minWage: number;
  maxWage: number;
  sortBy: "distance" | "wage" | "rating";
}

export function WorkerSearchScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [jobs, setJobs] = useState<JobPostDTO[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    jobType: [],
    maxDistance: 50,
    minWage: 0,
    maxWage: 1000000,
    sortBy: "distance",
  });

  useEffect(() => {
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
  }, []);

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
    const matchesDistance = job.distance <= filters.maxDistance;
    const matchesWage =
      job.wage >= filters.minWage && job.wage <= filters.maxWage;

    return matchesSearch && matchesType && matchesDistance && matchesWage;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (filters.sortBy === "distance") return a.distance - b.distance;
    if (filters.sortBy === "wage") return b.wage - a.wage;
    if (filters.sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Search size={20} color={COLORS.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm công việc, địa điểm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.gray[400]}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showFilters && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal
              size={20}
              color={showFilters ? COLORS.emerald[600] : COLORS.gray[600]}
            />
          </TouchableOpacity>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filtersContent}>
                <Text style={styles.filterLabel}>Loại công việc:</Text>
                <View style={styles.jobTypeFilters}>
                  {jobTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.jobTypeChip,
                        filters.jobType.includes(type) &&
                          styles.jobTypeChipActive,
                      ]}
                      onPress={() => toggleJobType(type)}
                    >
                      <Text
                        style={[
                          styles.jobTypeChipText,
                          filters.jobType.includes(type) &&
                            styles.jobTypeChipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.filterLabel}>Sắp xếp theo:</Text>
                <View style={styles.sortOptions}>
                  {[
                    { value: "distance", label: "Khoảng cách" },
                    { value: "wage", label: "Lương cao" },
                    { value: "rating", label: "Đánh giá" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortChip,
                        filters.sortBy === option.value &&
                          styles.sortChipActive,
                      ]}
                      onPress={() =>
                        setFilters((prev) => ({
                          ...prev,
                          sortBy: option.value as any,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.sortChipText,
                          filters.sortBy === option.value &&
                            styles.sortChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            Tìm thấy {sortedJobs.length} công việc
          </Text>
        </View>

        {/* Job List */}
        <ScrollView
          style={styles.jobList}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingHorizontal: SPACING.md,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {sortedJobs.map((job) => (
            <Card key={job.id} style={styles.jobCard}>
              <CardContent>
                <ListItem
                  title={job.title}
                  subtitle={`${job.farmer} • ${job.location}`}
                  meta={`${job.distance}km • ${job.duration}`}
                  leftSlot={<Avatar fallback={job.farmer[0]} size={48} />}
                  rightSlot={
                    <View style={styles.jobMetaRight}>
                      {job.urgent ? (
                        <Badge variant="danger" style={styles.urgentBadge}>
                          🔥 Cần gấp
                        </Badge>
                      ) : null}
                      <Text style={styles.wageText}>
                        {job.wage.toLocaleString("vi-VN")}đ
                      </Text>
                    </View>
                  }
                  onPress={() =>
                    navigation.navigate("JobDetail", { jobId: job.id })
                  }
                />
                <View style={styles.jobMetaRow}>
                  <View style={styles.metaChip}>
                    <MapPin size={14} color={COLORS.slate[500]} />
                    <Text style={styles.metaChipText}>{job.location}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Banknote size={14} color={COLORS.emerald[600]} />
                    <Text style={styles.metaChipText}>{job.duration}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Star size={14} color={COLORS.amber[400]} />
                    <Text style={styles.metaChipText}>{job.rating}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
  },
  searchHeader: {
    flexDirection: "row",
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.gray[100],
  },
  filterButtonActive: {
    backgroundColor: COLORS.emerald[100],
  },
  filtersPanel: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    paddingVertical: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  jobTypeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  jobTypeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  jobTypeChipActive: {
    backgroundColor: COLORS.emerald[100],
    borderColor: COLORS.emerald[600],
  },
  jobTypeChipText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  jobTypeChipTextActive: {
    color: COLORS.emerald[700],
    fontWeight: "600",
  },
  sortOptions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  sortChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[100],
  },
  sortChipActive: {
    backgroundColor: COLORS.emerald[600],
  },
  sortChipText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  sortChipTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  resultsHeader: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  resultsCount: {
    ...TYPOGRAPHY.body1,
    color: COLORS.slate[600],
    fontWeight: "500",
  },
  jobList: {
    flex: 1,
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  urgentBadge: {
    alignSelf: "flex-end",
    marginBottom: SPACING.xs,
  },
  jobMetaRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    flexWrap: "wrap",
  },
  jobMetaRight: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.slate[100],
    borderRadius: BORDER_RADIUS.full,
  },
  metaChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.slate[600],
  },
  wageText: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.emerald[700],
  },
});
