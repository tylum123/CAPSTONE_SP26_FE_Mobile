/* AI CONTEXT:
 * Action: Main job discovery screen with advanced search and filtering.
 * Inputs: User location, search keywords, advanced filters from modal.
 * Outputs: Paginated job list, clickable job cards, map view toggle.
 * Dependencies: useJobSearch, JobFilterModal, JobSearchCard, JobMap. */

import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator, 
  DeviceEventEmitter,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, SlidersHorizontal, Map as MapIcon, List, X, Zap, Briefcase } from "lucide-react-native";
import { useDebounce } from "../hooks/use_debounce";
import { EmptyState } from "../components/ui/export_ui_components";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";
import { nominatimService, workerProfileService } from "../services/export_services";
import { JobMap } from "../components/ui/JobMap";
import { useJobSearch } from "../hooks/use_job_search";
import { JobFilterModal } from "../components/job/JobFilterModal";
import { JobSearchCard } from "../components/job/JobSearchCard";

export function WorkerSearchScreen({ navigation }: any) {
  const { user } = useAuth();
  const [isMapView, setIsMapView] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const { 
    filters, results, isLoading, updateFilter, search, loadMore, appliedJobPostIds, refreshAppliedStatus 
  } = useJobSearch();

  const filteredResults = React.useMemo(() => {
    let data = [...results];
    
    // EXCLUDE APPLIED: Filter out jobs user already applied to
    if (filters.excludeApplied) {
      data = data.filter(job => !appliedJobPostIds.has(String(job.id)));
    }

    // URGENT FILTER: Strictly filter out urgent jobs if "Không cần gấp" is selected
    if (filters.onlyUrgent === false) {
      data = data.filter(job => !job.isUrgent);
    }

    // DISTANCE FILTER: Only apply if user explicitly set a limit (not 'Toàn quốc' 3000km)
    // IMPORTANT: If distanceKm is undefined (still geocoding), we SHOW the job temporarily 
    // to prevent it disappearing from the list while processing.
    if (filters.maxDistanceKm && filters.maxDistanceKm < 2000 && filters.workerLatitude && filters.workerLongitude) {
      data = data.filter(job => {
        if (job.distanceKm === undefined) return true; // Show while calculating
        // Use a small buffer (0.5km) to handle rounding differences between BE and FE
        return job.distanceKm <= (filters.maxDistanceKm! + 0.5);
      });
    }

    // MULTI-LEVEL SORT: 1. Proximity (closest first), 2. Start Date (earliest first)
    data.sort((a, b) => {
      // Primary: Distance (closest first)
      const distA = a.distanceKm ?? 99999;
      const distB = b.distanceKm ?? 99999;
      if (Math.abs(distA - distB) > 0.01) { // Use epsilon for float comparison
        return distA - distB;
      }
      
      // Secondary: Start Date (earliest first)
      const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return dateA - dateB;
    });

    return data;
  }, [results, filters.excludeApplied, filters.onlyUrgent, filters.maxDistanceKm, appliedJobPostIds]);

  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("all");
  const hasInitialized = React.useRef(false);

  const debouncedKeyword = useDebounce(filters.searchKeyword || "", 600);

  useEffect(() => {
    // Skip the first trigger (mount) — init() handles the initial search
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }
    // Only trigger live search when user actually types (not when isDemo changes)
    search({ ...filters, pageNumber: 1 }, user?.isDemo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);


  const handleQuickFilter = (type: string) => {
    setActiveQuickFilter(type);
    let newUrgentFilter: boolean | undefined = undefined;
    
    if (type === "urgent") {
      newUrgentFilter = true;
    } else if (type === "not_urgent") {
      newUrgentFilter = false;
    }
    
    const updatedFilters = { ...filters, onlyUrgent: newUrgentFilter, pageNumber: 1 };
    updateFilter({ onlyUrgent: newUrgentFilter });
    search(updatedFilters, user?.isDemo);
  };


  /**
   * Initializes screen by resolving location first, then performing a single search.
   * FIXED: Previously called search() twice (fire-and-forget national + location-based),
   * causing a race condition where the first response could overwrite the second.
   */
  const init = useCallback(async () => {
    try {
      // 1. RESOLVE LOCATION (fast, with timeout to avoid blocking)
      let lat: number | undefined;
      let lon: number | undefined;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          // Use a timeout to prevent GPS from blocking the UI for too long
          const location = await Promise.race([
            Location.getCurrentPositionAsync({ 
              accuracy: Location.Accuracy.High,
              distanceInterval: 10 
            }),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
          ]);
          if (location && "coords" in location) {
            lat = location.coords.latitude;
            lon = location.coords.longitude;
            console.log("[Location] GPS found:", lat, lon);
          }
        }
      } catch (gpsError) {
        console.log("[Location] GPS Permission error:", gpsError);
      }

      // 2. FALLBACK TO PROFILE ADDRESS if GPS failed or timed out
      // Even for Demo, we try to resolve location for distance mapping, but we don't block
      if (lat === undefined && !user?.isDemo) {
        try {
          console.log("[Location] GPS unavailable, attempting profile fallback...");
          const profile = await workerProfileService.getProfile();
          if (profile?.primaryLocation) {
            const loc = await nominatimService.geocodeAddress(profile.primaryLocation);
            if (loc) {
              lat = loc.latitude;
              lon = loc.longitude;
              console.log("[Location] Profile address geocoded:", lat, lon);
            }
          }
        } catch (profileError) {
          console.log("[Location] Profile fallback failed:", profileError);
        }
      }

      // 4. SET USER LOCATION (for map view)
      if (lat !== undefined && lon !== undefined) {
        setUserLocation({ latitude: lat, longitude: lon });
      }

      // 5. SINGLE SEARCH CALL with best available location (Use HCMC fallback for better BE matching)
      const searchFilters = {
        pageNumber: 1,
        pageSize: 10,
        workerLatitude: lat ?? 10.7626, // Fallback to HCMC
        workerLongitude: lon ?? 106.6602, 
        maxDistanceKm: 3000, // National scope
        sortBy: "date"
      };
      updateFilter(searchFilters);
      search(searchFilters, user?.isDemo);

      // 6. Refresh applied status in background (non-blocking)
      refreshAppliedStatus();

    } catch (err) {
      // Final fallback if everything fails
      search({ pageNumber: 1, pageSize: 10, sortBy: "date" });
    }
  }, [user?.isDemo, search, updateFilter, refreshAppliedStatus]);

  useEffect(() => {
    init();
    const sub = DeviceEventEmitter.addListener("REFRESH_DATA", () => search());
    return () => sub.remove();
  }, []);

  const handleApplyFilters = (newFilters: any) => {
    setIsFilterVisible(false);
    updateFilter(newFilters);
    search(newFilters, user?.isDemo);
  };


  const hasActiveFilters = !!(filters.requiredSkills?.length || filters.minWageAmount || filters.maxWageAmount || filters.onlyUrgent);

  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      {/* Header with Search and Actions */}
      <View className="flex-row items-center gap-2 px-4 py-2 bg-white border-b border-slate-100">
        <View className="flex-1 flex-row items-center gap-2 bg-slate-50 rounded-2xl border-[1.5px] border-slate-200 px-4 h-[48px]">
          <Search size={18} color="#94a3b8" />
          <TextInput 
            className="flex-1 text-[15px] text-slate-800 font-medium" 
            placeholder="Tìm việc, địa điểm..." 
            value={filters.searchKeyword || ""} 
            onChangeText={(txt) => updateFilter({ searchKeyword: txt })} 
            placeholderTextColor="#cbd5e1" 
            returnKeyType="search"
            onSubmitEditing={() => search(undefined, user?.isDemo)}

          />
          {filters.searchKeyword ? (
            <TouchableOpacity onPress={() => updateFilter({ searchKeyword: "" })}><X size={16} color="#94a3b8" /></TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity
          className={["w-[48px] h-[48px] rounded-2xl border-[1.5px] justify-center items-center", isFilterVisible ? "bg-primary-50 border-primary-300" : "bg-slate-50 border-slate-200"].join(" ")}
          onPress={() => setIsFilterVisible(true)}
        >
          <SlidersHorizontal size={18} color={hasActiveFilters ? "#059669" : "#475569"} />
          {hasActiveFilters && <View className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-500 rounded-full border border-white" />}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-[48px] h-[48px] rounded-2xl border-[1.5px] border-slate-200 bg-slate-50 justify-center items-center"
          onPress={() => setIsMapView(!isMapView)}
        >
          {isMapView ? <List size={18} color="#475569" /> : <MapIcon size={18} color="#475569" />}
        </TouchableOpacity>
      </View>

      {/* Quick Filters Row */}
      <View className="bg-white py-3 border-b border-slate-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {[
            { id: "all", label: "Tất cả", icon: List },
            { id: "urgent", label: "Cần gấp", icon: Zap },
            { id: "not_urgent", label: "Không cần gấp", icon: Briefcase },
          ].map((chip) => {
            const isActive = activeQuickFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                onPress={() => handleQuickFilter(chip.id)}
                className={["flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl border-[1.5px]", isActive ? "bg-primary-500 border-primary-500" : "bg-slate-50 border-slate-200"].join(" ")}
              >
                <chip.icon size={15} color={isActive ? "#ffffff" : "#64748b"} />
                <Text className={["text-sm font-bold", isActive ? "text-white" : "text-slate-600"].join(" ")}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {isMapView ? (
        <View className="flex-1">
          <JobMap 
            userLocation={userLocation} 
            radiusKm={filters.maxDistanceKm || 50} 
            jobs={filteredResults as any} 
            onCalloutPress={(job) => navigation.navigate("JobDetail", { jobId: job.id })}
            style={{ borderRadius: 0, height: "100%" }}
          />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          data={filteredResults}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={async () => { await refreshAppliedStatus(); search(); }} colors={["#059669"]} />}
          onEndReached={() => loadMore()}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={false}
          renderItem={({ item }) => (
            <JobSearchCard job={item} onPress={(j) => navigation.navigate("JobDetail", { jobId: j.id })} />
          )}
          ListEmptyComponent={isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="mt-4 text-slate-500 font-medium">Đang tìm kiếm việc làm...</Text>
            </View>
          ) : (
            <EmptyState 
              title="Không tìm thấy việc phù hợp" 
              message="Thử thay đổi bộ lọc hoặc tìm kiếm theo từ khóa khác thay vì xóa hết."
              icon={Search} 
              onAction={() => setIsFilterVisible(true)} 
              actionLabel="Điều chỉnh bộ lọc"
            />
          )}
          ListFooterComponent={isLoading && results.length > 0 ? (
            <ActivityIndicator color="#059669" className="py-5" />
          ) : null}
        />
      )}

      <JobFilterModal 
        visible={isFilterVisible} 
        onClose={() => setIsFilterVisible(false)} 
        currentFilters={filters} 
        onApply={handleApplyFilters} 
      />
    </SafeAreaView>
  );
}
