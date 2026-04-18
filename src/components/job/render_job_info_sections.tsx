/* AI CONTEXT:
 * Action: Renders the description, requirement, and privilege blocks.
 * Inputs: Job detail data, formatted info grid rows.
 * Outputs: Multiple UI blocks mapping out job specifics.
 * Dependencies: Lucide icons. */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, Platform } from "react-native";
import { CheckCircle, Wrench, X } from "lucide-react-native";
import { Button } from "../ui/Button";

// Stable color mapping based on skill name
const getSkillStyle = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 4;
  const themes = [
    { bg: "bg-emerald-50", border: "border-emerald-200/30", text: "text-emerald-700", borderColor: "#10b98133" },
    { bg: "bg-sky-50", border: "border-sky-200/30", text: "text-sky-700", borderColor: "#0ea5e933" },
    { bg: "bg-amber-50", border: "border-amber-200/30", text: "text-amber-700", borderColor: "#f59e0b33" },
    { bg: "bg-slate-100", border: "border-slate-200/30", text: "text-slate-600", borderColor: "#64748b33" }
  ];
  return themes[index];
};

export function RenderJobInfoSections({ jobDetail, infoRows }: { jobDetail: any, infoRows: any[] }) {
  const [showAllSkills, setShowAllSkills] = useState(false);
  if (!jobDetail) return null;

  // Use the structured array if available, otherwise parse from row.value
  const skills = jobDetail.jobSkillRequirements || [];
  const displaySkills = skills.length > 0 ? skills : jobDetail.requiredSkills?.split(",").map((s: string, i: number) => ({ id: String(i), name: s.trim() })) || [];

  return (
    <>
      {/* DESCRIPTION */}
      <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
        <Text className="text-base font-bold text-slate-800 mb-4" style={{ letterSpacing: -0.2 }}>Mô tả công việc</Text>
        <Text className="text-sm text-slate-600 leading-[22px]">{jobDetail.description}</Text>
      </View>

      {/* INFO GRID */}
      <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
        <Text className="text-base font-bold text-slate-800 mb-4" style={{ letterSpacing: -0.2 }}>Thông tin chi tiết</Text>
        <View className="gap-3">
          {infoRows.map((row: any, i: number) => (
            <View key={i} className="flex-row items-start gap-2">
              <View className="w-[34px] h-[34px] rounded-lg bg-primary-50 justify-center items-center flex-shrink-0">
                <row.Icon size={16} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-slate-400 font-semibold uppercase mb-0.5" style={{ letterSpacing: 0.4 }}>{row.label}</Text>
                {row.label === "Kỹ năng khuyến nghị" && row.value !== "Không yêu cầu" ? (
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    {displaySkills.slice(0, 3).map((skill: any, idx: number) => {
                      const style = getSkillStyle(skill.name);
                      return (
                        <View 
                          key={skill.id || idx} 
                          className={`flex-row items-center ${style.bg} px-3 py-1.5 rounded-xl border ${style.border}`}
                          style={{ maxWidth: 160, borderColor: style.borderColor }}
                        >
                          <Text 
                            numberOfLines={1} 
                            ellipsizeMode="tail"
                            className={`text-[12px] font-bold ${style.text}`}
                          >
                            {skill.name}
                          </Text>
                        </View>
                      );
                    })}
                    {displaySkills.length > 3 && (
                      <TouchableOpacity 
                        onPress={() => setShowAllSkills(true)}
                        className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
                        activeOpacity={0.7}
                      >
                        <Text className="text-[12px] font-bold text-slate-500">...</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <Text className="text-sm text-slate-700 font-semibold">{row.value}</Text>
                )}
                {row.hint && <Text className="text-xs text-primary-600 mt-0.5">{row.hint}</Text>}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ALL SKILLS MODAL */}
      <Modal
        visible={showAllSkills}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAllSkills(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white w-full rounded-3xl p-6 shadow-xl overflow-hidden" style={{ maxHeight: '75%' }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-slate-800">Kỹ năng khuyến nghị</Text>
              <TouchableOpacity onPress={() => setShowAllSkills(false)} className="p-1">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap gap-3 pb-2">
                {displaySkills.map((skill: any, idx: number) => {
                  const style = getSkillStyle(skill.name);
                  return (
                    <View 
                      key={skill.id || idx} 
                      className={`flex-row items-center ${style.bg} px-4 py-2.5 rounded-2xl border ${style.border}`}
                      style={{ borderColor: style.borderColor }}
                    >
                      <Text className={`text-[13px] font-bold ${style.text}`}>
                        {skill.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <Button 
              className="mt-6 h-12 rounded-2xl"
              onPress={() => setShowAllSkills(false)}
            >
              Đóng
            </Button>
          </View>
        </View>
      </Modal>

      {/* REQUIREMENTS */}
      {jobDetail.requiredTools?.length > 0 && (
        <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
          <Text className="text-base font-bold text-slate-800 mb-4" style={{ letterSpacing: -0.2 }}>Yêu cầu công việc</Text>
          <View className="gap-2">
            {jobDetail.requiredTools.map((tool: any, i: number) => (
              <View key={`r-${i}`} className="flex-row items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <View className="w-5 h-5 rounded-full bg-amber-200 justify-center items-center">
                  <Wrench size={10} color="#92400e" />
                </View>
                <Text className="flex-1 text-[13px] text-slate-700 font-medium">{tool}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* PRIVILEGES */}
      {jobDetail.providedTools?.length > 0 && (
        <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
          <Text className="text-base font-bold text-slate-800 mb-4" style={{ letterSpacing: -0.2 }}>Quyền lợi người lao động</Text>
          <View className="gap-2">
            {jobDetail.providedTools.map((tool: any, i: number) => (
              <View key={`p-${i}`} className="flex-row items-center gap-2 p-3 bg-primary-50 border border-primary-100 rounded-xl">
                <View className="w-5 h-5 rounded-full bg-primary-200 justify-center items-center">
                  <CheckCircle size={10} color="#065f46" />
                </View>
                <Text className="flex-1 text-[13px] text-slate-700 font-medium">{tool}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}
