/* AI CONTEXT:
 * Action: A filter modal for refining job search results with Senior Mobile UX standards.
 * Inputs: visible (boolean), onClose (function), currentFilters (JobSearchFilterRequest), onApply (function).
 * Outputs: Updated JobSearchFilterRequest via onApply.
 * Dependencies: React Native Modal, Lucide icons, Button, jobService. */

import React, { useState, useEffect } from "react";
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Switch, 
  Platform,
  KeyboardAvoidingView,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Banknote, Briefcase, Zap, RotateCcw, MapPin, Check, ChevronDown, Package, Tractor, Tag, MousePointer2, Fish } from "lucide-react-native";
import { JobCategoryDTO, SkillResponse } from "../../types/export_type_definitions";
import { ExtendedJobFilter } from "../../hooks/use_job_search";
import { jobService } from "../../services/job.service";
import { skillService } from "../../services/skill.service";

interface JobFilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: ExtendedJobFilter;
  onApply: (filters: ExtendedJobFilter) => void;
}

const DISTANCE_OPTIONS = [
  { label: "5km", value: 5 },
  { label: "10km", value: 10 },
  { label: "20km", value: 20 },
  { label: "50km", value: 50 },
  { label: "Toàn quốc", value: 3000 },
];


const SKILL_CATEGORY_MAP: Record<string, { name: string; icon: any; color: string }> = {
  "all": { name: "Tất cả", icon: Briefcase, color: "#4f46e5" },
  "1": { name: "Trồng trọt", icon: Tractor, color: "#059669" },
  "2": { name: "Chăn nuôi", icon: Package, color: "#d97706" },
  "3": { name: "Thủy sản", icon: Fish, color: "#0ea5e9" },
  "4": { name: "Khác", icon: MousePointer2, color: "#64748b" },
};

