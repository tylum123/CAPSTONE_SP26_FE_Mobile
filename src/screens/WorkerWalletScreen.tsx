import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Download,
  History,
  DollarSign,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";

const { width } = Dimensions.get("window");

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
  const escrowBalance = 450000; // Tiền đang giữ

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
        return <Clock size={size} color={COLORS.amber[600]} />;
      case "refund":
        return <TrendingDown size={size} color={COLORS.gray[600]} />;
      default:
        return <Wallet size={size} color={COLORS.gray[600]} />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case "income":
        return COLORS.emerald[600];
      case "withdraw":
        return COLORS.blue[600];
      case "escrow":
        return COLORS.amber[600];
      default:
        return COLORS.gray[600];
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
      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
        >
          {/* Balance Card with Gradient */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View>
                <Text style={styles.balanceLabel}>Tổng số dư</Text>
                <Text style={styles.balanceAmount}>
                  {walletBalance.toLocaleString("vi-VN")}₫
                </Text>
              </View>
              <View style={styles.walletIconContainer}>
                <Wallet size={32} color={COLORS.white} />
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.actionIconContainer}>
                  <Download size={22} color={COLORS.emerald[600]} />
                </View>
                <Text style={styles.actionText}>Rút tiền</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.actionIconContainer}>
                  <History size={22} color={COLORS.emerald[600]} />
                </View>
                <Text style={styles.actionText}>Lịch sử</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.actionIconContainer}>
                  <CreditCard size={22} color={COLORS.emerald[600]} />
                </View>
                <Text style={styles.actionText}>Liên kết</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  !method.connected && styles.paymentMethodDisabled,
                ]}
                onPress={() => {
                  if (method.connected) {
                    setSelectedPaymentMethod(method.id as any);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.paymentLogoContainer}>
                  <Image
                    source={{ uri: method.logo }}
                    style={styles.paymentLogo}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  {method.connected ? (
                    <View style={styles.connectedRow}>
                      <CheckCircle2 size={14} color={COLORS.emerald[600]} />
                      <Text style={styles.connectedText}>Đã kết nối</Text>
                    </View>
                  ) : (
                    <Text style={styles.notConnectedText}>Chưa kết nối</Text>
                  )}
                </View>
                {!method.connected && (
                  <Button variant="outline" size="sm">
                    Kết nối
                  </Button>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Escrow Info */}
          {escrowBalance > 0 && (
            <View style={styles.escrowCard}>
              <View style={styles.escrowIconContainer}>
                <Clock size={24} color={COLORS.amber[600]} />
              </View>
              <View style={styles.escrowInfo}>
                <Text style={styles.escrowTitle}>Hệ thống Escrow</Text>
                <Text style={styles.escrowDescription}>
                  Tiền sẽ được giữ an toàn cho đến khi bạn hoàn thành công việc
                </Text>
              </View>
            </View>
          )}

          {/* Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>

            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transaction}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor: `${getTransactionColor(transaction.type)}15`,
                      },
                    ]}
                  >
                    {getTransactionIcon(transaction.type, transaction.status)}
                  </View>

                  <View style={styles.transactionContent}>
                    <View style={styles.transactionHeader}>
                      <Text style={styles.transactionTitle}>
                        {transaction.description}
                      </Text>
                      <Text
                        style={[
                          styles.transactionAmount,
                          {
                            color: getTransactionColor(transaction.type),
                          },
                        ]}
                      >
                        {transaction.type === "withdraw" ? "-" : "+"}
                        {transaction.amount.toLocaleString("vi-VN")}₫
                      </Text>
                    </View>

                    <View style={styles.transactionFooter}>
                      {transaction.jobTitle && (
                        <Text
                          style={styles.transactionSubtitle}
                          numberOfLines={1}
                        >
                          {transaction.jobTitle}
                        </Text>
                      )}
                      <View style={styles.transactionMeta}>
                        <Text style={styles.transactionDate}>
                          {transaction.date}
                        </Text>
                        {getStatusBadge(transaction.status)}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  balanceCard: {
    backgroundColor: COLORS.emerald[600],
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    elevation: 8,
    shadowColor: COLORS.emerald[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.emerald[100],
    marginBottom: SPACING.xs,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.emerald[100],
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: SPACING.md,
  },
  quickActions: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    alignItems: "center",
    gap: SPACING.xs,
    elevation: 2,
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.emerald[50],
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  paymentMethodDisabled: {
    opacity: 0.6,
  },
  paymentLogoContainer: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.gray[50],
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xs,
  },
  paymentLogo: {
    width: 48,
    height: 48,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  connectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  connectedText: {
    fontSize: 13,
    color: COLORS.emerald[600],
    fontWeight: "500",
  },
  notConnectedText: {
    fontSize: 13,
    color: COLORS.gray[500],
  },
  escrowCard: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.amber[50],
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.amber[600],
  },
  escrowIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.amber[100],
    justifyContent: "center",
    alignItems: "center",
  },
  escrowInfo: {
    flex: 1,
  },
  escrowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.amber[600],
    marginBottom: SPACING.xs,
  },
  escrowDescription: {
    fontSize: 13,
    color: COLORS.amber[600],
    lineHeight: 18,
  },
  transactionsList: {
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  transaction: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  transactionIcon: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.gray[900],
    flex: 1,
    marginRight: SPACING.sm,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionFooter: {
    gap: SPACING.xs,
  },
  transactionSubtitle: {
    fontSize: 13,
    color: COLORS.gray[600],
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
});
