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
  DeviceEventEmitter 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, SlidersHorizontal, Map as MapIcon, List, X } from "lucide-react-native";
import { EmptyState } from "../components/ui/export_ui_components";
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
    filters, results, isLoading, updateFilter, search, loadMore, reset 
  } = useJobSearch();

  /**
   * Initializes screen by fetching user profile location or setting default coordinates.
   */
  const init = useCallback(async () => {
    try {
      const profile = await workerProfileService.getProfile();
      let lat = 10.762622;
      let lon = 106.660172;

      if (profile?.primaryLocation && !user?.isDemo) {
        const loc = await nominatimService.geocodeAddress(profile.primaryLocation);
        if (loc) {
          lat = loc.latitude;
          lon = loc.longitude;
          setUserLocation(loc);
        }
      } else {
        setUserLocation({ latitude: lat, longitude: lon });
      }

      // Perform initial search with location context
      search({
        ...filters,
        workerLatitude: lat,
        workerLongitude: lon,
        maxDistanceKm: profile?.travelRadiusKmPreference || 50
      });
    } catch (err) {
      console.error("Search init error", err);
      search(); // Fallback search if location fails
    }
  }, [user?.isDemo, search]);

  useEffect(() => {
    init();
    const sub = DeviceEventEmitter.addListener("REFRESH_DATA", () => search());
    return () => sub.remove();
  }, []);

  const handleApplyFilters = (newFilters: any) => {
    setIsFilterVisible(false);
    updateFilter(newFilters);
    search(newFilters);
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
            onSubmitEditing={() => search()}
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

      {/* Main Content Area */}
      {isMapView ? (
        <View className="flex-1">
          <JobMap 
            userLocation={userLocation} 
            radiusKm={filters.maxDistanceKm || 50} 
            jobs={results as any} 
            onCalloutPress={(job) => navigation.navigate("JobDetail", { jobId: job.id })}
            style={{ borderRadius: 0, height: "100%" }}
          />
        </View>
      ) : (
        <FlatList
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          data={results}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => search()} colors={["#059669"]} />}
          onEndReached={() => loadMore()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <JobSearchCard job={item} onPress={(j) => navigation.navigate("JobDetail", { jobId: j.id })} />
          )}
          ListEmptyComponent={!isLoading ? (
            <EmptyState 
              title="Không tìm thấy việc phù hợp" 
              icon={Search} 
              onAction={() => { reset(); search(); }} 
              actionLabel="Xóa bộ lọc"
            />
          ) : null}
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
