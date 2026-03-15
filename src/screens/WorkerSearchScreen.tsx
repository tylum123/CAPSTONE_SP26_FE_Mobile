import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, SlidersHorizontal, MapPin, Clock, Banknote, Star, X, ChevronRight, Flame } from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { useAuth } from "../context/AuthContext";
import { jobService, JobCategoryDTO, JobPostDTO } from "../services";

interface FilterOptions { jobType: string[]; sortBy: "distance" | "wage" | "rating"; }

const mockCategories: JobCategoryDTO[] = [
  { id: "1", name: "Trồng trọt",  description: "", isActive: true },
  { id: "2", name: "Chăn nuôi",   description: "", isActive: true },
  { id: "3", name: "Thu hoạch",   description: "", isActive: true },
  { id: "4", name: "Vận chuyển",  description: "", isActive: true },
  { id: "5", name: "Làm đất",     description: "", isActive: true },
];
const _base = { statusId: "1", requiredSkills: "", latitude: 0, longitude: 0, startDate: "2026-01-20", endDate: "2026-01-22", workersNeeded: 5, workersAccepted: 1, wageTypeId: "1", paymentMethodId: "1", genderPreference: "none", ageRequirement: "any", publishedAt: "2026-01-01", createdAt: "2026-01-01", updatedAt: "2026-01-01" };
const mockJobs: JobPostDTO[] = [
  { ..._base, id: "1", title: "Thu hoạch lúa",    address: "Cần Thơ",   wageAmount: 250000, estimatedHours: 8, jobCategoryId: "3", isUrgent: true,  farmerProfileId: "abc", description: "Thu hoạch 5 mẫu ruộng lúa mùa đông" },
  { ..._base, id: "2", title: "Chăm sóc lợn",     address: "Đồng Tháp", wageAmount: 300000, estimatedHours: 6, jobCategoryId: "2", isUrgent: false, farmerProfileId: "def", description: "Vệ sinh chuồng trại và cho ăn" },
  { ..._base, id: "3", title: "Phun thuốc trừ sâu", address: "Sóc Trăng", wageAmount: 200000, estimatedHours: 4, jobCategoryId: "1", isUrgent: false, farmerProfileId: "ghi", description: "Phun thuốc cho vườn cam 2 héc-ta" },
  { ..._base, id: "4", title: "Vận chuyển phân bón", address: "An Giang", wageAmount: 180000, estimatedHours: 5, jobCategoryId: "4", isUrgent: false, farmerProfileId: "jkl", description: "Bốc dỡ và vận chuyển 3 tấn phân bón" },
  { ..._base, id: "5", title: "Cày đất trồng rau",  address: "Vĩnh Long", wageAmount: 280000, estimatedHours: 7, jobCategoryId: "5", isUrgent: true,  farmerProfileId: "mno", description: "Cày xới 1 héc-ta đất chuẩn bị gieo hạt" },
  { ..._base, id: "6", title: "Hái cà phê",         address: "Đắk Lắk",  wageAmount: 220000, estimatedHours: 8, jobCategoryId: "3", isUrgent: false, farmerProfileId: "pqr", description: "Hái cà phê chín trên 3 héc-ta vườn" },
];

