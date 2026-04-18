/* AI CONTEXT:
 * Action: Renders the time slots and task reports block.
 * Inputs: Job detail data, app status, selected slots and toggle handler.
 * Outputs: UI elements for picking work days or viewing reports.
 * Dependencies: Badge component, Lucide icons. */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Clock, Calendar, Banknote, MessageCircle, AlertCircle, Users } from "lucide-react-native";
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
              const isApproved = Number(applicationInfo.statusId) === 2;
              const isPending = Number(applicationInfo.statusId) === 1;
              const isSelectedAndApproved = isApproved && selected;
              const isSelectedAndApplied = isApplied && selected;

              return (
                <TouchableOpacity
                  key={slot.id}
                  className={[
                    "flex-row items-center justify-between p-4 rounded-2xl border-2 min-h-[72px] mb-2.5",
                    isSelectedAndApproved ? "bg-emerald-50/80 border-emerald-200" : 
                    selected ? "bg-sky-50 border-transparent" : 
                    !slot.available ? "bg-rose-50/50 border-rose-100 opacity-90" : 
                    "bg-white border-slate-100"
                  ].join(" ")}
                  onPress={() => toggleTimeSlot(slot.id)}
                  disabled={!slot.available || isApplied}
                  activeOpacity={0.85}
                >
                  <View className="flex-row items-center gap-3 pr-4" style={{ flex: 1 }}>
                    <Calendar 
                      size={20} 
                      color={isSelectedAndApproved ? "#057a55" : selected ? "#0284c7" : slot.available ? "#0ea5e9" : "#94a3b8"} 
                    />
                    <Text 
                      numberOfLines={1}
                      className={[
                        "text-[16px] font-bold", 
                        isSelectedAndApproved ? "text-emerald-900" : 
                        selected ? "text-sky-700" : 
                        !slot.available ? "text-rose-400" : 
                        "text-slate-700"
                      ].join(" ")}
                      style={selected && !isApplied ? { color: 'white' } : {}}
                    >
                      {slot.date}
                    </Text>
                  </View>

                  {/* Right Indicators Group */}
                  <View className="flex-row items-center gap-1.5">
                    {/* Recruitment Capacity Pill */}
                    {slot.neededCount > 0 && (
                      <View 
                        className={[
                          "flex-row items-center gap-1 px-2.5 py-1.5 rounded-full border min-w-[55px] justify-center",
                          selected && !isApproved ? "bg-sky-100 border-sky-200" :
                          !slot.available ? "bg-rose-50 border-rose-100" :
                          slot.acceptedCount > 0 ? "bg-emerald-50 border-emerald-100" :
                          "bg-slate-50 border-slate-100"
                        ].join(" ")}
                      >
                        <Users 
                          size={12} 
                          color={
                            selected && !isApproved ? "#0284c7" :
                            !slot.available ? "#e11d48" :
                            slot.acceptedCount > 0 ? "#059669" :
                            "#64748b"
                          } 
                        />
                        <Text className={[
                          "text-[11px] font-extrabold",
                          selected && !isApproved ? "text-sky-700" :
                          !slot.available ? "text-rose-600" :
                          slot.acceptedCount > 0 ? "text-emerald-700" :
                          "text-slate-500"
                        ].join(" ")}>
                          {slot.acceptedCount}/{slot.neededCount}
                        </Text>
                      </View>
                    )}

                    {!slot.available && !isSelectedAndApplied && (
                      <Badge variant="secondary" className="px-2 h-7">Hết chỗ</Badge>
                    )}
                    
                    {/* ONLY show report status if user is officially accepted for THIS specific day */}
                    {isSelectedAndApproved && (() => {
                      const now = new Date();
                      // Compare only the date part to avoid premature "overdue" on the same day
                      const slotDate = new Date(slot.rawDate);
                      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const isPast = slotDate < today;

                      let statusLabel = "Chờ báo cáo";
                      let containerStyle = "bg-emerald-100 border-emerald-200";
                      let textStyle = "text-emerald-700";

                      if (slot.reportedAt) {
                        statusLabel = "Đã báo cáo";
                        containerStyle = "bg-primary-100 border-primary-200";
                        textStyle = "text-primary-700";
                      } else if (isPast) {
                        statusLabel = "Quá hạn";
                        containerStyle = "bg-rose-100 border-rose-200";
                        textStyle = "text-rose-700";
                      }

                      return (
                        <View className={["px-2.5 py-1.5 rounded-lg border", containerStyle].join(" ")}>
                          <Text className={["text-[10px] font-extrabold uppercase", textStyle].join(" ")}>
                            {statusLabel}
                          </Text>
                        </View>
                      );
                    })()}

                    {isPending && selected && (
                      <Badge variant="warning" className="px-2 h-7">Đợi duyệt</Badge>
                    )}
                    
                    {selected && !isApproved && (
                      <View className="w-6 h-6 rounded-full bg-sky-200/50 justify-center items-center ml-1">
                        <Text className="text-sm font-extrabold text-sky-700">✓</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Progress Strip at Bottom */}
                  {slot.neededCount > 0 && (
                    <View className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-100/30 rounded-b-2xl overflow-hidden">
                      <View 
                        className={[
                          "h-full",
                          !slot.available ? "bg-rose-500" : "bg-emerald-500"
                        ].join(" ")} 
                        style={{ width: `${Math.min((slot.acceptedCount / slot.neededCount) * 100, 100)}%` }} 
                      />
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
