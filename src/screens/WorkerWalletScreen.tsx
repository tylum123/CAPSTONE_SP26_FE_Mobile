import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, XCircle, TrendingDown, CreditCard, Download, History, ChevronRight } from "lucide-react-native";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ListItem } from "../components/ui/ListItem";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";

type TxType   = "income" | "withdraw" | "escrow" | "refund";
type TxStatus = "completed" | "pending" | "failed" | "processing";
interface Transaction { id: number; type: TxType; amount: number; description: string; date: string; status: TxStatus; jobTitle?: string; }

const TX_ICON_MAP: Record<TxType, { color: string; bg: string }> = {
  income:   { color: "#059669", bg: "#d1fae5" },
  withdraw: { color: "#2563eb", bg: "#dbeafe" },
  escrow:   { color: "#f59e0b", bg: "#fef3c7" },
  refund:   { color: "#64748b", bg: "#f1f5f9" },
};

export function WorkerWalletScreen() {
  const [_sel, setSel] = useState<"vnpay" | "momo" | null>(null);

  const walletBalance  = 1250000;
  const escrowBalance  = 450000;

  const paymentMethods = [
    { id: "vnpay", name: "VNPay", logo: "https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png", connected: true  },
    { id: "momo",  name: "MoMo",  logo: "https://developers.momo.vn/v3/img/logo.png",                               connected: false },
  ];

  const transactions: Transaction[] = [
    { id: 1, type: "income",   amount: 250000, description: "Thu hoạch lúa",       date: "20/01/2026", status: "completed", jobTitle: "Thu hoạch lúa - Nguyễn Văn A"    },
    { id: 2, type: "escrow",   amount: 200000, description: "Chăm sóc vườn cam",   date: "19/01/2026", status: "pending",   jobTitle: "Chăm sóc vườn cam - Trần Thị B"  },
    { id: 3, type: "withdraw", amount: 500000, description: "Rút tiền về VNPay",   date: "18/01/2026", status: "completed"                                               },
    { id: 4, type: "income",   amount: 180000, description: "Làm đất trồng rau",   date: "17/01/2026", status: "completed", jobTitle: "Làm đất trồng rau - Phạm Thị D"  },
    { id: 5, type: "escrow",   amount: 250000, description: "Phun thuốc sâu",      date: "16/01/2026", status: "processing", jobTitle: "Phun thuốc sâu - Lê Văn C"      },
  ];

  const getTxIcon = (type: TxType, status: TxStatus) => {
    const size = 20;
    if (status === "failed") return <XCircle size={size} color="#dc2626" />;
    switch (type) {
      case "income":   return <ArrowDownLeft size={size} color="#059669" />;
      case "withdraw": return <ArrowUpRight  size={size} color="#2563eb" />;
      case "escrow":   return <Clock         size={size} color="#f59e0b" />;
      default:         return <TrendingDown  size={size} color="#64748b" />;
    }
  };

  const getStatusBadge = (status: TxStatus) => {
    switch (status) {
      case "completed":  return <Badge variant="success">Hoàn thành</Badge>;
      case "pending":    return <Badge variant="warning">Chờ xử lý</Badge>;
      case "processing": return <Badge variant="secondary">Đang xử lý</Badge>;
      case "failed":     return <Badge variant="danger">Thất bại</Badge>;
      default:           return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* BALANCE CARD */}
        <View className="bg-primary-600 px-6 pt-6 pb-10 rounded-b-[28px] overflow-hidden relative mb-6" style={{ shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
          <View className="absolute w-[220px] h-[220px] rounded-full top-[-80px] right-[-70px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
          <View className="absolute w-[120px] h-[120px] rounded-full bottom-[30px] left-[-30px]" style={{ backgroundColor: "rgba(16,185,129,0.35)" }} />

          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-primary-200 text-[13px] font-medium mb-1">Số dư khả dụng</Text>
              <Text className="text-white text-[36px] font-extrabold" style={{ letterSpacing: -1 }}>
                {walletBalance.toLocaleString("vi-VN")}<Text className="text-[22px] font-semibold">₫</Text>
              </Text>
            </View>
            <View className="w-14 h-14 rounded-full justify-center items-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
              <Wallet size={28} color="#ffffff" />
            </View>
          </View>

          {escrowBalance > 0 && (
            <View className="flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5 mb-4" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
              <Clock size={13} color="#fcd34d" />
              <Text className="text-rice-300 text-xs font-semibold">Đang giữ: {escrowBalance.toLocaleString("vi-VN")}₫</Text>
            </View>
          )}

          {/* Quick actions */}
          <View className="flex-row gap-3">
            {[{ Icon: Download, label: "Rút tiền" }, { Icon: History, label: "Lịch sử" }, { Icon: CreditCard, label: "Liên kết" }].map(({ Icon, label }) => (
              <TouchableOpacity key={label} className="flex-1 bg-white rounded-2xl py-3 items-center gap-1.5" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}>
                <View className="w-[42px] h-[42px] rounded-full bg-primary-50 justify-center items-center">
                  <Icon size={20} color="#059669" />
                </View>
                <Text className="text-xs font-semibold text-slate-700">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PAYMENT METHODS */}
        <View className="px-4 mb-4">
          <SectionHeader title="Phương thức thanh toán" />
          <Card variant="elevated">
            {paymentMethods.map((m, i) => (
              <ListItem
                key={m.id}
                title={m.name}
                subtitle={m.connected ? "✓ Đã kết nối" : "Chưa kết nối"}
                leftSlot={
                  <View className="w-12 h-12 bg-slate-50 rounded-xl justify-center items-center p-1.5 border border-slate-100">
                    <Image source={{ uri: m.logo }} style={{ width: 32, height: 32 }} resizeMode="contain" />
                  </View>
                }
                rightSlot={
                  m.connected
                    ? <ChevronRight size={18} color="#cbd5e1" />
                    : <Button variant="outline" size="sm">Kết nối</Button>
                }
                onPress={() => { if (m.connected) setSel(m.id as any); }}
                style={i < paymentMethods.length - 1 ? { borderBottomWidth: 1, borderBottomColor: "#f8fafc" } : undefined}
              />
            ))}
          </Card>
        </View>

        {/* TRANSACTIONS */}
        <View className="px-4 mb-4">
          <SectionHeader title="Giao dịch gần đây" actionLabel="Xem tất cả" />
          <Card variant="elevated">
            {transactions.map((tx, i) => {
              const meta = TX_ICON_MAP[tx.type];
              return (
                <ListItem
                  key={tx.id}
                  title={tx.description}
                  subtitle={tx.jobTitle || tx.date}
                  leftSlot={<View className="w-11 h-11 rounded-full justify-center items-center" style={{ backgroundColor: meta.bg }}>{getTxIcon(tx.type, tx.status)}</View>}
                  rightSlot={
                    <View className="items-end gap-1">
                      <Text className="text-[15px] font-bold" style={{ color: meta.color }}>
                        {tx.type === "withdraw" ? "-" : "+"}{tx.amount.toLocaleString("vi-VN")}₫
                      </Text>
                      {getStatusBadge(tx.status)}
                    </View>
                  }
                  style={i < transactions.length - 1 ? { borderBottomWidth: 1, borderBottomColor: "#f8fafc" } : undefined}
                />
              );
            })}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