function formatCurrencyInput(val: string) {
  if (!val) return "";
  const numericValue = val.replace(/[^0-9]/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const JOB_TYPE_OPTIONS = [
  { label: "Tất cả", value: undefined },
  { label: "Ngày", value: 2 },
  { label: "Khoán", value: 1 },
];

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function JobFilterModal({ visible, onClose, currentFilters, onApply }: JobFilterModalProps) {
  const insets = useSafeAreaInsets();
  const [localFilters, setLocalFilters] = useState<ExtendedJobFilter>(currentFilters);
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [availableSkills, setAvailableSkills] = useState<SkillResponse[]>([]);
  const [selectedSkillCategoryId, setSelectedSkillCategoryId] = useState<string>("all");
  const [skillLimit, setSkillLimit] = useState(12);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalFilters({ ...currentFilters });
      loadData();
    }
  }, [visible, currentFilters]);

  const loadData = async () => {
    try {
      setLoadingSkills(true);
      const [cats, skills] = await Promise.all([
        jobService.getCategories(),
        skillService.getSkills()
      ]);
      setCategories(cats);
      setAvailableSkills(skills);
    } catch (error) {
      console.error("Failed to load filter data:", error);
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleUpdate = (updates: Partial<ExtendedJobFilter>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  };

  const toggleSkill = (skillName: string) => {
    const current = localFilters.requiredSkills || [];
    const updated = current.includes(skillName) 
      ? current.filter(s => s !== skillName)
      : [...current, skillName];
    handleUpdate({ requiredSkills: updated });
  };

  const handleReset = () => {
    setLocalFilters({ pageNumber: 1, pageSize: 10, sortBy: "date", maxDistanceKm: 3000 });
  };


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={{
            height: SCREEN_HEIGHT * 0.88,
            backgroundColor: "#ffffff",
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            overflow: "hidden",
          }}>
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-slate-100">
              <View>
                <Text className="text-xl font-extrabold text-slate-900">Bộ lọc nâng cao</Text>
                <Text className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tùy chỉnh tìm kiếm</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
              >
                <X size={20} color="#1e293b" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
            >
              <View className="py-6 border-b border-slate-100">
                <View className="flex-row items-center gap-2.5 mb-5">
                  <View className="w-9 h-9 bg-emerald-50 rounded-xl items-center justify-center">
                    <MapPin size={18} color="#059669" />
                  </View>
                  <Text className="text-[16px] font-extrabold text-slate-800">Khoảng cách tối đa</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2.5">
                    {DISTANCE_OPTIONS.map((opt) => {
                      const sel = localFilters.maxDistanceKm === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          onPress={() => handleUpdate({ maxDistanceKm: opt.value })}
                          style={{
                            paddingHorizontal: 20,
                            paddingVertical: 11,
                            borderRadius: 20,
                            borderWidth: 2,
                            borderColor: sel ? "#059669" : "#e2e8f0",
                            backgroundColor: sel ? "#059669" : "#ffffff",
                          }}
                        >
                          <Text style={{ fontSize: 14, fontWeight: "700", color: sel ? "#ffffff" : "#64748b" }}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View className="py-6 border-b border-slate-100">
                <View className="flex-row items-center gap-2.5 mb-5">
                  <View className="w-9 h-9 bg-indigo-50 rounded-xl items-center justify-center">
                    <Briefcase size={18} color="#4f46e5" />
                  </View>
                  <Text className="text-[16px] font-extrabold text-slate-800">Hình thức làm việc</Text>
                </View>
                <View className="flex-row flex-wrap gap-2.5">
                  {JOB_TYPE_OPTIONS.map((opt) => {
                    const sel = localFilters.jobTypeId === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() => handleUpdate({ jobTypeId: opt.value })}
                        style={{
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          borderRadius: 20,
                          borderWidth: 2,
                          borderColor: sel ? "#4f46e5" : "#e2e8f0",
                          backgroundColor: sel ? "#4f46e5" : "#ffffff",
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: sel ? "#ffffff" : "#64748b" }}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>


              <View className="py-6 border-b border-slate-100">
                <View className="flex-row items-center gap-2.5 mb-5">
                  <View className="w-9 h-9 bg-emerald-50 rounded-xl items-center justify-center">
                    <Banknote size={18} color="#059669" />
                  </View>
                  <Text className="text-[16px] font-extrabold text-slate-800">Thù lao mong muốn (VNĐ)</Text>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tối thiểu</Text>
                    <TextInput
                      style={{ fontSize: 15, fontWeight: "700", color: "#1e293b", padding: 0 }}
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor="#cbd5e1"
                      value={localFilters.minWageAmount ? formatCurrencyInput(localFilters.minWageAmount.toString()) : ""}
                      onChangeText={(v) => {
                        const numeric = v.replace(/[^0-9]/g, "");
                        handleUpdate({ minWageAmount: numeric ? parseInt(numeric) : undefined });
                      }}
                    />
                  </View>
                  <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tối đa</Text>
                    <TextInput
                      style={{ fontSize: 15, fontWeight: "700", color: "#1e293b", padding: 0 }}
                      placeholder="Không giới hạn"
                      keyboardType="numeric"
                      placeholderTextColor="#cbd5e1"
                      value={localFilters.maxWageAmount ? formatCurrencyInput(localFilters.maxWageAmount.toString()) : ""}
                      onChangeText={(v) => {
                        const numeric = v.replace(/[^0-9]/g, "");
                        handleUpdate({ maxWageAmount: numeric ? parseInt(numeric) : undefined });
                      }}
                    />
                  </View>
                </View>
              </View>

              {categories.length > 0 && (
                <View className="py-6 border-b border-slate-100">
                  <View className="flex-row items-center gap-2.5 mb-5">
                    <View className="w-9 h-9 bg-purple-50 rounded-xl items-center justify-center">
                      <Briefcase size={18} color="#9333ea" />
                    </View>
                    <Text className="text-[16px] font-extrabold text-slate-800">Hạng mục công việc</Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2.5">
                    {categories.map((cat) => {
                      const sel = localFilters.jobCategoryId === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => handleUpdate({ jobCategoryId: sel ? undefined : cat.id })}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 9,
                            borderRadius: 16,
                            borderWidth: 1.5,
                            borderColor: sel ? "#9333ea" : "#e2e8f0",
                            backgroundColor: sel ? "#9333ea" : "#ffffff",
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: "700", color: sel ? "#ffffff" : "#475569" }}>
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {availableSkills.length > 0 && (
                <View className="py-6 border-b border-slate-100">
                  <View className="flex-row items-center gap-2.5 mb-5">
                    <View className="w-9 h-9 bg-orange-50 rounded-xl items-center justify-center">
                      <Check size={18} color="#f97316" />
                    </View>
                    <Text className="text-[16px] font-extrabold text-slate-800">Kỹ năng yêu cầu</Text>
                  </View>


                  {/* Skill Category Tabs */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerStyle={{ paddingHorizontal: 4, gap: 10 }}>
                    {Object.entries(SKILL_CATEGORY_MAP).map(([id, cat]) => {
                      const isSelected = selectedSkillCategoryId === id;
                      const Icon = cat.icon;
                      return (
                        <TouchableOpacity
                          key={id}
                          onPress={() => setSelectedSkillCategoryId(id)}
                          className={`flex-row items-center px-4 py-2.5 rounded-2xl border ${isSelected ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100"}`}
                        >
                          <View className={`w-6 h-6 rounded-lg items-center justify-center mr-2 ${isSelected ? "bg-indigo-100" : "bg-slate-50"}`}>
                            <Icon size={14} color={isSelected ? "#4f46e5" : "#64748b"} />
                          </View>
                          <Text className={`text-[14px] font-bold ${isSelected ? "text-indigo-700" : "text-slate-600"}`}>{cat.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <View className="flex-row flex-wrap gap-2">
                    {loadingSkills ? (
                      <Text className="text-slate-400 italic py-4">Đang tải kỹ năng...</Text>
                    ) : (
                      availableSkills
                        .filter(skill => {
                          // Category Tab Filter
                          if (selectedSkillCategoryId === "all") return true;
                          
                          // Robust category resolution:
                          const skillCatIdRaw = (skill as any).categoryId || (skill as any).jobCategoryId;
                          const resolvedCategory = categories.find(c => String(c.id) === String(skillCatIdRaw));
                          const categoryName = (resolvedCategory?.name || "").toLowerCase();
                          
                          let bucketId = "4"; // Default to "Khác"
                          if (categoryName.includes("trồng trọt") || categoryName.includes("lâm nghiệp") || categoryName.includes("cây trồng")) {
                            bucketId = "1";
                          } else if (categoryName.includes("chăn nuôi") || categoryName.includes("gia súc") || categoryName.includes("gia cầm")) {
                            bucketId = "2";
                          } else if (categoryName.includes("thủy sản") || categoryName.includes("hải sản") || categoryName.includes("nuôi trồng")) {
                            bucketId = "3";
                          } else {
                            const rawIdStr = String(skillCatIdRaw || "").replace("cat-", "");
                            if (["1", "2", "3", "4"].includes(rawIdStr)) {
                              bucketId = rawIdStr;
                            }
                          }
                          
                          return bucketId === selectedSkillCategoryId;
                        })
                        .slice(0, skillLimit)
                        .map((skill: SkillResponse) => {
                          const sel = localFilters.requiredSkills?.includes(skill.name);
                          return (
                            <TouchableOpacity
                              key={skill.id}
                              onPress={() => toggleSkill(skill.name)}
                              className={`flex-row items-center px-4 py-2.5 rounded-2xl border ${sel ? "bg-sky-50 border-sky-200" : "bg-white border-slate-200"}`}
                              style={{ 
                                backgroundColor: sel ? "#f0f9ff" : "#ffffff",
                                borderColor: sel ? "#bae6fd" : "#e2e8f0" 
                              }}
                            >
                              <Text className={`text-[14px] font-bold mr-1 ${sel ? "text-sky-700" : "text-slate-600"}`}>
                                {skill.name}
                              </Text>
                              {sel && <Check size={14} color="#0284c7" />}
                            </TouchableOpacity>
                          );
                        })
                    )}
                  </View>

                  {/* Paging / Load More */}
                  {availableSkills.filter(skill => {
                    // Category Tab Filter
                    if (selectedSkillCategoryId === "all") return true;
                    
                    const skillCatIdRaw = (skill as any).categoryId || (skill as any).jobCategoryId;
                    const resolvedCategory = categories.find(c => String(c.id) === String(skillCatIdRaw));
                    const categoryName = (resolvedCategory?.name || "").toLowerCase();
                    
                    let bucketId = "4";
                    if (categoryName.includes("trồng trọt") || categoryName.includes("lâm nghiệp") || categoryName.includes("cây trồng")) {
                      bucketId = "1";
                    } else if (categoryName.includes("chăn nuôi") || categoryName.includes("gia súc") || categoryName.includes("gia cầm")) {
                      bucketId = "2";
                    } else if (categoryName.includes("thủy sản") || categoryName.includes("hải sản") || categoryName.includes("nuôi trồng")) {
                      bucketId = "3";
                    } else {
                      const rawIdStr = String(skillCatIdRaw || "").replace("cat-", "");
                      if (["1", "2", "3", "4"].includes(rawIdStr)) {
                        bucketId = rawIdStr;
                      }
                    }
                    
                    return bucketId === selectedSkillCategoryId;
                  }).length > skillLimit && (
                    <TouchableOpacity 
                      onPress={() => setSkillLimit(prev => prev + 10)}
                      className="mt-4 self-center py-2 px-6 bg-slate-50 rounded-full border border-slate-100 flex-row items-center gap-2"
                    >
                      <ChevronDown size={16} color="#64748b" />
                      <Text className="text-[13px] text-slate-500 font-bold">Xem thêm kỹ năng</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View className="py-6 border-b border-slate-100 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-9 h-9 bg-rose-50 rounded-xl items-center justify-center">
                    <Zap size={18} color="#f43f5e" />
                  </View>
                  <View>
                    <Text className="text-[16px] font-extrabold text-slate-800">Việc cần gấp</Text>
                    <Text className="text-[12px] text-slate-400 font-medium">Ưu tiên công việc khẩn cấp</Text>
                  </View>
                </View>
                <Switch
                  value={localFilters.onlyUrgent || false}
                  onValueChange={(val) => handleUpdate({ onlyUrgent: val })}
                  trackColor={{ false: "#f1f5f9", true: "#059669" }}
                  thumbColor={Platform.OS === "ios" ? undefined : "#ffffff"}
                />
              </View>

              <View className="py-6 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-9 h-9 bg-indigo-50 rounded-xl items-center justify-center">
                    <Check size={18} color="#6366f1" />
                  </View>
                  <View>
                    <Text className="text-[16px] font-extrabold text-slate-800">Ẩn việc đã ứng tuyển</Text>
                    <Text className="text-[12px] text-slate-400 font-medium">Chỉ xem những việc mới cho bạn</Text>
                  </View>
                </View>
                <Switch
                  value={localFilters.excludeApplied || false}
                  onValueChange={(val) => handleUpdate({ excludeApplied: val })}
                  trackColor={{ false: "#f1f5f9", true: "#059669" }}
                  thumbColor={Platform.OS === "ios" ? undefined : "#ffffff"}
                />
              </View>
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: Math.max(insets.bottom, 20),
                backgroundColor: "#ffffff",
                borderTopWidth: 1,
                borderTopColor: "#f1f5f9",
              }}
            >
              <TouchableOpacity
                onPress={handleReset}
                style={{
                  flex: 1,
                  height: 54,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  borderWidth: 2,
                  borderColor: "#e2e8f0",
                }}
              >
                <View className="flex-row items-center gap-2">
                  <RotateCcw size={17} color="#64748b" />
                  <Text style={{ color: "#64748b", fontWeight: "700", fontSize: 15 }}>Xóa bộ lọc</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onApply(localFilters)}
                style={{
                  flex: 2,
                  height: 54,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  backgroundColor: "#059669",
                  shadowColor: "#059669",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Check size={19} color="#ffffff" strokeWidth={2.5} />
                  <Text style={{ color: "#ffffff", fontWeight: "800", fontSize: 16 }}>Áp dụng</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
