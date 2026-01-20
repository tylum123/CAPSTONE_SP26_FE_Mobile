import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
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
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { tabBarTranslateY } from "../navigation/WorkerTabNavigator";

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
  const [filters, setFilters] = useState<FilterOptions>({
    jobType: [],
    maxDistance: 50,
    minWage: 0,
    maxWage: 1000000,
    sortBy: "distance",
  });

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

  const jobTypes = [
    "Thu hoạch",
    "Chăm sóc cây trồng",
    "Làm đất",
    "Phun thuốc",
    "Tưới tiêu",
    "Vận chuyển",
  ];

  const searchResults = [
    {
      id: 1,
      title: "Thu hoạch lúa",
      farmer: "Nguyễn Văn A",
      location: "Cần Thơ",
      distance: 2.5,
      wage: 250000,
      duration: "1 ngày",
      rating: 4.8,
      jobType: "Thu hoạch",
      urgent: true,
    },
    {
      id: 2,
      title: "Làm đất trồng rau",
      farmer: "Trần Thị B",
      location: "Vĩnh Long",
      distance: 5,
      wage: 200000,
      duration: "2 ngày",
      rating: 4.5,
      jobType: "Làm đất",
      urgent: false,
    },
    {
      id: 3,
      title: "Chăm sóc vườn cam",
      farmer: "Lê Văn C",
      location: "Tiền Giang",
      distance: 8,
      wage: 180000,
      duration: "3 ngày",
      rating: 4.7,
      jobType: "Chăm sóc cây trồng",
      urgent: false,
    },
    {
      id: 4,
      title: "Phun thuốc sâu",
      farmer: "Phạm Thị D",
      location: "An Giang",
      distance: 12,
      wage: 300000,
      duration: "1 ngày",
      rating: 4.9,
      jobType: "Phun thuốc",
      urgent: true,
    },
  ];

  const toggleJobType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      jobType: prev.jobType.includes(type)
        ? prev.jobType.filter((t) => t !== type)
        : [...prev.jobType, type],
    }));
  };

  const filteredJobs = searchResults.filter((job) => {
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
                      filters.sortBy === option.value && styles.sortChipActive,
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
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {sortedJobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
          >
            <Card style={styles.jobCard}>
              <CardContent>
                {job.urgent && (
                  <Badge variant="danger" style={styles.urgentBadge}>
                    Gấp
                  </Badge>
                )}
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.farmerName}>{job.farmer}</Text>

                <View style={styles.jobInfo}>
                  <View style={styles.infoRow}>
                    <MapPin size={16} color={COLORS.emerald[600]} />
                    <Text style={styles.infoText}>
                      {job.location} • {job.distance} km
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Clock size={16} color={COLORS.gray[500]} />
                    <Text style={styles.infoText}>{job.duration}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Banknote size={16} color={COLORS.emerald[600]} />
                    <Text style={styles.wageText}>
                      {job.wage.toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Star
                      size={16}
                      color={COLORS.amber[400]}
                      fill={COLORS.amber[400]}
                    />
                    <Text style={styles.ratingText}>{job.rating}</Text>
                  </View>
                </View>

                <Badge variant="secondary" style={styles.jobTypeBadge}>
                  {job.jobType}
                </Badge>
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.emerald[50],
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
    borderRadius: BORDER_RADIUS.lg,
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
    borderRadius: BORDER_RADIUS.lg,
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
    borderRadius: BORDER_RADIUS.full,
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
    borderRadius: BORDER_RADIUS.full,
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
    fontSize: 14,
    color: COLORS.gray[600],
    fontWeight: "500",
  },
  jobList: {
    flex: 1,
    padding: SPACING.md,
  },
  jobCard: {
    marginBottom: SPACING.md,
  },
  urgentBadge: {
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
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
    marginBottom: SPACING.md,
  },
  jobInfo: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  wageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.emerald[700],
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[700],
  },
  jobTypeBadge: {
    alignSelf: "flex-start",
  },
});
