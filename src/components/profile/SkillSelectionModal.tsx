import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Check, Package, Tractor, Tag, MousePointer2, Search } from "lucide-react-native";
import { skillService, jobService } from "../../services/export_services";
import { SkillResponse, JobCategoryDTO } from "../../types/export_type_definitions";
import { COLORS } from "../../constants/theme";
import { Button } from "../ui/Button";

interface SkillSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSkillIds: string[];
  onSave: (ids: string[]) => void;
}

const CATEGORY_MAP: Record<string, { name: string; icon: any; color: string }> = {
  "1": { name: "Trồng trọt", icon: Tractor, color: "#059669" },
  "2": { name: "Chăn nuôi", icon: Package, color: "#d97706" },
  "3": { name: "Máy móc", icon: Tag, color: "#2563eb" },
  "4": { name: "Khác", icon: MousePointer2, color: "#64748b" },
};

export function SkillSelectionModal({ visible, onClose, selectedSkillIds, onSave }: SkillSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const [availableSkills, setAvailableSkills] = useState<SkillResponse[]>([]);
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (visible) {
      setTempSelectedIds(selectedSkillIds);
      setSearchQuery("");
      fetchSkills();
    }
  }, [visible, selectedSkillIds]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const [skills, cats] = await Promise.all([
        skillService.getSkills(),
        jobService.getCategories()
      ]);
      setAvailableSkills(skills);
      setCategories(cats);
    } catch (error) {
      console.error("Failed to fetch skills/categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (id: string) => {
    setTempSelectedIds((prev: string[]) => 
      prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
    );
  };

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return availableSkills;
    const lowerQuery = searchQuery.toLowerCase().trim();
    return availableSkills.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) || 
      s.description?.toLowerCase().includes(lowerQuery)
    );
  }, [availableSkills, searchQuery]);

  const skillGroups = useMemo(() => {
    const groups: Record<string, SkillResponse[]> = {};
    filteredSkills.forEach(skill => {
      let catId = String(skill.categoryId || "4");
      // Normalize 'cat-1' -> '1' to match mapping
      if (catId.startsWith("cat-")) catId = catId.replace("cat-", "");
      if (!groups[catId]) groups[catId] = [];
      groups[catId].push(skill);
    });
    return groups;
  }, [filteredSkills]);

  const handleSave = () => {
    onSave(tempSelectedIds);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="bg-white rounded-t-[32px] h-[85%] shadow-xl">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <View>
              <Text className="text-[20px] font-black text-slate-900">Chọn kỹ năng</Text>
              <Text className="text-[13px] text-slate-500 font-medium">Chọn các kỹ năng bạn thông thạo</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
              <X size={20} color={COLORS.slate[600]} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="px-6 py-3 border-b border-slate-50">
            <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-slate-100 h-11 gap-2.5">
              <Search size={18} color={COLORS.slate[400]} />
              <TextInput 
                className="flex-1 text-[15px] font-bold text-slate-800"
                placeholder="Tìm kiếm kỹ năng..."
                placeholderTextColor={COLORS.slate[400]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X size={16} color={COLORS.slate[400]} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {loading ? (
              <View className="py-20"><ActivityIndicator color={COLORS.primary[600]} /></View>
            ) : Object.keys(skillGroups).length === 0 ? (
              <View className="items-center py-20">
                <Search size={40} color={COLORS.slate[200]} />
                <Text className="mt-4 text-slate-400 font-bold">Không tìm thấy kỹ năng nào</Text>
              </View>
            ) : (
                Object.entries(skillGroups)
                  .sort(([a], [b]) => (Number(a) || 9) - (Number(b) || 9))
                  .map(([catId, skills]) => {
                // Find category name from fetched categories or fallback to map
                const fetchedCat = categories.find(c => c.id === catId || c.id === `cat-${catId}`);
                const category = CATEGORY_MAP[catId] || CATEGORY_MAP["4"];
                const categoryName = fetchedCat?.name || category.name;
                const Icon = category.icon;
                
                return (
                  <View key={catId} className="mt-6">
                    <View className="flex-row items-center mb-3">
                      <View className="w-8 h-8 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: `${category.color}15` }}>
                        <Icon size={16} color={category.color} />
                      </View>
                      <Text className="text-[15px] font-extrabold text-slate-800 uppercase tracking-wider">{categoryName}</Text>
                      <Text className="ml-2 text-[12px] text-slate-400 font-bold">{`(${(skills as SkillResponse[]).length})`}</Text>
                    </View>
                    
                    <View className="flex-row flex-wrap gap-2">
                      {(skills as SkillResponse[]).map((skill: SkillResponse) => {
                        const isSelected = tempSelectedIds.includes(skill.id);
                        return (
                          <TouchableOpacity
                            key={skill.id}
                            onPress={() => toggleSkill(skill.id)}
                            className={[
                              "flex-row items-center px-4 py-2.5 rounded-2xl border",
                              isSelected 
                                ? "bg-primary-50 border-primary-200" 
                                : "bg-white border-slate-200"
                            ].join(" ")}
                          >
                            <Text className={["text-[14px] font-bold mr-1", isSelected ? "text-primary-700" : "text-slate-600"].join(" ")}>
                              {skill.name}
                            </Text>
                            {isSelected && <Check size={14} color={COLORS.primary[600]} />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <View 
            className="absolute bottom-0 left-0 right-0 px-6 pt-4 bg-white border-t border-slate-100 flex-row items-center gap-3 shadow-2xl"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            <Button variant="outline" className="flex-1" style={{ flex: 1 }} onPress={onClose}>Hủy</Button>
            <Button className="flex-1" style={{ flex: 1 }} onPress={handleSave}>{`Lưu (${tempSelectedIds.length})`}</Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
