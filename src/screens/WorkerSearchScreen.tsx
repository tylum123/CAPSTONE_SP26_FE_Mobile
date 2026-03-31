/* AI CONTEXT:
 * Action: Map and list interface for discovering available farming jobs.
 * Inputs: User location coordinates, search text, filters.
 * Outputs: Map markers and job list components.
 * Dependencies: Job service, Location context, MapLibre UI. */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ScrollView, RefreshControl, DeviceEventEmitter, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, SlidersHorizontal, MapPin, Clock, Banknote, Star, X, ChevronRight, Flame, Map as MapIcon, List, CheckCircle2 } from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { SkeletonCard, EmptyState } from "../components/ui/export_ui_components";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { jobService, workerProfileService, nominatimService, skillService } from "../services/export_services";
import { JobCategoryDTO, JobDiscoveryDTO, SkillResponse } from "../types/export_type_definitions";
import { JobMap } from "../components/ui/JobMap";
import { DEMO_JOB_POSTS, DEMO_CATEGORIES, DEMO_SKILLS } from "../constants/demoData";

interface FilterOptions { 
  jobTypeIds: string[]; 
  skillIds: string[];
  sortBy: "distance" | "wage" | "rating" | "matchScore"; 
}

export function WorkerSearchScreen({ navigation }: any) {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [skills, setSkills] = useState<SkillResponse[]>([]);
  const [jobs, setJobs] = useState<JobDiscoveryDTO[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({ jobTypeIds: [], skillIds: [], sortBy: "distance" });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [showApplied, setShowApplied] = useState(false);

  const loadData = useCallback(async () => {
    try { 
      setIsLoading(true);
      let jobCats: JobCategoryDTO[] = [];
      let skillRes: SkillResponse[] = [];
      let profile: any = null;
      let myApps: any[] = [];

      if (user?.isDemo) {
        jobCats = DEMO_CATEGORIES;
        skillRes = DEMO_SKILLS;
        profile = { travelRadiusKmPreference: 15, primaryLocation: "Thốt Nốt, Cần Thơ" };
      } else {
        const [cats, skills, prof, apps] = await Promise.all([
          jobService.getCategories(),
          skillService.getSkills(),
          workerProfileService.getProfile(),
          jobService.getApplications()
        ]); 
        jobCats = cats;
        skillRes = skills;
        profile = prof;
        myApps = apps;
      }
      
      setCategories(jobCats);
      setSkills(skillRes);

      const prefRadius = profile?.travelRadiusKmPreference || 10;
      setRadiusKm(prefRadius);
      
      let lat = 10.762622; // Default for demo
      let lon = 106.660172;

      if (profile?.primaryLocation && !user?.isDemo) {
        const loc = await nominatimService.geocodeAddress(profile.primaryLocation);
        if (loc) {
          setUserLocation(loc);
          lat = loc.latitude;
          lon = loc.longitude;
        }
      } else {
         setUserLocation({ latitude: lat, longitude: lon });
      }

      let nearbyJobs: JobDiscoveryDTO[] = [];
      if (user?.isDemo) {
        nearbyJobs = DEMO_JOB_POSTS.map(j => ({
          ...j,
          jobTypeName: j.jobTypeId === 1 ? "Khoán" : "Ngày",
          distanceKm: 2.5,
          farmerAverageRating: 4.5,
          locationName: "Cần Thơ",
          skillsMatchCount: 2,
          allSkillsMatched: true,
          availablePositions: j.workersNeeded - j.workersAccepted,
          durationType: j.jobTypeId === 1 ? "PerJob" : "Daily",
          durationDays: 1,
          isUpcoming: true,
          matchScore: 85,
          similarJobsCompleted: 5
        }));
      } else {
        try {
          nearbyJobs = await jobService.getNearbyJobs({ latitude: lat, longitude: lon, maxDistanceKm: prefRadius });
        } catch (err: any) {
          console.error("Search screen fetch nearby error", err);
          nearbyJobs = (await jobService.getJobPosts()) as any; 
        }
      }

      // If nearby returns empty, also fallback (matching Home screen behavior)
      if (nearbyJobs.length === 0) {
        nearbyJobs = (await jobService.getJobPosts()) as any;
      }

      const myAppliedJobIds = new Set(
        myApps
          .filter(a => (a.worker?.id || (a as any).workerId) === profile?.id)
          .map(a => String(a.jobPostId))
      );
      
      const filteredJobs = showApplied 
        ? nearbyJobs 
        : nearbyJobs.filter(j => !myAppliedJobIds.has(String(j.id)));

      // If fallbacked from JobPostDTO, we need to map to JobDiscoveryDTO structure for the UI
      setJobs(filteredJobs.map(j => {
        if ('distanceKm' in j && j.distanceKm !== undefined) return j as JobDiscoveryDTO;
        const jp = j as any;
        return {
          ...jp,
          jobTypeName: jp.jobTypeId === 1 ? "Khoán" : "Ngày",
          distanceKm: jp.distanceKm || 0,
          farmerAverageRating: profile?.averageRating || 0,
          locationName: jp.address || "N/A",
          skillsMatchCount: 0,
          allSkillsMatched: false,
          availablePositions: (jp.workersNeeded || 0) - (jp.workersAccepted || 0),
          durationType: jp.jobTypeId === 1 ? "PerJob" : "Daily",
          durationDays: 0,
          isUpcoming: true,
          matchScore: 0,
          similarJobsCompleted: 0
        } as JobDiscoveryDTO;
      }));
    } catch (err: any) { 
      if (isAuthenticated) {
        console.error("Search screen load error", err?.response?.data || err.message);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.isDemo, isAuthenticated]);

  useEffect(() => {
    loadData();
    const subscription = DeviceEventEmitter.addListener("REFRESH_DATA", loadData);
    return () => subscription.remove();
  }, [loadData]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const isNational = radiusKm >= 500;
      
      const [results, myApps] = await Promise.all([
        jobService.searchJobs({
          searchKeyword: searchQuery || undefined,
          jobCategoryId: filters.jobTypeIds.length > 0 ? filters.jobTypeIds[0] : undefined,
          requiredSkills: filters.skillIds.length > 0 ? filters.skillIds : undefined,
          maxDistanceKm: isNational ? undefined : radiusKm,
          workerLatitude: isNational ? undefined : userLocation?.latitude,
          workerLongitude: isNational ? undefined : userLocation?.longitude,
          sortBy: filters.sortBy === "distance" ? "distance" : filters.sortBy === "wage" ? "wage" : "match" 
        }),
        jobService.getApplications()
      ]);

      let finalJobs = results.jobs;

      // FALLBACK: If search returns nothing but we suspect there's data in DB, fetch all
      if (finalJobs.length === 0 && !searchQuery && filters.jobTypeIds.length === 0) {
        try {
          const allJobs = await jobService.getJobPosts();
          finalJobs = allJobs as any;
        } catch (e) {
          console.error("Search fallback failed", e);
        }
      }

      const myAppliedJobIds = new Set(myApps.map(a => String(a.jobPostId)));
      const filteredResults = showApplied 
        ? finalJobs 
        : finalJobs.filter((j: any) => !myAppliedJobIds.has(String(j.id)));
      
      setJobs(filteredResults);
    } catch (error) {
      console.error("Search failed", error);
      // Even if search API fails, try to show something
      const allJobs = await jobService.getJobPosts();
      setJobs(allJobs as any);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleJobType = (id: string) => {
    setFilters(p => ({
      ...p,
      jobTypeIds: p.jobTypeIds.includes(id) ? p.jobTypeIds.filter(t => t !== id) : [...p.jobTypeIds, id]
    }));
  };

  const toggleSkill = (id: string) => {
    setFilters(p => ({
      ...p,
      skillIds: p.skillIds.includes(id) ? p.skillIds.filter(s => s !== id) : [...p.skillIds, id]
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      <View className="flex-row items-center gap-2 px-4 py-2 bg-white border-b border-slate-100">
        <View className="flex-1 flex-row items-center gap-2 bg-slate-50 rounded-2xl border-[1.5px] border-slate-200 px-4 h-[46px]">
          <Search size={18} color="#94a3b8" />
          <TextInput 
            className="flex-1 text-[15px] text-slate-800" 
            placeholder="Tìm công việc, địa điểm..." 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
            placeholderTextColor="#cbd5e1" 
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery("")}><X size={16} color="#94a3b8" /></TouchableOpacity>}
        </View>
        <TouchableOpacity
          className={["w-[46px] h-[46px] rounded-2xl border-[1.5px] justify-center items-center", showFilters ? "bg-primary-50 border-primary-300" : "bg-slate-50 border-slate-200"].join(" ")}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} color={showFilters ? "#059669" : "#475569"} />
        </TouchableOpacity>
        <TouchableOpacity
          className={["w-[46px] h-[46px] rounded-2xl border-[1.5px] justify-center items-center ml-1", isMapView ? "bg-primary-50 border-primary-300" : "bg-slate-50 border-slate-200"].join(" ")}
          onPress={() => setIsMapView(!isMapView)}
        >
          {isMapView ? <List size={18} color="#059669" /> : <MapIcon size={18} color="#475569" />}
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View className="bg-white border-b border-slate-100 pb-4">
          <View className="px-4 py-2">
            <Text className="text-[13px] text-slate-500 font-bold mb-2 uppercase">Loại công việc</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id} 
                  className={["px-3.5 py-1.5 rounded-full border", filters.jobTypeIds.includes(cat.id) ? "bg-primary-50 border-primary-500" : "bg-slate-100 border-slate-200"].join(" ")} 
                  onPress={() => toggleJobType(cat.id)}
                >
                  <Text className={["text-[13px] font-semibold", filters.jobTypeIds.includes(cat.id) ? "text-primary-700" : "text-slate-600"].join(" ")}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="px-4 py-2">
            <Text className="text-[13px] text-slate-500 font-bold mb-2 uppercase">Bán kính tìm kiếm</Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { label: "10km", value: 10 },
                { label: "20km", value: 20 },
                { label: "50km", value: 50 },
                { label: "100km", value: 100 },
                { label: "Toàn quốc", value: 500 }
              ].map((r) => (
                <TouchableOpacity 
                   key={r.label}
                   className={["px-3.5 py-1.5 rounded-full border", radiusKm === r.value ? "bg-primary-50 border-primary-500" : "bg-slate-100 border-slate-200"].join(" ")}
                   onPress={() => setRadiusKm(r.value)}
                >
                  <Text className={["text-[13px] font-semibold", radiusKm === r.value ? "text-primary-700" : "text-slate-600"].join(" ")}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="px-4 py-2">
            <Text className="text-[13px] text-slate-500 font-bold mb-2 uppercase">Kỹ năng</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {skills.map((skill) => (
                <TouchableOpacity 
                  key={skill.id} 
                  className={["px-3.5 py-1.5 rounded-full border", filters.skillIds.includes(skill.id) ? "bg-primary-50 border-primary-500" : "bg-slate-100 border-slate-200"].join(" ")} 
                  onPress={() => toggleSkill(skill.id)}
                >
                  <Text className={["text-[13px] font-semibold", filters.skillIds.includes(skill.id) ? "text-primary-700" : "text-slate-600"].join(" ")}>{skill.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="flex-row items-center px-4 gap-2 mt-2">
            <Text className="text-[13px] text-slate-500 font-bold uppercase">Sắp xếp:</Text>
            {[
              { value: "distance", label: "Gần nhất" }, 
              { value: "wage", label: "Thù lao cao" }, 
              { value: "matchScore", label: "Phù hợp" }
            ].map((opt) => (
              <TouchableOpacity 
                key={opt.value} 
                className={["px-3 py-1 rounded-full", filters.sortBy === opt.value ? "bg-primary-600" : "bg-slate-100"].join(" ")} 
                onPress={() => setFilters((p) => ({ ...p, sortBy: opt.value as any }))}
              >
                <Text className={["text-[12px]", filters.sortBy === opt.value ? "text-white font-bold" : "text-slate-600 font-medium"].join(" ")}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center justify-between px-4 py-2 mt-2 bg-slate-50 mx-4 rounded-xl border border-slate-200">
            <View>
              <Text className="text-[14px] text-slate-700 font-bold">Hiển thị việc đã ứng tuyển</Text>
              <Text className="text-[11px] text-slate-500">Xem lại các công việc bạn đã nộp đơn</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowApplied(!showApplied)}
              activeOpacity={0.8}
              className={["w-[50px] h-7 rounded-full px-1 justify-center", showApplied ? "bg-primary-600 items-end" : "bg-slate-300 items-start"].join(" ")}
            >
              <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </TouchableOpacity>
          </View>

          <View className="px-4 mt-4 flex-row gap-2">
            <Button size="sm" variant="outline" onPress={() => {
               setFilters({ jobTypeIds: [], skillIds: [], sortBy: "distance" });
               setSearchQuery("");
               setRadiusKm(500);
               setShowApplied(true);
               handleSearch();
            }} className="flex-1 rounded-xl">Xóa bộ lọc</Button>
            <Button size="sm" onPress={handleSearch} className="flex-1 rounded-xl">Áp dụng bộ lọc</Button>
          </View>
        </View>
      )}

      {isMapView ? (
        <View className="flex-1">
          <JobMap 
            userLocation={userLocation} 
            radiusKm={radiusKm} 
            jobs={jobs as any} 
            onCalloutPress={(job) => navigation.navigate("JobDetail", { jobId: job.id })}
            style={{ borderRadius: 0, height: "100%" }}
          />
        </View>
      ) : (
        <FlatList
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
          renderItem={({ item: job }) => (
            <TouchableOpacity 
              className="mb-3 bg-white rounded-2xl flex-row overflow-hidden border border-slate-100" 
              style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }} 
              activeOpacity={0.9} 
              onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
            >
              <View className={["w-1.5", job.isUrgent ? "bg-rose-500" : "bg-primary-400"].join(" ")} />
              <View className="flex-1 p-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <Avatar fallback={job.contactName?.[0] || "?"} size={42} />
                  <View className="flex-1">
                    <Text className="text-[16px] font-bold text-slate-800" numberOfLines={1}>{job.title}</Text>
                    <Text className="text-xs text-slate-500">{job.contactName || "Chủ nông trại"}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[17px] font-extrabold text-primary-600">{job.wageAmount.toLocaleString("vi-VN")}₫</Text>
                    {job.isUrgent && <Badge variant="danger">Cần gấp</Badge>}
                  </View>
                </View>

                <View className="flex-row items-center justify-between mb-3 bg-slate-50 rounded-xl px-3 py-2">
                  <View className="flex-row items-center gap-1.5">
                    <MapPin size={14} color="#64748b" />
                    <Text className="text-xs text-slate-600 font-medium">
                      {job.distanceKm ? `${job.distanceKm.toFixed(1)} km` : "Gần bạn"}
                    </Text>
                  </View>
                  <View className="w-px h-3 bg-slate-200" />
                  <View className="flex-row items-center gap-1.5">
                    <CheckCircle2 size={14} color="#059669" />
                    <Text className="text-xs text-primary-700 font-bold">
                      {job.matchScore !== undefined && job.matchScore !== null ? `${Math.round(job.matchScore > 1 ? job.matchScore : job.matchScore * 100)}% khớp` : "Phù hợp"}
                    </Text>
                  </View>
                  <View className="w-px h-3 bg-slate-200" />
                  <View className="flex-row items-center gap-1.5">
                    <Clock size={14} color="#64748b" />
                    <Text className="text-xs text-slate-600 font-medium">
                      {job.startTime && job.endTime ? `${job.startTime.substring(0, 5)} - ${job.endTime.substring(0, 5)}` : (job.estimatedHours ? `${job.estimatedHours}h` : "N/A")}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-1.5 flex-wrap">
                  {job.jobSkillRequirements?.slice(0, 3).map((s: any) => (
                    <Badge key={s.id} variant="secondary">{s.name}</Badge>
                  ))}
                  {job.jobSkillRequirements?.length > 3 && (
                    <Text className="text-[10px] text-slate-400 self-center">+{job.jobSkillRequirements.length - 3}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState 
                title="Không tìm thấy việc phù hợp"
                icon={Search}
                onAction={() => setFilters({ jobTypeIds: [], skillIds: [], sortBy: "distance" })}
              />
            ) : null
          }
          ListFooterComponent={isLoading ? <View className="py-4"><ActivityIndicator color="#059669" /></View> : null}
        />
      )}
    </SafeAreaView>
  );
}
