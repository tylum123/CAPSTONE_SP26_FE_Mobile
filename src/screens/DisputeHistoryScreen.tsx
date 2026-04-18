/**
 * AI CONTEXT:
 * Action: Displays a list of all dispute reports filed by the current worker.
 * Inputs: Dispute array from useFetchMyDisputes hooks.
 * Outputs: Scrollable list of dispute cards with pull-to-refresh and empty state.
 * Dependencies: useFetchMyDisputes, RenderDisputeCard, FlatList UI components. */

import React from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Info, HelpCircle, AlertCircle } from "lucide-react-native";
import { useFetchMyDisputes } from "../hooks/use_fetch_my_disputes";
import { RenderDisputeCard } from "../components/dispute/render_dispute_card";
import { EmptyState, PillTabs } from "../components/ui/export_ui_components";
import { DisputeStatus, DisputeType, DisputeStatusLabels, DisputeTypeLabels } from "../constants/enums";
import { Filter, Tag } from "lucide-react-native";

export function DisputeHistoryScreen({ navigation }: any) {
  const { disputes, isLoading, error, refetch } = useFetchMyDisputes();
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");

  const filteredDisputes = disputes.filter(d => {
    if (statusFilter !== "all" && d.statusId !== parseInt(statusFilter)) return false;
    if (typeFilter !== "all" && d.disputeTypeId !== parseInt(typeFilter)) return false;
    return true;
  });

  const renderHeader = () => (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
      <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
        <ChevronLeft size={24} color="#0f172a" />
      </TouchableOpacity>
      <Text className="flex-1 text-center text-lg font-extrabold text-slate-900 mr-8 uppercase tracking-tight">
        Lịch sử khiếu nại
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 pt-20 px-8">
      <EmptyState 
        title="Chưa có khiếu nại nào" 
        message="Toàn bộ lịch sử khiếu nại của bạn về công việc hoặc thù lao sẽ hiển thị tại đây."
        icon={HelpCircle} 
      />
    </View>
  );

  if (isLoading && disputes.length === 0) {
    return (
      <View className="flex-1 bg-slate-50">
        {renderHeader()}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#059669" size="large" />
          <Text className="text-slate-400 mt-4 font-semibold uppercase text-xs tracking-widest">Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {renderHeader()}

      {error ? (
        <View className="bg-rose-50 border-b border-rose-100 p-4 flex-row items-center gap-3">
          <AlertCircle size={20} color="#dc2626" />
          <Text className="flex-1 text-rose-800 text-sm font-semibold">{error}</Text>
          <TouchableOpacity onPress={refetch} className="bg-rose-600 px-3 py-1.5 rounded-lg shadow-sm shadow-rose-200">
            <Text className="text-white font-bold text-xs">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="bg-emerald-50/50 p-4 border-b border-emerald-100/50 flex-row items-start gap-2.5">
          <Info size={16} color="#059669" className="mt-0.5" />
          <Text className="flex-1 text-[13px] text-emerald-800 leading-5">
            Dữ liệu khiếu nại giúp hệ thống công bằng hơn. Nếu có vấn đề với thù lao, vui lòng gửi phản hồi ngay tại báo cáo.
          </Text>
        </View>
      )}

      {/* Filters Section */}
      <View className="bg-white px-4 pt-2 pb-3 border-b border-slate-100 shadow-sm shadow-slate-200/50">
        <View className="flex-row items-center bg-slate-50/80 rounded-xl px-3 py-2 mb-3">
          <Tag size={14} color="#64748b" />
          <View className="flex-row ml-2 gap-2 flex-1 items-center">
            {[
              { id: "all", label: "Tất cả loại" },
              { id: "1", label: "Chất lượng" },
              { id: "2", label: "Thanh toán" },
              { id: "3", label: "Khác" },
            ].map((t) => (
              <TouchableOpacity 
                key={t.id} 
                onPress={() => setTypeFilter(t.id)}
                className={`px-3 py-1 rounded-full ${typeFilter === t.id ? "bg-slate-200" : ""}`}
              >
                <Text className={`text-[11px] font-bold ${typeFilter === t.id ? "text-slate-800" : "text-slate-400"}`}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PillTabs
          items={[
            { key: "all", label: "Tất cả trạng thái" },
            { key: "1", label: "Đang chờ" },
            { key: "2", label: "Xem xét" },
            { key: "3", label: "Đã duyệt" },
            { key: "4", label: "Từ chối" },
          ]}
          activeKey={statusFilter}
          onChange={setStatusFilter}
        />
      </View>

      <FlatList
        data={filteredDisputes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <RenderDisputeCard dispute={item} />}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={["#059669"]} />
        }
      />
    </SafeAreaView>
  );
}
