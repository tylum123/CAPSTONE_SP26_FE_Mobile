/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Final Fix: Implements Smart-Match (ID lookup by Name) and key-based initialScrollIndex for rock-solid stability.
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, TextInput, Keyboard, ScrollView } from "react-native";
import { MapPin, X, ChevronLeft, ChevronRight, Check, Send } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { locationService, nominatimService } from "../../services/export_services";
import { COLORS } from "../../constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: {
    provinceId: number;
    provinceName: string;
    districtId: number;
    districtName: string;
    ward: string;
    street: string;
  }) => void;
  initialValues?: {
    provinceId?: number | null;
    districtId?: number | null;
    provinceName?: string;
    districtName?: string;
    ward?: string;
    street?: string;
  };
}

export function LocationPicker({ visible, onClose, onSelect, initialValues }: LocationPickerProps) {
  const [step, setStep] = useState<"province" | "district" | "ward" | "street">("province");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [province, setProvince] = useState({ id: initialValues?.provinceId || 0, name: initialValues?.provinceName || "" });
  const [district, setDistrict] = useState({ id: initialValues?.districtId || 0, name: initialValues?.districtName || "" });
  const [ward, setWard] = useState(initialValues?.ward || "");
  const [street, setStreet] = useState(initialValues?.street || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const streetInputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  // SMARTER INITIALIZATION: Find ID by Name if missing
  useEffect(() => {
    if (visible) {
      setProvince({ id: initialValues?.provinceId || 0, name: initialValues?.provinceName || "" });
      setDistrict({ id: initialValues?.districtId || 0, name: initialValues?.districtName || "" });
      setWard(initialValues?.ward || "");
      setStreet(initialValues?.street || "");
      setSuggestions([]);
      loadProvinces(); 
    }
  }, [visible]);

  // Loading functions with Smart-Match
  const loadProvinces = async () => {
    setLoading(true);
    try {
      const res = await locationService.getProvinces();
      const mapped = res.map((p: any) => ({ id: p.code, name: p.name }));
      setData(mapped);
      
      // AUTO-MATCH PROVINCE ID IF MISSING
      if ((initialValues?.provinceId === 0 || !initialValues?.provinceId) && initialValues?.provinceName) {
          const found = mapped.find((p: any) => p.name.includes(initialValues.provinceName!));
          if (found) setProvince(found);
      }
      setStep("province");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (provId: number, distName?: string) => {
      setLoading(true);
      try {
          const districts = await locationService.getDistricts(provId);
          const mapped = districts.map((d: any) => ({ id: d.code, name: d.name }));
          setData(mapped);
          
          // AUTO-MATCH DISTRICT ID IF MISSING
          if (distName) {
              const found = mapped.find((d: any) => d.name.includes(distName));
              if (found) setDistrict(found);
          }
          setStep("district");
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadWards = async (distId: number) => {
      setLoading(true);
      try {
          const wards = await locationService.getWards(distId);
          setData(wards.map((w: any) => ({ id: w.code, name: w.name })));
          setStep("ward");
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // Step transitions
  const handleSelect = useCallback(async (item: any) => {
    if (step === "province") {
      setProvince(item);
      await loadDistricts(item.id);
    } else if (step === "district") {
      setDistrict(item);
      await loadWards(item.id);
    } else if (step === "ward") {
      setWard(item.name);
      setStep("street");
      setTimeout(() => streetInputRef.current?.focus(), 200);
    }
  }, [step]);

  const jumpToStep = useCallback(async (target: typeof step) => {
    if (target === step) return;
    if (target === "province") await loadProvinces();
    else if (target === "district" && province.id) await loadDistricts(province.id, district.name);
    else if (target === "ward" && district.id) await loadWards(district.id);
    else if (target === "street") setStep("street");
  }, [step, province, district]);

  const handleConfirm = () => {
    if (!province.name || !district.name || !ward) return;
    onSelect({
      provinceId: Number(province.id),
      provinceName: province.name,
      districtId: Number(district.id),
      districtName: district.name,
      ward: ward,
      street: street
    });
    onClose();
  };

  // CALCULATE INITIAL INDEX FOR AUTO-SCROLL (Stable with key={step})
  const initialIndex = useMemo(() => {
    if (!data.length || step === "street") return -1;
    let selectedId: any = 0;
    if (step === "province") selectedId = province.id;
    else if (step === "district") selectedId = district.id;
    else if (step === "ward") {
      const found = data.find(w => w.name === ward);
      selectedId = found ? found.id : 0;
    }
    if (!selectedId) return -1;
    const idx = data.findIndex(item => String(item.id) === String(selectedId));
    return idx >= 0 ? idx : -1;
  }, [data, step, province.id, district.id, ward]);

  // Optimized Layout calculation for FlatList
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: 60,
    offset: 60 * index,
    index,
  }), []);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View className="flex-1 bg-black/40">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ justifyContent: "flex-end", flex: 1 }}
        >
          <View 
            style={{ maxHeight: SCREEN_HEIGHT * 0.85, paddingBottom: 0 }} 
            className="bg-white rounded-t-[32px] shadow-2xl overflow-hidden"
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </View>

            {/* Header & Breadcrumbs */}
            <View className="px-6 pt-2 pb-4 border-b border-slate-50">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  {step !== "province" && (
                    <TouchableOpacity 
                      onPress={() => jumpToStep(step === "district" ? "province" : step === "ward" ? "district" : "ward")} 
                      className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <ChevronLeft size={20} color={COLORS.slate[600]} />
                    </TouchableOpacity>
                  )}
                  <Text className="text-lg font-extrabold text-slate-900">
                    {step === "province" ? "Chọn Tỉnh / Thành" : 
                     step === "district" ? "Chọn Quận / Huyện" : 
                     step === "ward" ? "Chọn Phường / Xã" : "Nhập số nhà, tên đường"}
                  </Text>
                </View>
                <TouchableOpacity 
                    onPress={onClose} 
                    className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <X size={20} color={COLORS.slate[500]} />
                </TouchableOpacity>
              </View>

              {/* Enhanced Breadcrumb Path */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingVertical: 6 }}>
                <TouchableOpacity onPress={() => jumpToStep("province")} activeOpacity={0.7} style={{ paddingHorizontal: 4 }}>
                  <Text className={["text-[11px] font-bold", step === "province" ? "text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-lg" : "text-slate-500"].join(" ")}>
                    {province.name || "Tỉnh / Thành"}
                  </Text>
                </TouchableOpacity>
                <ChevronRight size={10} color={COLORS.slate[300]} style={{ marginHorizontal: 4 }} />
                
                <TouchableOpacity onPress={() => jumpToStep("district")} disabled={!province.id} activeOpacity={0.7} style={{ paddingHorizontal: 4 }}>
                  <Text className={["text-[11px] font-bold", step === "district" ? "text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-lg" : "text-slate-500"].join(" ")}>
                    {district.name || "Quận / Huyện"}
                  </Text>
                </TouchableOpacity>
                <ChevronRight size={10} color={COLORS.slate[300]} style={{ marginHorizontal: 4 }} />

                <TouchableOpacity onPress={() => jumpToStep("ward")} disabled={!district.id} activeOpacity={0.7} style={{ paddingHorizontal: 4 }}>
                  <Text className={["text-[11px] font-bold", step === "ward" ? "text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-lg" : "text-slate-500"].join(" ")}>
                    {ward || "Phường / Xã"}
                  </Text>
                </TouchableOpacity>
                <ChevronRight size={10} color={COLORS.slate[300]} style={{ marginHorizontal: 4 }} />

                <TouchableOpacity onPress={() => setStep("street")} disabled={!ward} activeOpacity={0.7} style={{ paddingHorizontal: 4 }}>
                  <Text className={["text-[11px] font-bold", step === "street" ? "text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-lg" : "text-slate-500"].join(" ")}>
                    Số nhà
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {loading ? (
              <View className="py-24 justify-center items-center">
                <ActivityIndicator size="large" color={COLORS.primary[600]} />
                <Text className="mt-4 text-slate-400 font-medium">Đang tìm ID thông minh...</Text>
              </View>
            ) : step === "street" ? (
              <ScrollView className="px-6 py-6" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 60 }}>
                <View className="flex-row items-center justify-between mb-5">
                  <Text className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">Địa chỉ chi tiết</Text>
                  <View className="w-7 h-7 rounded-full bg-primary-50 items-center justify-center"><Check size={16} color={COLORS.primary[600]} /></View>
                </View>
                <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-primary-500 min-h-[64px] gap-3">
                  <MapPin size={24} color={COLORS.primary[500]} />
                  <TextInput
                    ref={streetInputRef}
                    className="flex-1 text-[17px] text-slate-900 py-3 font-bold"
                    value={street} onChangeText={setStreet}
                    placeholder="Số nhà, tên đường" placeholderTextColor={COLORS.slate[400]}
                  />
                  {isSearching && <ActivityIndicator size="small" color={COLORS.primary[600]} />}
                </View>
                
                <TouchableOpacity
                  className={["mt-10 h-16 rounded-2xl flex-row items-center justify-center gap-3 shadow-xl", street.length >= 1 ? "bg-primary-600 shadow-primary-500/30" : "bg-slate-200"].join(" ")}
                  onPress={handleConfirm} disabled={street.length < 1}
                >
                  <Text className={["font-extrabold text-lg", street.length >= 1 ? "text-white" : "text-slate-400"].join(" ")}>Xác nhận</Text>
                  <Send size={20} color={street.length >= 1 ? "white" : COLORS.slate[400]} />
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <FlatList
                key={step} // FORCE RELOAD FOR STABILITY
                data={data}
                keyExtractor={item => String(item.id)}
                initialScrollIndex={initialIndex >= 0 ? initialIndex : undefined}
                getItemLayout={getItemLayout}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = 
                    (step === "province" && String(province.id) === String(item.id)) || 
                    (step === "district" && String(district.id) === String(item.id)) ||
                    (step === "ward" && ward === item.name);
                  
                  return (
                    <TouchableOpacity 
                      style={{ height: 52 }} activeOpacity={0.7}
                      className={["flex-row items-center justify-between px-5 mb-2 rounded-2xl border", isSelected ? "bg-primary-50 border-primary-200" : "bg-white border-slate-100"].join(" ")}
                      onPress={() => handleSelect(item)}
                    >
                      <Text className={["font-extrabold text-[15px]", isSelected ? "text-primary-700" : "text-slate-700"].join(" ")}>{item.name}</Text>
                      {isSelected ? <Check size={18} color={COLORS.primary[600]} /> : <ChevronRight size={14} color={COLORS.slate[300]} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
