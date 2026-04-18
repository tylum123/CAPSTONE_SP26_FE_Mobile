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
  Modal,
  Dimensions,
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
import { walletService } from "../services/wallet.service";
import { useAuth } from "../context/AuthContext";
import { WalletTransactionType, WalletTransactionTypeLabels } from "../constants/enums";
import { WalletTransactionDTO } from "../types/export_type_definitions";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Types ──────────────────────────────────────────────────────────────────

type TxType = "income" | "withdraw" | "escrow" | "refund" | "lock";
type TxStatus = "completed" | "pending" | "failed" | "processing";

interface Transaction {
  id: string; // Real IDs are strings
  type: TxType;
  amount: number;
  description: string;
  date: string;
  status: TxStatus;
  jobTitle?: string;
  createdAt?: string; // Original timestamp
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

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Detail Modal
  const [selectedTx, setSelectedTx] = useState<WalletTransactionDTO | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animate hero balance
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(balanceAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim,    { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const fetchData = useCallback(async (isInitial = true) => {
    if (isInitial) {
        setLoading(true);
        setPage(1);
        setHasMore(true);
    } else {
        setIsFetchingMore(true);
    }

    try {
      const wallet = await walletService.getWallet();
      if (isInitial) {
        setBalance(wallet.balance);
        setEscrow(wallet.escrowBalance || 0);
      }

      const currentPage = isInitial ? 1 : page + 1;
      const res = await walletService.getTransactions(wallet.id, currentPage, 10);
    

      // Highly robust extraction: handle response.data, response.data.data, or direct array
      let txList: any[] = [];
      if (Array.isArray(res)) {
        txList = res;
      } else if (res && Array.isArray((res as any).data)) {
        txList = (res as any).data;
      } else if (res && (res as any).data && Array.isArray((res as any).data.data)) {
        txList = (res as any).data.data;
      }
      
      const mappedTxs = txList.map((tx: any) => ({
        id: tx.id || String(Math.random()),
        type: mapBackendTxType(tx.type as WalletTransactionType),
        amount: tx.amount || 0,
        description: tx.description || WalletTransactionTypeLabels[tx.type as WalletTransactionType] || "Giao dịch ví",
        date: new Date(tx.createdAt || Date.now()).toLocaleDateString("vi-VN"),
        createdAt: tx.createdAt || new Date().toISOString(),
        status: (tx.status?.toLowerCase() as TxStatus) || "completed",
        jobTitle: tx.jobPostTitle || tx.jobPost?.title || null,
      }));

      if (isInitial) {
        setTransactions(mappedTxs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        animateIn();
      } else {
        setTransactions(prev => [...prev, ...mappedTxs].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }

      // Using actual pagination metadata
      if (res && (res as any).pagination) {
        const p = (res as any).pagination;
        setHasMore(p.page < p.totalPages);
      } else {
        setHasMore(txList.length >= 10);
      }
      
      if (!isInitial) setPage(currentPage);

    } catch (err) {
      console.log("[WorkerWalletScreen] Fetch error:", err);
      if (isInitial) {
        setBalance(0);
        setTransactions([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFetchingMore(false);
    }
  }, [page]);

  const fetchDetail = async (id: string) => {
    try {
      setIsDetailLoading(true);
      setIsModalVisible(true);
      const detail = await walletService.getTransactionDetail(id);
      setSelectedTx(detail);
    } catch (error) {
      console.log("[fetchDetail] error", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

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
  
  // Sort grouped entries by date descending
  const groupedEntries = Object.entries(grouped).sort((a, b) => {
    const dateA = new Date(a[1][0].createdAt || 0).getTime();
    const dateB = new Date(b[1][0].createdAt || 0).getTime();
    return dateB - dateA;
  });

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
              <Text className="text-slate-400 text-sm mt-1">Hệ thống chưa ghi nhận giao dịch nào</Text>
            </View>
          ) : (
            <>
              {groupedEntries.map(([date, txs]) => (
                <View key={date} className="mb-5">
                  <View className="flex-row items-center gap-2 mb-3">
                    <CalendarDays size={13} color="#94a3b8" />
                    <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "700", letterSpacing: 0.3 }}>{date}</Text>
                    <View className="flex-1 h-px" style={{ backgroundColor: "#e2e8f0" }} />
                  </View>

                  <View className="rounded-[20px] overflow-hidden" style={{ backgroundColor: "#ffffff", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
                    {txs.map((tx, idx) => {
                      const cfg = TX_CONFIG[tx.type];
                      const isLast = idx === txs.length - 1;
                      const isPositive = cfg.sign === 1;

                      return (
                        <TouchableOpacity key={tx.id} activeOpacity={0.7} onPress={() => fetchDetail(tx.id)}>
                          <View className="flex-row items-center px-4 py-3.5" style={{ gap: 12 }}>
                            <View className="w-11 h-11 rounded-2xl justify-center items-center" style={{ backgroundColor: cfg.bg }}>
                              <TxIcon type={tx.type} status={tx.status} />
                            </View>

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

                            <Text style={{ color: isPositive ? "#059669" : "#1e40af", fontSize: 15, fontWeight: "800", letterSpacing: -0.5 }}>
                              {isPositive ? "+" : "-"}{fmtCurrency(tx.amount)}
                            </Text>
                          </View>
                          {!isLast && <View style={{ height: 1, backgroundColor: "#f8fafc", marginHorizontal: 16 }} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
              
              {hasMore && (
                <TouchableOpacity 
                   className="py-4 items-center justify-center bg-white rounded-2xl border border-slate-100 mt-2 mb-6"
                   onPress={() => fetchData(false)}
                   disabled={isFetchingMore}
                >
                  {isFetchingMore ? <ActivityIndicator size="small" color="#059669" /> : <Text className="text-primary-600 font-bold">Xem thêm giao dịch</Text>}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* TRANSACTION DETAIL MODAL */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View 
            className="bg-white rounded-t-[32px] px-6 pt-5 pb-10" 
            style={{ minHeight: SCREEN_HEIGHT * 0.5 }}
          >
            {/* Grabber */}
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-slate-900 text-xl font-black">Chi tiết giao dịch</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} className="w-9 h-9 bg-slate-100 rounded-full items-center justify-center">
                <XCircle size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {isDetailLoading ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-slate-400 mt-4 font-medium">Đang tải chi tiết...</Text>
              </View>
            ) : selectedTx ? (
              <View>
                {/* Hero Info */}
                <View className="items-center mb-8">
                  <View 
                    className="w-20 h-20 rounded-3xl items-center justify-center mb-4" 
                    style={{ backgroundColor: TX_CONFIG[mapBackendTxType(selectedTx.type as WalletTransactionType)].bg }}
                  >
                    <TxIcon type={mapBackendTxType(selectedTx.type as WalletTransactionType)} status={(selectedTx.status?.toLowerCase() as TxStatus) || "completed"} />
                  </View>
                  <Text className="text-slate-900 text-2xl font-black">
                    {TX_CONFIG[mapBackendTxType(selectedTx.type as WalletTransactionType)].sign === 1 ? "+" : "-"}
                    {fmtCurrency(selectedTx.amount)}
                  </Text>
                  <Text className="text-slate-400 font-semibold mt-1 uppercase tracking-widest text-[10px]">
                    {WalletTransactionTypeLabels[selectedTx.type as WalletTransactionType]}
                  </Text>
                </View>

                {/* Info List */}
                <View className="bg-slate-50 rounded-3xl p-5 gap-y-4">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 font-medium">Mã giao dịch</Text>
                    <Text className="text-slate-800 font-bold text-right flex-1 ml-4" numberOfLines={1}>{selectedTx.id}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 font-medium">Trạng thái</Text>
                    <StatusChip status={(selectedTx.status?.toLowerCase() as TxStatus) || "completed"} />
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 font-medium">Thời gian</Text>
                    <Text className="text-slate-800 font-bold">{new Date(selectedTx.createdAt).toLocaleString("vi-VN")}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 font-medium">Nội dung</Text>
                    <Text className="text-slate-800 font-bold text-right flex-1 ml-4">{selectedTx.description}</Text>
                  </View>
                  {selectedTx.jobPostTitle && (
                    <View className="flex-row justify-between border-t border-slate-200 pt-4 mt-2">
                      <Text className="text-slate-400 font-medium">Công việc</Text>
                      <Text className="text-slate-800 font-bold text-right flex-1 ml-4">{selectedTx.jobPostTitle}</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
