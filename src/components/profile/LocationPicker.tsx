/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import React, { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
    if (visible) {
      // RESET ALL INTERNAL STATES WHEN MODAL OPENS
      const initProv = { 
        id: initialValues?.provinceId || 0, 
        name: initialValues?.provinceName || "" 
      };
      const initDist = { 
        id: initialValues?.districtId || 0, 
        name: initialValues?.districtName || "" 
      };
      
      setProvince(initProv);
      setDistrict(initDist);
      setWard(initialValues?.ward || "");
      setStreet(initialValues?.street || "");
      setSuggestions([]);

      if (initProv.id && initDist.id && initialValues?.ward) {
          setStep("street");
          setData([]);
      } else {
          loadProvinces();
      }
    }
  }, [visible, initialValues]);

  // Handle address autocomplete
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (street.length >= 3 && step === "street" && ward) {
        setIsSearching(true);
        try {
          const query = `${street}, ${ward}, ${district.name}, ${province.name}`;
          const results = await nominatimService.searchAddress(query);
          setSuggestions(results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [street, ward, district.name, province.name, step]);

  const loadProvinces = async () => {
    setLoading(true);
    try {
      const res = await locationService.getProvinces();
      setData(res.map((p: any) => ({ id: p.code, name: p.name })));
      setStep("province");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (item: any) => {
    if (step === "province") {
      setProvince(item);
      setStreet(""); 
      setLoading(true);
      try {
        const districts = await locationService.getDistricts(item.id);
        setData(districts.map((d: any) => ({ id: d.code, name: d.name })));
        setStep("district");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else if (step === "district") {
      setDistrict(item);
      setStreet(""); 
      setLoading(true);
      try {
        const wards = await locationService.getWards(item.id);
        setData(wards.map((w: any) => ({ id: w.code, name: w.name })));
        setStep("ward");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else if (step === "ward") {
      setWard(item.name);
      setStep("street");
      setTimeout(() => streetInputRef.current?.focus(), 150);
    }
  };

  const handleConfirm = () => {
    if (!province.name || !district.name || !ward) return;
    onSelect({
      provinceId: province.id,
      provinceName: province.name,
      districtId: district.id,
      districtName: district.name,
      ward: ward,
      street: street
    });
    onClose();
  };

  const handleBack = async () => {
    if (step === "district") {
      await loadProvinces();
    } else if (step === "ward") {
      setLoading(true);
      try {
        const districts = await locationService.getDistricts(province.id);
        setData(districts.map((d: any) => ({ id: d.code, name: d.name })));
        setStep("district");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else if (step === "street") {
        setLoading(true);
        try {
            const wards = await locationService.getWards(district.id);
            setData(wards.map((w: any) => ({ id: w.code, name: w.name })));
            setStep("ward");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View className="flex-1 bg-black/40">
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="justify-end"
        >
          <View 
            style={{ maxHeight: SCREEN_HEIGHT * 0.75, paddingBottom: 0 }} 
            className="bg-white rounded-t-[32px] shadow-2xl overflow-hidden"
          >
            {/* Bottom Sheet Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </View>

            <View className="flex-row items-center justify-between px-6 pt-2 pb-4 border-b border-slate-50">
              <View className="flex-row items-center gap-3 flex-1 mr-4">
                {step !== "province" && (
                  <TouchableOpacity onPress={handleBack} className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
                    <ChevronLeft size={18} color={COLORS.slate[600]} />
                  </TouchableOpacity>
                )}
                <View className="flex-1">
                  <Text className="text-lg font-extrabold text-slate-900" numberOfLines={1}>
                    {step === "province" ? "Chọn Tỉnh / Thành" : 
                     step === "district" ? "Chọn Quận / Huyện" : 
                     step === "ward" ? "Chọn Phường / Xã" : "Nhập số nhà, tên đường"}
                  </Text>
                  {step !== "province" && (
                     <Text className="text-[11px] text-primary-600 font-bold mt-0.5" numberOfLines={2}>
                      {[province.name, district.name, ward].filter(p => !!p).join(" > ")}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                  <X size={18} color={COLORS.slate[500]} />
                </View>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="py-20 justify-center items-center">
                <ActivityIndicator size="large" color={COLORS.primary[600]} />
              </View>
            ) : step === "street" ? (
              <ScrollView 
                className="px-6 py-6 bg-white" 
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 50 }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">
                    Địa chỉ chi tiết (Bước cuối)
                  </Text>
                  <View className="w-6 h-6 rounded-full bg-primary-50 items-center justify-center">
                    <Check size={14} color={COLORS.primary[600]} />
                  </View>
                </View>
                
                <View className="flex-row items-center bg-slate-50 px-4 rounded-2xl border border-primary-500 min-h-[62px] gap-3">
                  <MapPin size={22} color={COLORS.primary[500]} />
                  <TextInput
                    ref={streetInputRef}
                    className="flex-1 text-[17px] text-slate-900 py-3 font-bold"
                    value={street} onChangeText={setStreet}
                    placeholder="Ví dụ: 123 Đường 3/2" placeholderTextColor={COLORS.slate[400]}
                    returnKeyType="done"
                    onBlur={() => Keyboard.dismiss()}
                  />
                  {isSearching && <ActivityIndicator size="small" color={COLORS.primary[600]} />}
                </View>

                {suggestions.length > 0 && (
                  <View className="bg-white rounded-2xl border border-slate-100 mt-2 shadow-sm overflow-hidden">
                    {suggestions.map((item, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        className="px-4 py-3 border-b border-slate-50 active:bg-slate-50"
                        onPress={() => {
                          const name = item.display_name.split(",")[0];
                          setStreet(name);
                          setSuggestions([]);
                          Keyboard.dismiss();
                        }}
                      >
                        <Text className="text-[13px] text-slate-600 font-medium" numberOfLines={2}>
                          {item.display_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <Text className="text-[11px] text-slate-400 mt-4 leading-4 font-medium italic">
                  * Vui lòng nhập số nhà và tên đường chính xác để chúng tôi xác định vị trí công việc tốt nhất.
                </Text>

                {/* Confirm Button Inline - Ensuring Visibility during keyboard show */}
                <TouchableOpacity
                  className={["mt-10 h-16 rounded-2xl flex-row items-center justify-center gap-3 shadow-xl", 
                    street.length >= 1 ? "bg-primary-600 shadow-primary-500/30" : "bg-slate-200 shadow-none"].join(" ")}
                  onPress={handleConfirm}
                  disabled={street.length < 1}
                >
                  <Text className={["font-extrabold text-lg", street.length >= 1 ? "text-white" : "text-slate-400"].join(" ")}>
                      Xác nhận địa chỉ
                  </Text>
                  <Send size={20} color={street.length >= 1 ? "white" : COLORS.slate[400]} />
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <FlatList
                data={data}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = 
                    (step === "province" && province.id === item.id) || 
                    (step === "district" && district.id === item.id) ||
                    (step === "ward" && ward === item.name);
                  
                  return (
                    <TouchableOpacity 
                      className={["flex-row items-center justify-between py-3.5 px-4 mb-2 rounded-2xl border", 
                        isSelected ? "bg-primary-50 border-primary-200" : "bg-white border-slate-100"].join(" ")}
                      onPress={() => handleSelect(item)}
                    >
                      <Text className={["font-semibold text-[15px]", isSelected ? "text-primary-700" : "text-slate-700"].join(" ")}>{item.name}</Text>
                      {isSelected ? (
                        <Check size={18} color={COLORS.primary[600]} />
                      ) : (
                        <ChevronRight size={14} color={COLORS.slate[300]} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            {/* List Selection Help Text - Only for selection steps */}
            {step !== "street" && (
                <View 
                    className="px-6 py-4 bg-slate-50 border-t border-slate-100 items-center justify-center"
                    style={{ paddingBottom: Math.max(insets.bottom, 16) }}
                >
                    <Text className="text-slate-500 font-bold text-xs">
                        Vui lòng chọn {step === "province" ? "Tỉnh / Thành" : step === "district" ? "Quận / Huyện" : "Phường / Xã"}
                    </Text>
                </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
