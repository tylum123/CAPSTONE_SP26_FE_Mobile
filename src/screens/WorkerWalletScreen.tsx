import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  XCircle,
  CreditCard,
  Download,
  History,
  ChevronRight,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ListItem } from "../components/ui/ListItem";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Button } from "../components/ui/Button";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SHADOWS,
} from "../constants/theme";

type TransactionType = "income" | "withdraw" | "escrow" | "refund";
type TransactionStatus = "completed" | "pending" | "failed" | "processing";

interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: TransactionStatus;
  jobTitle?: string;
}

export function WorkerWalletScreen({ navigation }: any) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "vnpay" | "momo" | null
  >(null);

  const walletBalance = 1250000;
  const escrowBalance = 450000;

  const paymentMethods = [
    {
      id: "vnpay",
      name: "VNPay",
      logo: "https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png",
      connected: true,
    },
    {
      id: "momo",
      name: "MoMo",
      logo: "https://developers.momo.vn/v3/img/logo.png",
      connected: false,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 1,
      type: "income",
      amount: 250000,
      description: "Thu hoạch lúa",
      date: "20/01/2026",
      status: "completed",
      jobTitle: "Thu hoạch lúa - Nguyễn Văn A",
    },
    {
      id: 2,
      type: "escrow",
      amount: 200000,
      description: "Chăm sóc vườn cam",
      date: "19/01/2026",
      status: "pending",
      jobTitle: "Chăm sóc vườn cam - Trần Thị B",
    },
    {
      id: 3,
      type: "withdraw",
      amount: 500000,
      description: "Rút tiền về VNPay",
      date: "18/01/2026",
      status: "completed",
    },
    {
      id: 4,
      type: "income",
      amount: 180000,
      description: "Làm đất trồng rau",
      date: "17/01/2026",
      status: "completed",
      jobTitle: "Làm đất trồng rau - Phạm Thị D",
    },
    {
      id: 5,
      type: "escrow",
      amount: 250000,
      description: "Phun thuốc sâu",
      date: "16/01/2026",
      status: "processing",
      jobTitle: "Phun thuốc sâu - Lê Văn C",
    },
  ];

  const getTransactionIcon = (
    type: TransactionType,
    status: TransactionStatus,
  ) => {
    const size = 20;
    if (status === "failed") {
      return <XCircle size={size} color={COLORS.red[600]} />;
    }
    switch (type) {
      case "income":
        return <ArrowDownLeft size={size} color={COLORS.emerald[600]} />;
      case "withdraw":
        return <ArrowUpRight size={size} color={COLORS.blue[600]} />;
      case "escrow":
        return <Clock size={size} color={COLORS.amber[500]} />;
      case "refund":
        return <TrendingDown size={size} color={COLORS.slate[500]} />;
      default:
        return <Wallet size={size} color={COLORS.slate[500]} />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case "income":
        return COLORS.emerald[600];
      case "withdraw":
        return COLORS.blue[600];
      case "escrow":
        return COLORS.amber[500];
      default:
        return COLORS.slate[500];
    }
  };

  const getTransactionBg = (type: TransactionType) => {
    switch (type) {
      case "income":
        return COLORS.emerald[50];
      case "withdraw":
        return COLORS.blue[50];
      case "escrow":
        return COLORS.amber[50];
      default:
        return COLORS.slate[100];
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Hoàn thành</Badge>;
      case "pending":
        return <Badge variant="warning">Chờ xử lý</Badge>;
      case "processing":
        return <Badge variant="secondary">Đang xử lý</Badge>;
      case "failed":
        return <Badge variant="danger">Thất bại</Badge>;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── BALANCE CARD ── */}
        <View style={styles.balanceCard}>
          {/* Decorative bubbles */}
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />

          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
              <Text style={styles.balanceAmount}>
                {walletBalance.toLocaleString("vi-VN")}
                <Text style={styles.balanceCurrency}>₫</Text>
              </Text>
            </View>
            <View style={styles.walletIconContainer}>
              <Wallet size={28} color={COLORS.white} />
            </View>
          </View>

          {/* Escrow pill */}
          {escrowBalance > 0 && (
            <View style={styles.escrowPill}>
              <Clock size={13} color={COLORS.amber[300]} />
              <Text style={styles.escrowPillText}>
                Đang giữ: {escrowBalance.toLocaleString("vi-VN")}₫
              </Text>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Download size={20} color={COLORS.emerald[600]} />
              </View>
              <Text style={styles.actionText}>Rút tiền</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <History size={20} color={COLORS.emerald[600]} />
              </View>
              <Text style={styles.actionText}>Lịch sử</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <CreditCard size={20} color={COLORS.emerald[600]} />
              </View>
              <Text style={styles.actionText}>Liên kết</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── PAYMENT METHODS ── */}
        <View style={styles.section}>
          <SectionHeader title="Phương thức thanh toán" />
          <Card variant="elevated">
            {paymentMethods.map((method, index) => (
              <ListItem
                key={method.id}
                title={method.name}
                subtitle={method.connected ? "✓ Đã kết nối" : "Chưa kết nối"}
                leftSlot={
                  <View style={styles.paymentLogo}>
                    <Image
                      source={{ uri: method.logo }}
                      style={styles.paymentLogoImg}
                      resizeMode="contain"
                    />
                  </View>
                }
                rightSlot={
                  method.connected ? (
                    <ChevronRight size={18} color={COLORS.slate[300]} />
                  ) : (
                    <Button variant="outline" size="sm">
                      Kết nối
                    </Button>
                  )
                }
                onPress={() => {
                  if (method.connected)
                    setSelectedPaymentMethod(method.id as any);
                }}
                style={
                  index < paymentMethods.length - 1
                    ? styles.listDivider
                    : undefined
                }
              />
            ))}
          </Card>
        </View>

        {/* ── TRANSACTIONS ── */}
        <View style={styles.section}>
          <SectionHeader title="Giao dịch gần đây" actionLabel="Xem tất cả" />
          <Card variant="elevated">
            {transactions.map((tx, index) => (
              <ListItem
                key={tx.id}
                title={tx.description}
                subtitle={tx.jobTitle || tx.date}
                leftSlot={
                  <View
                    style={[
                      styles.txIcon,
                      { backgroundColor: getTransactionBg(tx.type) },
                    ]}
                  >
                    {getTransactionIcon(tx.type, tx.status)}
                  </View>
                }
                rightSlot={
                  <View style={styles.txRight}>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: getTransactionColor(tx.type) },
                      ]}
                    >
                      {tx.type === "withdraw" ? "-" : "+"}
                      {tx.amount.toLocaleString("vi-VN")}₫
                    </Text>
                    {getStatusBadge(tx.status)}
                  </View>
                }
                style={
                  index < transactions.length - 1
                    ? styles.listDivider
                    : undefined
                }
              />
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.sage[50],
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  /* ── BALANCE CARD ── */
  balanceCard: {
    backgroundColor: COLORS.emerald[600],
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl + SPACING.md,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
    overflow: "hidden",
    position: "relative",
    ...SHADOWS.emerald,
    marginBottom: SPACING.lg,
  },
  bubble1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -80,
    right: -70,
  },
  bubble2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(16,185,129,0.35)",
    bottom: 30,
    left: -30,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    color: COLORS.emerald[200],
    fontSize: 13,
    fontWeight: "500",
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
  },
  balanceCurrency: {
    fontSize: 22,
    fontWeight: "600",
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  escrowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignSelf: "flex-start",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: SPACING.md,
  },
  escrowPillText: {
    color: COLORS.amber[200],
    fontSize: 12,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm + 4,
    alignItems: "center",
    gap: 6,
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.emerald[50],
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.slate[700],
  },

  /* ── SECTION ── */
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },

  /* ── PAYMENT ── */
  paymentLogo: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.slate[50],
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  paymentLogoImg: {
    width: 32,
    height: 32,
  },

  /* ── LIST DIVIDER ── */
  listDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[50],
  },

  /* ── TRANSACTIONS ── */
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  txRight: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
});
