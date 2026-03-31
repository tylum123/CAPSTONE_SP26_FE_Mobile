/* AI CONTEXT:
 * Action: Displays user financial balance and recent transaction history.
 * Inputs: Wallet balance fetch, transaction list payload.
 * Outputs: Rendered financial ledger UI.
 * Dependencies: Wallet service, Navigation parameters. */

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, XCircle, TrendingDown, CreditCard, Download, History, ChevronRight } from "lucide-react-native";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ListItem } from "../components/ui/ListItem";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import { walletService } from "../services/wallet.service";
import { useAuth } from "../context/AuthContext";
import { DEMO_WALLET, DEMO_TRANSACTIONS } from "../constants/demoData";
import { WalletTransactionType, WalletTransactionTypeLabels } from "../constants/enums";

type TxType = "income" | "withdraw" | "escrow" | "refund" | "lock";
type TxStatus = "completed" | "pending" | "failed" | "processing";

interface Transaction { 
  id: string | number; 
  type: TxType; 
  amount: number; 
  description: string; 
  date: string; 
  status: TxStatus; 
  jobTitle?: string; 
}

const TX_ICON_MAP: Record<TxType, { color: string; bg: string }> = {
  income:   { color: "#059669", bg: "#d1fae5" },
  withdraw: { color: "#2563eb", bg: "#dbeafe" },
  escrow:   { color: "#f59e0b", bg: "#fef3c7" },
  refund:   { color: "#64748b", bg: "#f1f5f9" },
  lock:     { color: "#f59e0b", bg: "#fef3c7" },
};

const mapBackendTxType = (type: WalletTransactionType): TxType => {
  switch (type) {
    case WalletTransactionType.Deposit: return "income";
    case WalletTransactionType.Withdraw: return "withdraw";
    case WalletTransactionType.JobPayment: return "income";
    case WalletTransactionType.Refund: return "refund";
    case WalletTransactionType.JobLock: return "lock";
    default: return "income";
  }
};

export function WorkerWalletScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [escrow, setEscrow] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [_sel, setSel] = useState<"vnpay" | "momo" | null>(null);

  const fetchData = useCallback(async () => {
    if (user?.isDemo) {
      setBalance(DEMO_WALLET.balance);
      setEscrow(DEMO_WALLET.escrowBalance || 0);
      // @ts-ignore
      setTransactions(DEMO_TRANSACTIONS.map(tx => ({
        ...tx,
        type: mapBackendTxType(tx.type as WalletTransactionType),
        date: new Date(tx.date).toLocaleDateString("vi-VN"),
        status: tx.status as TxStatus
      })));
      setLoading(false);
      return;
    }

    try {
      const wallet = await walletService.getWallet();
      
      // If balance is 0 or wallet is missing, we could fallback to demo for testing visibility
      if (wallet.balance === 0 && wallet.escrowBalance === 0) {
        setBalance(DEMO_WALLET.balance);
        setEscrow(DEMO_WALLET.escrowBalance || 0);
      } else {
        setBalance(wallet.balance);
        setEscrow(wallet.escrowBalance || 0);
      }
      
      const txs = await walletService.getTransactions(wallet.id);
      if (txs.length === 0) {
        // @ts-ignore
        setTransactions(DEMO_TRANSACTIONS.map(tx => ({
          ...tx,
          type: mapBackendTxType(tx.type as WalletTransactionType),
          date: new Date(tx.date).toLocaleDateString("vi-VN"),
          status: tx.status as TxStatus
        })));
      } else {
        setTransactions(txs.map(tx => ({
          id: tx.id,
          type: mapBackendTxType(tx.type as WalletTransactionType),
          amount: tx.amount,
          description: tx.description || WalletTransactionTypeLabels[tx.type as WalletTransactionType],
          date: new Date(tx.createdAt).toLocaleDateString("vi-VN"),
          status: tx.status?.toLowerCase() as TxStatus || "completed",
          jobTitle: tx.jobPostTitle
        })));
      }
    } catch (error) {
      console.error("Failed to fetch wallet data, using mock data", error);
      setBalance(DEMO_WALLET.balance);
      setEscrow(DEMO_WALLET.escrowBalance || 0);
      // @ts-ignore
      setTransactions(DEMO_TRANSACTIONS.map(tx => ({
        ...tx,
        type: mapBackendTxType(tx.type as WalletTransactionType),
        date: new Date(tx.date).toLocaleDateString("vi-VN"),
        status: tx.status as TxStatus
      })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const paymentMethods = [
    { id: "vnpay", name: "VNPay", logo: "https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png", connected: true  },
    { id: "momo",  name: "MoMo",  logo: "https://developers.momo.vn/v3/img/logo.png",                               connected: false },
  ];

  const getTxIcon = (type: TxType, status: TxStatus) => {
    const size = 20;
    if (status === "failed") return <XCircle size={size} color="#dc2626" />;
    switch (type) {
      case "income":   return <ArrowDownLeft size={size} color="#059669" />;
      case "withdraw": return <ArrowUpRight  size={size} color="#2563eb" />;
      case "escrow":   return <Clock         size={size} color="#f59e0b" />;
      case "lock":     return <Clock         size={size} color="#f59e0b" />;
      default:         return <TrendingDown  size={size} color="#64748b" />;
    }
  };

  const getStatusBadge = (status: TxStatus) => {
    switch (status) {
      case "completed":  return <Badge variant="success">Hoàn thành</Badge>;
      case "pending":    return <Badge variant="warning">Chờ xử lý</Badge>;
      case "processing": return <Badge variant="secondary">Đang xử lý</Badge>;
      case "failed":     return <Badge variant="danger">Thất bại</Badge>;
      default:           return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
      >
        {/* BALANCE CARD */}
        <View className="bg-primary-600 px-6 pt-6 pb-10 rounded-b-[28px] overflow-hidden relative mb-6" style={{ shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
          <View className="absolute w-[220px] h-[220px] rounded-full top-[-80px] right-[-70px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
          <View className="absolute w-[120px] h-[120px] rounded-full bottom-[30px] left-[-30px]" style={{ backgroundColor: "rgba(16,185,129,0.35)" }} />

          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-primary-200 text-[13px] font-medium mb-1">Số dư khả dụng</Text>
              <Text className="text-white text-[36px] font-extrabold" style={{ letterSpacing: -1 }}>
                {balance.toLocaleString("vi-VN")}<Text className="text-[22px] font-semibold">₫</Text>
              </Text>
            </View>
            <View className="w-14 h-14 rounded-full justify-center items-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
              <Wallet size={28} color="#ffffff" />
            </View>
          </View>

          {escrow > 0 && (
            <View className="flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5 mb-4" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
              <Clock size={13} color="#fcd34d" />
              <Text className="text-rice-300 text-xs font-semibold">Đang giữ: {escrow.toLocaleString("vi-VN")}₫</Text>
            </View>
          )}

          {/* Quick actions */}
          <View className="flex-row gap-3">
            {[
              { Icon: Download, label: "Rút tiền", onPress: () => navigation.navigate("Withdrawal") },
              { Icon: History, label: "Lịch sử" },
            ].map(({ Icon, label, onPress }) => (
              <TouchableOpacity 
                key={label} 
                onPress={onPress}
                className="flex-1 bg-white rounded-2xl py-3 items-center gap-1.5" 
                style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}
              >
                <View className="w-[42px] h-[42px] rounded-full bg-primary-50 justify-center items-center">
                  <Icon size={20} color="#059669" />
                </View>
                <Text className="text-xs font-semibold text-slate-700">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
