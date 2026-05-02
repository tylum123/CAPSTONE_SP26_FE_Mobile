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
import { X, Banknote, Briefcase, Zap, RotateCcw, MapPin, Calendar, Check } from "lucide-react-native";
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


const DATE_FILTERS = [
  { label: "Hôm nay", value: "today" },
  { label: "Ngày mai", value: "tomorrow" },
  { label: "Sắp tới", value: "upcoming" },
];

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

  useEffect(() => {
    if (visible) {
      setLocalFilters({ ...currentFilters });
      loadData();
    }
  }, [visible, currentFilters]);

  const loadData = async () => {
    try {
      const [cats, skills] = await Promise.all([
        jobService.getCategories(),
        skillService.getSkills()
      ]);
      setCategories(cats);
      setAvailableSkills(skills);
    } catch (error) {
      console.error("Failed to load filter data:", error);
    }
  };

  const handleUpdate = (updates: Partial<ExtendedJobFilter>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
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
                  <View className="w-9 h-9 bg-blue-50 rounded-xl items-center justify-center">
                    <Calendar size={18} color="#2563eb" />
                  </View>
                  <Text className="text-[16px] font-extrabold text-slate-800">Thời gian làm việc</Text>
                </View>
                <View className="flex-row flex-wrap gap-2.5">
                  {DATE_FILTERS.map((opt) => {
                    const sel = localFilters.dateFilter === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => handleUpdate({ dateFilter: sel ? undefined : opt.value })}
                        style={{
                          paddingHorizontal: 18,
                          paddingVertical: 10,
                          borderRadius: 20,
                          borderWidth: 2,
                          borderColor: sel ? "#2563eb" : "#e2e8f0",
                          backgroundColor: sel ? "#2563eb" : "#ffffff",
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: "700", color: sel ? "#ffffff" : "#64748b" }}>
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
                      value={localFilters.minWageAmount?.toString() || ""}
                      onChangeText={(v) => handleUpdate({ minWageAmount: v ? parseInt(v.replace(/[^0-9]/g, "")) : undefined })}
                    />
                  </View>
                  <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tối đa</Text>
                    <TextInput
                      style={{ fontSize: 15, fontWeight: "700", color: "#1e293b", padding: 0 }}
                      placeholder="Không giới hạn"
                      keyboardType="numeric"
                      placeholderTextColor="#cbd5e1"
                      value={localFilters.maxWageAmount?.toString() || ""}
                      onChangeText={(v) => handleUpdate({ maxWageAmount: v ? parseInt(v.replace(/[^0-9]/g, "")) : undefined })}
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
                  <View className="flex-row flex-wrap gap-2.5">
                    {availableSkills.map((skill: SkillResponse) => {
                      const sel = localFilters.requiredSkills?.includes(skill.name);
                      return (
                        <TouchableOpacity
                          key={skill.id}
                          onPress={() => {
                            const current = localFilters.requiredSkills || [];
                            const updated = sel 
                              ? current.filter(s => s !== skill.name)
                              : [...current, skill.name];
                            handleUpdate({ requiredSkills: updated });
                          }}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 9,
                            borderRadius: 16,
                            borderWidth: 1.5,
                            borderColor: sel ? "#f97316" : "#e2e8f0",
                            backgroundColor: sel ? "#f97316" : "#ffffff",
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: "700", color: sel ? "#ffffff" : "#475569" }}>
                            {skill.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
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
