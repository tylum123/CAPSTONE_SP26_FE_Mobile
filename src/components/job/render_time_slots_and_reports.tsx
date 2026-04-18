/* AI CONTEXT:
 * Action: Renders the time slots and task reports block.
 * Inputs: Job detail data, app status, selected slots and toggle handler.
 * Outputs: UI elements for picking work days or viewing reports.
 * Dependencies: Badge component, Lucide icons. */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Clock, Calendar, Banknote, MessageCircle, AlertCircle } from "lucide-react-native";
import { Badge } from "../ui/Badge";
import { canSubmitDispute } from "../../utils/disputeRules";
import { useNavigation } from "@react-navigation/native";

type Props = {
  jobDetail: any;
  applicationInfo: any;
  selectedTimeSlots: string[];
  isApplied: boolean;
  toggleTimeSlot: (id: number) => void;
};

export function RenderTimeSlotsAndReports({ jobDetail, applicationInfo, selectedTimeSlots, isApplied, toggleTimeSlot }: Props) {
  const navigation = useNavigation<any>();
  if (!jobDetail) return null;

  return (
    <>
      {Number(applicationInfo.statusId) === 2 && (
        <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
          <Text className="text-base font-bold text-slate-800 mb-1" style={{ letterSpacing: -0.2 }}>Báo cáo chi tiết</Text>
          <Text className="text-[13px] text-slate-400 mb-4">Lịch sử báo cáo và tiến độ được duyệt</Text>
          
          {applicationInfo.responseMessage && (
            <View className="mb-4 bg-primary-50 p-4 rounded-2xl border border-primary-100 flex-row gap-3">
              <MessageCircle size={18} color="#059669" />
              <View className="flex-1">
                <Text className="text-[11px] text-primary-600 font-bold uppercase mb-0.5">Lời nhắn từ Farmer</Text>
                <Text className="text-[13px] text-slate-700 italic">"{applicationInfo.responseMessage}"</Text>
              </View>
            </View>
          )}

          <View className="gap-3">
            {jobDetail.reports?.length > 0 ? (
              jobDetail.reports.map((report: any, i: number) => (
                <View key={report.id || i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="text-sm font-bold text-slate-800">{new Date(report.workDate).toLocaleDateString("vi-VN")}</Text>
                      <Text className="text-[11px] text-slate-500 mt-0.5">{report.workerDescription || "Báo cáo công việc hàng ngày"}</Text>
                    </View>
                    <Badge variant={report.farmerApprovedPercent === 100 ? "success" : report.farmerApprovedPercent > 0 ? "warning" : "secondary"}>
                      {report.farmerApprovedPercent === 100 ? "Đã duyệt 100%" : report.farmerApprovedPercent > 0 ? `Đã duyệt ${report.farmerApprovedPercent}%` : "Chờ duyệt"}
                    </Badge>
                  </View>

                  <View className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <View className="h-full bg-primary-500" style={{ width: `${report.farmerApprovedPercent || 0}%` }} />
                  </View>

                  <View className="flex-row justify-between items-center bg-white px-3 py-2 rounded-xl">
                    <View className="flex-row items-center gap-1.5">
                      <Banknote size={14} color="#059669" />
                      <Text className="text-xs text-slate-600 font-medium">Thù lao nhận:</Text>
                    </View>
                    <Text className="text-sm font-extrabold text-primary-600">
                      {report.workerPaymentAmount ? `${report.workerPaymentAmount.toLocaleString("vi-VN")}₫` : "---"}
                    </Text>
                  </View>
                  
                  {report.farmerFeedback && (
                    <View className="mt-3 bg-amber-50 p-2.5 rounded-xl border border-amber-100 flex-row gap-2">
                      <MessageCircle size={14} color="#d97706" />
                      <Text className="flex-1 text-[11px] text-amber-800 leading-4 italic">"{report.farmerFeedback}"</Text>
                    </View>
                  )}

                  {/* Dispute Action Shortcut */}
                  {canSubmitDispute({ 
                    ...report, 
                    statusId: report.farmerApprovedPercent !== undefined ? 3 : 2, 
                    jobPost: jobDetail 
                  }) && (
                    <TouchableOpacity 
                      className="mt-3 flex-row items-center justify-center bg-rose-50 py-2.5 rounded-xl border border-rose-100 gap-2"
                      onPress={() => navigation.navigate("SubmitDispute", {
                        jobPostId: jobDetail.id,
                        reportId: report.id,
                        farmerName: jobDetail.farmer?.name,
                        jobTitle: jobDetail.title,
                        isKhoán: jobDetail.jobTypeId === 1
                      })}
                    >
                      <AlertCircle size={14} color="#e11d48" />
                      <Text className="text-xs font-bold text-rose-600">Khiếu nại báo cáo này</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View className="py-8 items-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Clock size={24} color="#cbd5e1" className="mb-2" />
                <Text className="text-sm text-slate-400">Chưa có báo cáo nào được gửi</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {(jobDetail.wageTypeId !== "Khoán" && jobDetail.timeSlots) && (
        <View className="bg-white rounded-[20px] p-4 mb-4 border border-slate-100">
          <Text className="text-base font-bold text-slate-800 mb-1" style={{ letterSpacing: -0.2 }}>
            {applicationInfo.statusId === 2 ? "Lịch làm việc của bạn" : "Chọn khung giờ"}
          </Text>
          <Text className="text-[13px] text-slate-400 mb-4">
            {applicationInfo.statusId === 2 
              ? "Dưới đây là các ngày bạn đã đăng ký làm việc." 
              : "Bạn muốn làm việc vào những ngày nào?"}
          </Text>
          <View className="gap-2.5">
            {jobDetail.timeSlots.map((slot: any) => {
              const key = String(slot.rawDate || slot.date).substring(0, 10);
              const selected = selectedTimeSlots.some(s => s.substring(0, 10) === key);
              const isSelectedAndApplied = isApplied && selected;

              return (
                <TouchableOpacity
                  key={slot.id}
                  className={[
                    "flex-row items-center gap-2 p-4 rounded-2xl border-2", 
                    !slot.available ? "bg-slate-50 border-slate-100" : 
                    isSelectedAndApplied ? "bg-green-50 border-green-200" :
                    selected ? "bg-primary-600 border-primary-700" : 
                    "bg-white border-slate-200"
                  ].join(" ")}
                  onPress={() => toggleTimeSlot(slot.id)}
                  disabled={!slot.available || isApplied}
                  activeOpacity={0.85}
                >
                  <Calendar size={18} color={isSelectedAndApplied ? "#059669" : selected ? "#ffffff" : slot.available ? "#059669" : "#cbd5e1"} />
                  <Text className={[
                    "text-[15px] font-bold", 
                    isSelectedAndApplied ? "text-green-700" :
                    selected ? "text-white" : 
                    !slot.available ? "text-slate-300" : 
                    "text-slate-800"
                  ].join(" ")}>{slot.date}</Text>
                  
                  {!slot.available && <Badge variant="secondary">Đã đủ</Badge>}
                  {isSelectedAndApplied && !slot.reportedAt && applicationInfo.statusId !== 2 && (
                    <View className="ml-auto bg-green-100 px-2 py-1 rounded-lg border border-green-200">
                      <Text className="text-[10px] font-bold text-green-700 uppercase">✓ Đã ứng tuyển</Text>
                    </View>
                  )}

                  {slot.reportedAt && (
                    <View className="ml-auto bg-primary-100 px-2 py-1 rounded-lg border border-primary-200">
                      <Text className="text-[10px] font-bold text-primary-700 uppercase">✓ Đã báo cáo</Text>
                    </View>
                  )}
                  
                  {applicationInfo.statusId === 2 && !slot.reportedAt && (
                    <View className="ml-auto bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                      <Text className="text-[10px] font-bold text-slate-500 uppercase">Chưa báo cáo</Text>
                    </View>
                  )}
                  
                  {selected && !isApplied && (
                    <View className="ml-auto w-6 h-6 rounded-full bg-white justify-center items-center">
                      <Text className="text-sm font-extrabold text-primary-600">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </>
  );
}
