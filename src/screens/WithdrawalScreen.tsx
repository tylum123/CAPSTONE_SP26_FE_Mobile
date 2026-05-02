/* AI CONTEXT:
 * Action: Processes requests to withdraw wallet funds to bank accounts.
 * Inputs: Withdrawal amount, linked banking details.
 * Outputs: Transaction creation API request.
 * Dependencies: Wallet service, Auth context. */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Modal, FlatList, Image, KeyboardAvoidingView, Platform, DeviceEventEmitter } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Info, Landmark, Wallet, ShieldCheck, Check, Search, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { walletService } from "../services/wallet.service";
import { useAuth } from "../context/AuthContext";
import { WalletDTO } from "../types/export_type_definitions";
import { handleError, handleSuccess } from "../utils/errorHandler";

function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function formatCurrency(val: string) {
  if (!val) return "";
  const numericValue = val.replace(/[^0-9]/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function WithdrawalScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // Form State
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [fetchingWallet, setFetchingWallet] = useState(true);
  const [wallet, setWallet] = useState<WalletDTO | null>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [searchBankQuery, setSearchBankQuery] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadWallet();
    fetchBanks();
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
        if (data.balance === 0 && data.escrowBalance === 0) {
          setWallet({ id: "demo-wallet", userId: "demo-user", balance: 1500000, lockedBalance: 0, escrowBalance: 750000, isActive: true });
        } else {
          setWallet(data);
        }
      }
    } catch (e) {
      console.error("Load wallet error, using mock data", e);
      setWallet({ id: "demo-wallet", userId: "demo-user", balance: 1500000, lockedBalance: 0, escrowBalance: 750000, isActive: true });
    } finally {
      setFetchingWallet(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.get("https://api.vietqr.io/v2/banks");
      if (res.data?.data) {
        setBanks(res.data.data);
      }
    } catch (err) {
      console.log("Fetch banks err", err);
    }
  };

  // Lookup is disabled because it's unreliable; users enter name manually
  /*
  useEffect(() => {
    if (!selectedBank || accountNumber.length < 6) {
      setAccountHolder("");
      return;
    }
    const timer = setTimeout(() => {
      lookupAccount();
    }, 800);
    return () => clearTimeout(timer);
  }, [accountNumber, selectedBank]);
  */


  const filteredBanks = useMemo(() => {
    if (!searchBankQuery) return banks;
    const lower = searchBankQuery.toLowerCase();
    return banks.filter(b => 
      b.shortName?.toLowerCase().includes(lower) || 
      b.name?.toLowerCase().includes(lower) ||
      b.code?.toLowerCase().includes(lower)
    );
  }, [banks, searchBankQuery]);

  const handleWithdraw = async () => {
    if (!amount || !selectedBank || !accountHolder || !accountNumber) {
      handleError(null, "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const withdrawAmount = parseInt(amount.replace(/[^0-9]/g, ""));
    if (isNaN(withdrawAmount) || withdrawAmount < 5000) {
      handleError(null, "Số tiền rút tối thiểu là 5.000₫");
      return;
    }

    if (wallet && withdrawAmount > wallet.balance) {
      handleError(null, "Số dư khả dụng không đủ");
      return;
    }

    if (user?.isDemo) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        handleSuccess("Yêu cầu rút tiền của bạn đã được gửi (Chế độ Demo)");
        navigation.goBack();
      }, 1500);
      return;
    }

    try {
      setLoading(true);
      await walletService.createWithdrawal({
        amount: withdrawAmount,
        toBin: parseInt(selectedBank.bin, 10),
        toAccountNumber: accountNumber,
        accountHolderName: accountHolder,
        description: `Rut tien AgroTemp ${Date.now().toString().slice(-4)}`
      });
      handleSuccess("Yêu cầu rút tiền đã được gửi và đang chờ xử lý.");
      DeviceEventEmitter.emit("REFRESH_DATA");
      navigation.goBack();
    } catch (error: any) {
      handleError(error, "Không thể thực hiện yêu cầu rút tiền.");
    } finally {
      setLoading(false);
    }
  };

  const setMaxAmount = () => {
    if (wallet?.balance) {
      setAmount(formatCurrency(wallet.balance.toString()));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View className="px-4 py-3 flex-row items-center bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 ml-3 text-lg font-bold text-slate-900">Rút tiền</Text>
      </View>

      <ScrollView 
        ref={scrollRef}
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Wallet Balance Hero */}
        <LinearGradient
          colors={["#059669", "#10b981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-5 mt-6 p-6 rounded-[24px] overflow-hidden shadow-xl"
        >
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center gap-2.5">
              <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center">
                <Wallet size={20} color="white" />
              </View>
              <Text className="text-white/80 font-bold tracking-tight">VÍ AGROTEMP</Text>
            </View>
            <ShieldCheck size={20} color="white" opacity={0.6} />
          </View>

          <Text className="text-white/70 text-xs font-bold uppercase mb-1">Số dư khả dụng</Text>
          <View className="flex-row items-baseline gap-1 mb-2">
            <Text className="text-white text-4xl font-extrabold">
              {wallet ? wallet.balance.toLocaleString("vi-VN") : "---"}
            </Text>
            <Text className="text-white/80 text-xl font-bold">₫</Text>
          </View>
        </LinearGradient>

        <View className="px-5 py-6">
          <Text className="text-[13px] text-slate-500 font-extrabold uppercase tracking-widest mb-3 ml-1">Tài khoản nhận tiền</Text>
          
          <Card variant="default" className="p-0 bg-white overflow-hidden border border-slate-100 rounded-[20px]">
            {/* Bank Selector */}
            <TouchableOpacity 
              onPress={() => setShowBankModal(true)}
              className="px-4 py-4 flex-row items-center border-b border-slate-100 bg-white"
            >
              <View className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center mr-3 overflow-hidden">
                {selectedBank ? (
                  <Image source={{ uri: selectedBank.logo }} className="w-9 h-9" resizeMode="contain" />
                ) : (
                  <Landmark size={20} color="#94a3b8" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-slate-400 font-bold uppercase mb-1">Ngân hàng</Text>
                <Text className={["text-[15px] font-bold", selectedBank ? "text-slate-900" : "text-slate-400"].join(" ")}>
                  {selectedBank ? selectedBank.name : "Chọn ngân hàng"}
                </Text>
              </View>
              <ChevronLeft size={20} color="#cbd5e1" style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>

            {/* Account Number */}
            <View className="px-4 py-4 flex-row items-center border-b border-slate-100 bg-white">
              <View className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 items-center justify-center mr-3">
                <Text className="text-indigo-600 font-extrabold text-[11px]">A/C</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-slate-400 font-bold uppercase mb-1">Số tài khoản</Text>
                <TextInput
                  placeholder="Nhập số tài khoản"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  className="text-slate-900 py-0 font-bold text-[16px]"
                />
              </View>
            </View>

            {/* Account Holder */}
            <View className="px-4 py-4 flex-row items-center bg-slate-50">
              <View className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 items-center justify-center mr-3">
                <Text className="text-amber-600 font-extrabold text-[11px]">TÊN</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-slate-400 font-bold uppercase mb-1">Tên chủ tài khoản</Text>
                <TextInput
                  placeholder="NHẬP TÊN CHỦ TÀI KHOẢN (KHÔNG DẤU)"
                  value={accountHolder}
                  onChangeText={(val) => setAccountHolder(removeAccents(val))}
                  className="text-slate-900 py-0 font-bold"
                  style={{ fontSize: 16 }}
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </Card>

          <View className="mt-8">
            <Text className="text-[13px] text-slate-500 font-extrabold uppercase tracking-widest mb-3 ml-1">Nhập số tiền</Text>
             <View className="flex-row items-center bg-white border border-slate-200 rounded-[20px] px-5 py-4 w-full shadow-sm">
                <Wallet size={24} color="#059669" />
                <TextInput
                  placeholder="0"
                  value={amount}
                  onChangeText={(val) => setAmount(formatCurrency(val))}
                  keyboardType="numeric"
                  className="flex-1 text-3xl font-extrabold ml-2 text-slate-900"
                  onFocus={() => {
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
                  }}
                />
                <Text className="text-2xl font-extrabold text-slate-300">₫</Text>
              </View>
              
              <TouchableOpacity onPress={setMaxAmount} className="self-start mt-4 px-4 py-2 bg-primary-50 rounded-full flex-row items-center gap-2 border border-primary-100">
                <Info size={14} color="#059669" />
                <Text className="text-[12px] text-primary-700 font-bold">Rút tối đa số dư</Text>
              </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View 
        className="px-5 pt-5 bg-white border-t border-slate-100" 
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <Button 
          onPress={handleWithdraw} 
          disabled={loading || fetchingWallet}
          className="bg-primary-600 h-14 rounded-2xl shadow-lg shadow-primary-500/30"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-[16px]">Xác nhận rút tiền</Text>
          )}
        </Button>
      </View>
      </KeyboardAvoidingView>

      {/* Bank Selection Modal */}
      <Modal visible={showBankModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowBankModal(false)}>
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
          <View className="px-4 py-3 flex-row items-center border-b border-slate-100">
            <TouchableOpacity onPress={() => setShowBankModal(false)} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
            <Text className="flex-1 ml-3 text-lg font-bold text-slate-900">Chọn ngân hàng</Text>
          </View>
          <View className="px-4 py-3 border-b border-slate-100">
            <View className="flex-row items-center bg-slate-50 px-4 rounded-xl border border-slate-200 h-10">
              <Search size={16} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 text-[15px] text-slate-800"
                placeholder="Tìm kiếm ngân hàng..."
                value={searchBankQuery}
                onChangeText={setSearchBankQuery}
              />
              {searchBankQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchBankQuery("")}><X size={16} color="#94a3b8" /></TouchableOpacity>
              )}
            </View>
          </View>
          <FlatList
            data={filteredBanks}
            keyExtractor={item => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => {
                  setSelectedBank(item);
                  setShowBankModal(false);
                }}
                className="flex-row items-center px-4 py-4 border-b border-slate-50"
              >
                <View className="w-12 h-12 bg-white border border-slate-100 rounded-lg p-1 mr-4">
                  <Image source={{ uri: item.logo }} className="w-full h-full" resizeMode="contain" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-slate-800">{item.shortName}</Text>
                  <Text className="text-[12px] text-slate-500 mt-0.5" numberOfLines={1}>{item.name}</Text>
                </View>
                {selectedBank?.id === item.id && <Check size={20} color="#059669" />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

export default WithdrawalScreen;