export function WorkerSearchScreen({ navigation }: any) {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [jobs, setJobs] = useState<JobPostDTO[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({ jobType: [], sortBy: "distance" });

  useEffect(() => {
    if (!isAuthenticated || user?.isDemo) { setCategories(mockCategories); setJobs(mockJobs); return; }
    (async () => {
      try { const [jobPosts, jobCats] = await Promise.all([jobService.getJobPosts(), jobService.getCategories()]); setJobs(jobPosts); setCategories(jobCats); }
      catch { setJobs([]); setCategories([]); }
    })().catch(() => undefined);
  }, [isAuthenticated, user?.isDemo]);

  const categoryMap = useMemo(() => { const m = new Map<string, string>(); categories.forEach((c) => m.set(c.id, c.name)); return m; }, [categories]);
  const jobTypes = useMemo(() => categories.map((c) => c.name), [categories]);
  const toggleJobType = (type: string) => setFilters((p) => ({ ...p, jobType: p.jobType.includes(type) ? p.jobType.filter((t) => t !== type) : [...p.jobType, type] }));

  const mappedJobs = useMemo(() => jobs.map((j) => ({ id: j.id, title: j.title, farmer: "Chủ nông trại", location: j.address, distance: 0, wage: j.wageAmount, duration: j.estimatedHours ? `${j.estimatedHours} giờ` : "", rating: 0, jobType: categoryMap.get(j.jobCategoryId) || j.jobCategoryId, urgent: j.isUrgent })), [jobs, categoryMap]);

  const sortedJobs = useMemo(() => {
    const filtered = mappedJobs.filter((j) => (j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.location.toLowerCase().includes(searchQuery.toLowerCase())) && (filters.jobType.length === 0 || filters.jobType.includes(j.jobType)));
    return [...filtered].sort((a, b) => filters.sortBy === "wage" ? b.wage - a.wage : filters.sortBy === "rating" ? b.rating - a.rating : a.distance - b.distance);
  }, [mappedJobs, searchQuery, filters]);

  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      {/* Search header */}
      <View className="flex-row items-center gap-2 px-4 py-2 bg-white border-b border-slate-100">
        <View className="flex-1 flex-row items-center gap-2 bg-slate-50 rounded-2xl border-[1.5px] border-slate-200 px-4 h-[46px]">
          <Search size={18} color="#94a3b8" />
          <TextInput className="flex-1 text-[15px] text-slate-800" placeholder="Tìm công việc, địa điểm..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#cbd5e1" returnKeyType="search" />
          {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery("")}><X size={16} color="#94a3b8" /></TouchableOpacity>}
        </View>
        <TouchableOpacity
          className={["w-[46px] h-[46px] rounded-2xl border-[1.5px] justify-center items-center", showFilters ? "bg-primary-50 border-primary-300" : "bg-slate-50 border-slate-200"].join(" ")}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} color={showFilters ? "#059669" : "#475569"} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View className="bg-white border-b border-slate-100 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {jobTypes.map((type) => (
              <TouchableOpacity key={type} className={["px-3.5 py-1.5 rounded-full border", filters.jobType.includes(type) ? "bg-primary-50 border-primary-500" : "bg-slate-100 border-slate-200"].join(" ")} onPress={() => toggleJobType(type)}>
                <Text className={["text-[13px] font-semibold", filters.jobType.includes(type) ? "text-primary-700" : "text-slate-600"].join(" ")}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className="flex-row items-center px-4 gap-2 mt-1">
            <Text className="text-[13px] text-slate-500 font-medium">Sắp xếp:</Text>
            {[{ value: "distance", label: "Gần nhất" }, { value: "wage", label: "Lương cao" }, { value: "rating", label: "Đánh giá" }].map((opt) => (
              <TouchableOpacity key={opt.value} className={["px-3 py-1 rounded-full", filters.sortBy === opt.value ? "bg-primary-600" : "bg-slate-100"].join(" ")} onPress={() => setFilters((p) => ({ ...p, sortBy: opt.value as any }))}>
                <Text className={["text-[13px]", filters.sortBy === opt.value ? "text-white font-bold" : "text-slate-600 font-medium"].join(" ")}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results bar */}
      <View className="flex-row items-center justify-between px-4 py-2.5 bg-white border-b border-slate-100">
        <Text className="text-[13px] text-slate-500"><Text className="font-bold text-slate-800">{sortedJobs.length}</Text> công việc phù hợp</Text>
        {(filters.jobType.length > 0 || filters.sortBy !== "distance") && (
          <TouchableOpacity onPress={() => setFilters({ jobType: [], sortBy: "distance" })}>
            <Text className="text-[13px] text-primary-600 font-semibold">Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        data={sortedJobs}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: job }) => (
          <TouchableOpacity className="mb-2 bg-white rounded-[20px] flex-row overflow-hidden border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }} activeOpacity={0.9} onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}>
            <View className={["w-1", job.urgent ? "bg-rose-500" : "bg-primary-400"].join(" ")} />
            <View className="flex-1 p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Avatar fallback={job.farmer[0]} size={46} />
                <View className="flex-1"><Text className="text-[15px] font-bold text-slate-800 mb-0.5" numberOfLines={1}>{job.title}</Text><Text className="text-xs text-slate-500">{job.farmer}</Text></View>
                <View className="items-end gap-0.5">
                  {job.urgent && <Flame size={13} color="#f43f5e" />}
                  <Text className="text-[15px] font-extrabold text-primary-600">{job.wage.toLocaleString("vi-VN")}đ</Text>
                </View>
              </View>
              <View className="h-px bg-slate-100 mb-2" />
              <View className="flex-row items-center gap-3 mb-2">
                <View className="flex-row items-center gap-1"><MapPin size={13} color="#94a3b8" /><Text className="text-xs text-slate-500" numberOfLines={1}>{job.location}</Text></View>
                {job.duration ? <View className="flex-row items-center gap-1"><Clock size={13} color="#94a3b8" /><Text className="text-xs text-slate-500">{job.duration}</Text></View> : null}
                {job.rating > 0 && <View className="flex-row items-center gap-1"><Star size={13} color="#fbbf24" fill="#fbbf24" /><Text className="text-xs text-slate-500">{job.rating}</Text></View>}
                <ChevronRight size={16} color="#cbd5e1" style={{ marginLeft: "auto" }} />
              </View>
              {job.jobType && (
                <View className="flex-row gap-1.5 flex-wrap">
                  <Badge variant="secondary">{job.jobType}</Badge>
                  {job.urgent && <Badge variant="danger">🔥 Cần gấp</Badge>}
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center pt-16 gap-2">
            <Search size={48} color="#e2e8f0" />
            <Text className="text-base font-bold text-slate-600">Không tìm thấy việc phù hợp</Text>
            <Text className="text-sm text-slate-400 text-center">Thử thay đổi từ khóa hoặc xóa bộ lọc</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
