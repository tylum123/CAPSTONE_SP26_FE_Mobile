/* AI CONTEXT:
 * Action: A filter modal for refining job search results.
 * Inputs: visible (boolean), onClose (function), currentFilters (JobSearchFilterRequest), onApply (function).
 * Outputs: Updated JobSearchFilterRequest via onApply, UI side effects (local filter state).
 * Dependencies: React Native Modal, Lucide icons, Button & Badge components. */

import React, { useState, useEffect } from "react";
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Switch, 
  SafeAreaView, 
  Platform,
  KeyboardAvoidingView
} from "react-native";
import { X, Banknote, Briefcase, Zap, RotateCcw } from "lucide-react-native";
import { Button } from "../ui/Button";
import { JobSearchFilterRequest } from "../../types/export_type_definitions";

interface JobFilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: JobSearchFilterRequest;
  onApply: (filters: JobSearchFilterRequest) => void;
}

const MOCK_SKILLS = [
  { id: "1", name: "Thu hoạch" },
  { id: "2", name: "Bón phân" },
  { id: "3", name: "Phun thuốc" },
  { id: "4", name: "Tỉa cành" },
  { id: "5", name: "Gieo hạt" },
];

export function JobFilterModal({ visible, onClose, currentFilters, onApply }: JobFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<JobSearchFilterRequest>(currentFilters);

  // Sync with current filters when modal opens or when currentFilters changes
  useEffect(() => {
    if (visible) {
      setLocalFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  /**
   * Updates a local filter field without affecting parent state until applied.
   */
  const handleUpdate = (updates: Partial<JobSearchFilterRequest>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  };

  /**
   * Toggles skill selection in the local state.
   */
  const toggleSkill = (skillName: string) => {
    const currentSkills = localFilters.requiredSkills || [];
    if (currentSkills.includes(skillName)) {
      handleUpdate({ requiredSkills: currentSkills.filter(s => s !== skillName) });
    } else {
      handleUpdate({ requiredSkills: [...currentSkills, skillName] });
    }
  };

  /**
   * Resets local filters to default values.
   */
  const handleReset = () => {
    setLocalFilters({
      pageNumber: 1,
      pageSize: 10,
      sortBy: "distance",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <SafeAreaView className="bg-white rounded-t-[36px] max-h-[85%] shadow-2xl">
            {/* Header Section */}
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-slate-100">
              <View>
                <Text className="text-xl font-extrabold text-slate-800">Bộ lọc nâng cao</Text>
                <Text className="text-[11px] text-slate-500 font-medium tracking-tight">Điều chỉnh để tìm việc phù hợp nhất</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2.5 bg-slate-100 rounded-full">
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              className="px-6" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Wage Range Section */}
              <View className="py-6 border-b border-slate-100">
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="p-1.5 bg-emerald-50 rounded-lg">
                    <Banknote size={17} color="#059669" />
                  </View>
                  <Text className="text-[15px] font-bold text-slate-800">Thù lao mong muốn (VNĐ)</Text>
                </View>
                
                <View className="flex-row items-center gap-4">
                  <View className="flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase ml-1 tracking-wider">Tối thiểu</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-800"
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor="#cbd5e1"
                      value={localFilters.minWageAmount?.toString() || ""}
                      onChangeText={(v) => handleUpdate({ minWageAmount: v ? parseInt(v.replace(/[^0-9]/g, '')) : undefined })}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase ml-1 tracking-wider">Tối đa</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-800"
                      placeholder="Không giới hạn"
                      keyboardType="numeric"
                      placeholderTextColor="#cbd5e1"
                      value={localFilters.maxWageAmount?.toString() || ""}
                      onChangeText={(v) => handleUpdate({ maxWageAmount: v ? parseInt(v.replace(/[^0-9]/g, '')) : undefined })}
                    />
                  </View>
                </View>
              </View>

              {/* Required Skills Section */}
              <View className="py-6 border-b border-slate-100">
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="p-1.5 bg-blue-50 rounded-lg">
                    <Briefcase size={17} color="#2563eb" />
                  </View>
                  <Text className="text-[15px] font-bold text-slate-800">Kỹ năng yêu cầu</Text>
                </View>
                
                <View className="flex-row flex-wrap gap-2.5">
                  {MOCK_SKILLS.map((skill) => {
                    const isSelected = localFilters.requiredSkills?.includes(skill.name);
                    return (
                      <TouchableOpacity
                        key={skill.id}
                        onPress={() => toggleSkill(skill.name)}
                        activeOpacity={0.7}
                        className={[
                          "px-4 py-2.5 rounded-2xl border", 
                          isSelected ? "bg-primary-600 border-primary-600" : "bg-slate-50 border-slate-200"
                        ].join(" ")}
                      >
                        <Text className={[
                          "text-[13px] font-bold", 
                          isSelected ? "text-white" : "text-slate-600"
                        ].join(" ")}>
                          {skill.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Only Urgent Section */}
              <View className="py-6 flex-row items-center justify-between border-b border-slate-100">
                <View className="flex-row items-center gap-2">
                  <View className="p-1.5 bg-rose-50 rounded-lg">
                    <Zap size={17} color="#f43f5e" />
                  </View>
                  <View>
                    <Text className="text-[15px] font-bold text-slate-800">Chỉ hiện việc cần gấp</Text>
                    <Text className="text-[11px] text-slate-500 font-medium">Ưu tiên kết quả có gắn nhãn gấp</Text>
                  </View>
                </View>
                <Switch
                  value={localFilters.onlyUrgent || false}
                  onValueChange={(val) => handleUpdate({ onlyUrgent: val })}
                  trackColor={{ false: "#f1f5f9", true: "#059669" }}
                  thumbColor={Platform.OS === "ios" ? undefined : "#ffffff"}
                />
              </View>
            </ScrollView>

            {/* Footer Action Buttons */}
            <View className="px-6 pt-4 pb-8 flex-row gap-3 bg-white">
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl border-[1.5px]"
                onPress={handleReset}
              >
                <View className="flex-row items-center gap-1.5">
                  <RotateCcw size={16} color="#059669" />
                  <Text className="text-primary-600 font-bold">Đặt lại</Text>
                </View>
              </Button>
              <Button 
                className="flex-[2] rounded-2xl"
                onPress={() => onApply(localFilters)}
              >
                <Text className="text-white font-extrabold text-[15px]">Áp dụng lọc</Text>
              </Button>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
