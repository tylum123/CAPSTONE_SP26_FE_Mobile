import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Info, Landmark, DollarSign, Wallet, ShieldCheck, Clock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { walletService } from "../services/wallet.service";
import { useAuth } from "../context/AuthContext";
import { WalletDTO } from "../types";

export function WithdrawalScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingWallet, setFetchingWallet] = useState(true);
  const [wallet, setWallet] = useState<WalletDTO | null>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setFetchingWallet(true);
      if (user?.isDemo) {
        setWallet({
          id: "demo-wallet",
          userId: "demo-user",
          balance: 1500000,
          lockedBalance: 0,
          escrowBalance: 750000,
          isActive: true
        });
      } else {
        const data = await walletService.getWallet();
        setWallet(data);
      }
    } catch (e) {
      console.error("Load wallet error", e);
    } finally {
      setFetchingWallet(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !bankName || !accountHolder || !accountNumber) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const withdrawAmount = parseInt(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 5000) {
      Alert.alert("Lỗi", "Số tiền rút tối thiểu là 5.000₫");
      return;
    }

    if (wallet && withdrawAmount > wallet.balance) {
      Alert.alert("Lỗi", "Số dư khả dụng không đủ");
      return;
    }

    if (user?.isDemo) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        Alert.alert("Thành công", "Yêu cầu rút tiền của bạn đã được gửi (Chế độ Demo)", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      }, 1500);
      return;
    }

    try {
      setLoading(true);
      await walletService.createWithdrawal({
        amount: withdrawAmount,
        bankName,
        accountHolderName: accountHolder,
        bankAccountNumber: accountNumber,
      });
      Alert.alert("Thành công", "Yêu cầu rút tiền đã được gửi và đang chờ xử lý.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.response?.data?.message || "Không thể thực hiện yêu cầu rút tiền.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <View className="px-4 py-2 flex-row items-center bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold mr-8 text-slate-900">Rút tiền</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Glassmorphic Wallet Header */}
        <LinearGradient
          colors={["#059669", "#10b981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-4 mt-6 p-6 rounded-[32px] overflow-hidden shadow-xl"
        >
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-2.5">
              <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center">
                <Wallet size={20} color="white" />
              </View>
              <Text className="text-white/80 font-bold tracking-tight">VÍ AGROTEMP</Text>
            </View>
            <ShieldCheck size={20} color="white" opacity={0.6} />
          </View>

          <Text className="text-white/70 text-xs font-bold uppercase mb-1">Số dư khả dụng</Text>
          <View className="flex-row items-baseline gap-1 mb-6">
            <Text className="text-white text-4xl font-extrabold">
              {wallet ? wallet.balance.toLocaleString("vi-VN") : "---"}
            </Text>
            <Text className="text-white/80 text-xl font-bold">₫</Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/10">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Clock size={12} color="white" opacity={0.7} />
                <Text className="text-white/60 text-[10px] font-bold uppercase">Đang treo (Escrow)</Text>
              </View>
              <Text className="text-white text-sm font-extrabold">
                {wallet ? `${wallet.escrowBalance?.toLocaleString("vi-VN")}₫` : "---"}
              </Text>
            </View>
            <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/10">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Landmark size={12} color="white" opacity={0.7} />
                <Text className="text-white/60 text-[10px] font-bold uppercase">Tổng thu nhập</Text>
              </View>
              <Text className="text-white text-sm font-extrabold">
                {wallet ? `${(wallet.balance + (wallet.escrowBalance || 0)).toLocaleString("vi-VN")}₫` : "---"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-4 py-6">
          <Text className="text-slate-400 text-xs mb-3 uppercase font-extrabold tracking-widest pl-1">Ngân hàng nhận tiền</Text>
          <Card variant="elevated" className="p-4 bg-white">
            <View className="flex-row items-center gap-4 mb-5">
              <View className="w-11 h-11 rounded-2xl bg-primary-50 items-center justify-center">
                <Landmark size={20} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Tên Ngân hàng</Text>
                <TextInput
                  placeholder="VD: Vietcombank, MB Bank..."
                  value={bankName}
                  onChangeText={setBankName}
                  className="text-slate-900 py-1 font-bold text-base"
                />
              </View>
            </View>

            <View className="flex-row items-center gap-4 mb-5">
              <View className="w-11 h-11 rounded-2xl bg-indigo-50 items-center justify-center">
                <Text className="text-indigo-600 font-extrabold text-[10px]">A/C</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Số tài khoản</Text>
                <TextInput
                  placeholder="Nhập số tài khoản"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  className="text-slate-900 py-1 font-bold text-base"
                />
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="w-11 h-11 rounded-2xl bg-amber-50 items-center justify-center">
                <Text className="text-amber-600 font-extrabold text-[10px]">TH</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Tên chủ tài khoản</Text>
                <TextInput
                  placeholder="VIET CHU HOA KHONG DAU"
                  value={accountHolder}
                  onChangeText={v => setAccountHolder(v.toUpperCase())}
                  className="text-slate-900 py-1 font-bold text-base"
                />
              </View>
            </View>
          </Card>

          <View className="mt-6">
            <Text className="text-slate-400 text-xs mb-3 uppercase font-extrabold tracking-widest pl-1">Nhập số tiền</Text>
            <Card variant="elevated" className="p-6 items-center bg-white">
              <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-[24px] px-5 py-4 w-full">
                <DollarSign size={24} color="#059669" />
                <TextInput
                  placeholder="0"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  className="flex-1 text-3xl font-extrabold ml-2 text-slate-900"
                />
                <Text className="text-2xl font-extrabold text-slate-300">₫</Text>
              </View>
              <View className="flex-row items-center gap-2 mt-4 bg-primary-50/50 px-4 py-2 rounded-full">
                <Info size={14} color="#059669" />
                <Text className="text-[11px] text-primary-700 font-bold">Rút toàn bộ số dư khả dụng</Text>
              </View>
            </Card>
          </View>

          <View className="mt-6 bg-amber-50/50 p-4 rounded-3xl flex-row gap-3 border border-amber-100/50">
            <Info size={18} color="#d97706" />
            <Text className="flex-1 text-amber-900/60 text-xs leading-5">
              Để đảm bảo an toàn, AgroTemp sẽ xác minh giao dịch trong 3 ngày làm việc. Vui lòng kiểm tra kỹ thông tin ngân hàng.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-slate-100">
        <Button 
          onPress={handleWithdraw} 
          disabled={loading || fetchingWallet}
          className="bg-primary-600 h-16 rounded-[24px] shadow-lg shadow-primary-500/30"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-lg">Yêu cầu rút tiền ngay</Text>
          )}
        </Button>
      </View>
    </SafeAreaView>
  );
}
