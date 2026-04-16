/* AI CONTEXT:
 * Action: Renders the description, requirement, and privilege blocks.
 * Inputs: Job detail data, formatted info grid rows.
 * Outputs: Multiple UI blocks mapping out job specifics.
 * Dependencies: Lucide icons. */

import React from "react";
import { View, Text } from "react-native";
import { CheckCircle, Wrench } from "lucide-react-native";
import { Badge } from "../ui/Badge";

export function RenderJobInfoSections({ jobDetail, infoRows }: { jobDetail: any, infoRows: any[] }) {
  if (!jobDetail) return null;
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
                {row.label === "Kỹ năng yêu cầu" && row.value !== "Không yêu cầu" ? (
                  <View className="flex-row flex-wrap gap-1.5 mt-1">
                    {row.value.split(",").map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-2 py-0.5">
                        {skill.trim()}
                      </Badge>
                    ))}
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
