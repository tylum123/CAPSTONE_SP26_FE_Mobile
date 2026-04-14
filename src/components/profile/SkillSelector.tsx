/* AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Component: Multi-select skill selector for worker profile.
 * Rule: DO NOT modify existing code logic.
 */
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Check } from "lucide-react-native";
import { skillService } from "../../services/export_services";
import { SkillResponse } from "../../types/export_type_definitions";
import { COLORS } from "../../constants/theme";

interface SkillSelectorProps {
  selectedSkillIds: string[];
  onSelect: (ids: string[]) => void;
}

export function SkillSelector({ selectedSkillIds, onSelect }: SkillSelectorProps) {
  const [availableSkills, setAvailableSkills] = useState<SkillResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await skillService.getSkills();
        setAvailableSkills(skills);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const toggleSkill = (id: string) => {
    const next = selectedSkillIds.includes(id)
      ? selectedSkillIds.filter(s => s !== id)
      : [...selectedSkillIds, id];
    onSelect(next);
  };

  if (loading) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color={COLORS.primary[600]} />
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-2 mt-2">
      {availableSkills.map(skill => {
        const isSelected = selectedSkillIds.includes(skill.id);
        return (
          <TouchableOpacity
            key={skill.id}
            onPress={() => toggleSkill(skill.id)}
            className={[
              "flex-row items-center px-3 py-2 rounded-xl border mb-1",
              isSelected 
                ? "bg-primary-50 border-primary-200" 
                : "bg-white border-slate-200"
            ].join(" ")}
          >
            <Text 
              className={[
                "text-[13px] font-bold mr-1",
                isSelected ? "text-primary-700" : "text-slate-600"
              ].join(" ")}
            >
              {skill.name}
            </Text>
            {isSelected && <Check size={14} color={COLORS.primary[600]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
