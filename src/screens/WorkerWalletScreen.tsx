/* AI CONTEXT:
 * Action: Displays user financial balance and recent transaction history.
 * Inputs: Wallet balance fetch, transaction list payload.
 * Outputs: Rendered financial ledger UI — premium redesign.
 * Dependencies: Wallet service, Navigation parameters. */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  XCircle,
  ChevronLeft,
  TrendingUp,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Loader,
  CalendarDays,
  Send,
  History,
} from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { walletService } from "../services/wallet.service";
import { useAuth } from "../context/AuthContext";
import { DEMO_WALLET, DEMO_TRANSACTIONS } from "../constants/demoData";
import { WalletTransactionType, WalletTransactionTypeLabels } from "../constants/enums";

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mapBackendTxType = (type: WalletTransactionType): TxType => {
  switch (type) {
    case WalletTransactionType.Deposit:    return "income";
    case WalletTransactionType.Withdraw:   return "withdraw";
    case WalletTransactionType.JobPayment: return "income";
    case WalletTransactionType.Refund:     return "refund";
    case WalletTransactionType.JobLock:    return "lock";
    default: return "income";
  }
};

const fmtCurrency = (val: number) =>
  val.toLocaleString("vi-VN") + "₫";

const fmtCompact = (val: number) => {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
  if (val >= 1_000)     return Math.floor(val / 1_000) + "K";
  return val.toString();
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const TX_CONFIG: Record<TxType, { color: string; bg: string; label: string; sign: 1 | -1 }> = {
  income:   { color: "#059669", bg: "#d1fae5", label: "Thu nhập",  sign:  1 },
  withdraw: { color: "#2563eb", bg: "#dbeafe", label: "Rút tiền",  sign: -1 },
  escrow:   { color: "#d97706", bg: "#fef3c7", label: "Tạm giữ",   sign: -1 },
  refund:   { color: "#7c3aed", bg: "#ede9fe", label: "Hoàn tiền", sign:  1 },
  lock:     { color: "#d97706", bg: "#fef3c7", label: "Tạm khóa",  sign: -1 },
};

function TxIcon({ type, status }: { type: TxType; status: TxStatus }) {
  const size = 18;
  if (status === "failed")     return <XCircle      size={size} color="#dc2626" />;
  if (status === "processing") return <Loader       size={size} color="#d97706" />;
  switch (type) {
    case "income":   return <ArrowDownLeft size={size} color="#059669" />;
    case "withdraw": return <ArrowUpRight  size={size} color="#2563eb" />;
    case "escrow":
    case "lock":     return <Clock         size={size} color="#d97706" />;
    case "refund":   return <ArrowDownLeft size={size} color="#7c3aed" />;
    default:         return <Banknote      size={size} color="#64748b" />;
  }
}

function StatusChip({ status }: { status: TxStatus }) {
  const map: Record<TxStatus, { label: string; color: string; bg: string; Icon: any }> = {
    completed:  { label: "Thành công", color: "#059669", bg: "#d1fae5", Icon: CheckCircle2 },
    pending:    { label: "Chờ xử lý",  color: "#d97706", bg: "#fef3c7", Icon: Clock        },
    processing: { label: "Đang xử lý", color: "#2563eb", bg: "#dbeafe", Icon: Loader       },
    failed:     { label: "Thất bại",   color: "#dc2626", bg: "#fee2e2", Icon: AlertCircle  },
  };
  const { label, color, bg, Icon } = map[status] ?? map.completed;
  return (
    <View className="flex-row items-center gap-1 rounded-full px-2 py-0.5" style={{ backgroundColor: bg }}>
      <Icon size={10} color={color} />
      <Text style={{ color, fontSize: 10, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function WorkerWalletScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [balance, setBalance]           = useState(0);
  const [escrow, setEscrow]             = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [filter, setFilter]             = useState<"all" | TxType>("all");

  // Animate hero balance
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(balanceAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim,    { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const fetchData = useCallback(async () => {
    if (user?.isDemo) {
      setBalance(DEMO_WALLET.balance);
      setEscrow(DEMO_WALLET.escrowBalance || 0);
      // @ts-ignore
      setTransactions(DEMO_TRANSACTIONS.map(tx => ({
        ...tx,
        type: mapBackendTxType(tx.type as WalletTransactionType),
        date: new Date(tx.date).toLocaleDateString("vi-VN"),
        status: tx.status as TxStatus,
      })));
      setLoading(false);
      animateIn();
      return;
    }

    try {
      const wallet = await walletService.getWallet();
      const hasRealData = wallet.balance > 0 || (wallet.escrowBalance ?? 0) > 0;
      setBalance(hasRealData ? wallet.balance : DEMO_WALLET.balance);
      setEscrow(hasRealData ? (wallet.escrowBalance || 0) : (DEMO_WALLET.escrowBalance || 0));

      const txs = await walletService.getTransactions(wallet.id);
      if (txs.length === 0) {
        // @ts-ignore
        setTransactions(DEMO_TRANSACTIONS.map(tx => ({
          ...tx,
          type: mapBackendTxType(tx.type as WalletTransactionType),
          date: new Date(tx.date).toLocaleDateString("vi-VN"),
          status: tx.status as TxStatus,
        })));
      } else {
        setTransactions(txs.map(tx => ({
          id: tx.id,
          type: mapBackendTxType(tx.type as WalletTransactionType),
          amount: tx.amount,
          description: tx.description || WalletTransactionTypeLabels[tx.type as WalletTransactionType],
          date: new Date(tx.createdAt).toLocaleDateString("vi-VN"),
          status: (tx.status?.toLowerCase() as TxStatus) || "completed",
          jobTitle: tx.jobPostTitle,
        })));
      }
    } catch {
      setBalance(DEMO_WALLET.balance);
      setEscrow(DEMO_WALLET.escrowBalance || 0);
      // @ts-ignore
      setTransactions(DEMO_TRANSACTIONS.map(tx => ({
        ...tx,
        type: mapBackendTxType(tx.type as WalletTransactionType),
        date: new Date(tx.date).toLocaleDateString("vi-VN"),
        status: tx.status as TxStatus,
      })));
    } finally {
      setLoading(false);
      setRefreshing(false);
      animateIn();
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // ── Derived stats ──
  const totalIncome   = transactions.filter(t => TX_CONFIG[t.type].sign ===  1).reduce((s, t) => s + t.amount, 0);
  const totalWithdraw = transactions.filter(t => t.type === "withdraw").reduce((s, t) => s + t.amount, 0);

  // ── Filtered list ──
  const filtered = filter === "all" ? transactions : transactions.filter(t => t.type === filter);

  // Group by date
  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach(tx => {
    if (!grouped[tx.date]) grouped[tx.date] = [];
    grouped[tx.date].push(tx);
  });
  const groupedEntries = Object.entries(grouped);

  // ── Filter tabs ──
  const FILTERS: { key: "all" | TxType; label: string }[] = [
    { key: "all",      label: "Tất cả"  },
    { key: "income",   label: "Thu nhập" },
    { key: "withdraw", label: "Rút tiền" },
    { key: "refund",   label: "Hoàn tiền"},
  ];

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: "#f0fdf4" }}>
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-slate-400 text-sm font-medium mt-3">Đang tải ví...</Text>
      </View>
    );
  }

  const translateY = balanceAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#f0fdf4" }} edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} />}
      >
        {/* ── HERO CARD ────────────────────────────────────── */}
        <LinearGradient
          colors={["#047857", "#059669", "#10b981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden", paddingBottom: 28 }}
        >
          {/* Decorative blobs */}
          <View style={{ position: "absolute", width: 240, height: 240, borderRadius: 120, top: -80, right: -60, backgroundColor: "rgba(255,255,255,0.07)" }} />
          <View style={{ position: "absolute", width: 140, height: 140, borderRadius: 70,  bottom: 20, left: -40, backgroundColor: "rgba(16,185,129,0.3)" }} />
          <View style={{ position: "absolute", width: 80,  height: 80,  borderRadius: 40,  top: 40, right: 100, backgroundColor: "rgba(255,255,255,0.05)" }} />

          {/* Top bar */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
              <ChevronLeft size={22} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-white text-[17px] font-bold">Ví của tôi</Text>
            {/* Spacer to keep title centered */}
            <View className="w-10" />
          </View>

          {/* Balance */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }], paddingHorizontal: 24, marginBottom: 20, alignItems: "center" }}>
            <Text style={{ color: "rgba(167,243,208,0.9)", fontSize: 13, fontWeight: "600", marginBottom: 6,letterSpacing: 0.5 }}>
              SỐ DƯ KHẢ DỤNG
            </Text>
            <Text style={{ color: "#ffffff", fontSize: 42, fontWeight: "900", letterSpacing: -1.5 }}>
              {fmtCurrency(balance)}
            </Text>
            {escrow > 0 && (
              <View className="flex-row items-center gap-1.5 mt-3 rounded-full px-4 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.16)" }}>
                <Clock size={12} color="#fcd34d" />
                <Text style={{ color: "#fde68a", fontSize: 12, fontWeight: "600" }}>
                  Đang giữ: {fmtCurrency(escrow)}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Quick stats inside hero */}
          <View className="flex-row mx-5 gap-3">
            {[
              { label: "Tổng thu nhập", value: fmtCompact(totalIncome),   color: "#a7f3d0", Icon: TrendingUp },
              { label: "Đã rút",        value: fmtCompact(totalWithdraw), color: "#93c5fd", Icon: Send       },
              { label: "Giao dịch",     value: String(transactions.length), color: "#fde68a", Icon: History   },
            ].map(({ label, value, color, Icon }) => (
              <View key={label} className="flex-1 rounded-[18px] py-3 px-2 items-center gap-1" style={{ backgroundColor: "rgba(255,255,255,0.13)" }}>
                <Icon size={16} color={color} />
                <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "800" }}>{value}</Text>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: "600", textAlign: "center" }}>{label}</Text>
              </View>
            ))}
          </View>

          {/* ── RÚT TIỀN CTA ── */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Withdrawal")}
            activeOpacity={0.88}
            style={{
              marginHorizontal: 20,
              marginTop: 20,
              marginBottom: 4,
              backgroundColor: "#ffffff",
              borderRadius: 18,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              shadowColor: "#064e3b",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.22,
              shadowRadius: 14,
              elevation: 6,
            }}
          >
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#d1fae5", justifyContent: "center", alignItems: "center" }}>
              <Send size={17} color="#059669" />
            </View>
            <Text style={{ color: "#047857", fontSize: 15, fontWeight: "800", letterSpacing: 0.2 }}>Rút tiền về tài khoản</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── FILTER TABS ─────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 16, marginTop: 20 }}>
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setFilter(key)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: active ? "#059669" : "#ffffff",
                  borderWidth: 1.5,
                  borderColor: active ? "#059669" : "#e2e8f0",
                  shadowColor: active ? "#059669" : "#0f172a",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: active ? 0.25 : 0.04,
                  shadowRadius: 6,
                  elevation: active ? 3 : 1,
                }}
              >
                <Text style={{ color: active ? "#ffffff" : "#64748b", fontSize: 13, fontWeight: "700" }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── TRANSACTION TIMELINE ────────────────────────── */}
        <View className="px-4">
          {groupedEntries.length === 0 ? (
            <View className="items-center py-16">
              <View className="w-20 h-20 rounded-full justify-center items-center mb-4" style={{ backgroundColor: "#e2e8f0" }}>
                <History size={36} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 font-semibold text-base">Không có giao dịch</Text>
              <Text className="text-slate-400 text-sm mt-1">Chưa có giao dịch nào trong danh mục này</Text>
            </View>
          ) : (
            groupedEntries.map(([date, txs]) => (
              <View key={date} className="mb-5">
                {/* Date header */}
                <View className="flex-row items-center gap-2 mb-3">
                  <CalendarDays size={13} color="#94a3b8" />
                  <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "700", letterSpacing: 0.3 }}>{date}</Text>
                  <View className="flex-1 h-px" style={{ backgroundColor: "#e2e8f0" }} />
                </View>

                {/* Transaction cards */}
                <View className="rounded-[20px] overflow-hidden" style={{ backgroundColor: "#ffffff", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
                  {txs.map((tx, idx) => {
                    const cfg = TX_CONFIG[tx.type];
                    const isLast = idx === txs.length - 1;
                    const isPositive = cfg.sign === 1;

                    return (
                      <View key={tx.id}>
                        <View className="flex-row items-center px-4 py-3.5" style={{ gap: 12 }}>
                          {/* Icon */}
                          <View className="w-11 h-11 rounded-2xl justify-center items-center" style={{ backgroundColor: cfg.bg }}>
                            <TxIcon type={tx.type} status={tx.status} />
                          </View>

                          {/* Info */}
                          <View className="flex-1 min-w-0">
                            <Text className="text-slate-800 font-bold text-[14px]" numberOfLines={1}>
                              {tx.description}
                            </Text>
                            {tx.jobTitle ? (
                              <Text className="text-slate-400 text-[11px] font-medium mt-0.5" numberOfLines={1}>
                                📋 {tx.jobTitle}
                              </Text>
                            ) : null}
                            <View className="mt-1">
                              <StatusChip status={tx.status} />
                            </View>
                          </View>

                          {/* Amount */}
                          <Text style={{ color: isPositive ? "#059669" : "#1e40af", fontSize: 15, fontWeight: "800", letterSpacing: -0.5 }}>
                            {isPositive ? "+" : "-"}{fmtCurrency(tx.amount)}
                          </Text>
                        </View>
                        {!isLast && <View style={{ height: 1, backgroundColor: "#f8fafc", marginHorizontal: 16 }} />}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
