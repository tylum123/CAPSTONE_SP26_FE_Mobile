import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator } from "react-native";
import { MapPin, X, ChevronLeft, ChevronRight, Check } from "lucide-react-native";
import { locationService, nominatimService } from "../../services";
import { COLORS } from "../../constants/theme";

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
  const [step, setStep] = useState<"province" | "district" | "ward">("province");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [province, setProvince] = useState({ id: initialValues?.provinceId || 0, name: initialValues?.provinceName || "" });
  const [district, setDistrict] = useState({ id: initialValues?.districtId || 0, name: initialValues?.districtName || "" });
  const [ward, setWard] = useState(initialValues?.ward || "");
  const [street, setStreet] = useState(initialValues?.street || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProvinces();
    }
  }, [visible]);

  // Handle address autocomplete
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (street.length >= 3 && step === "ward") {
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
    } else {
      setWard(item.name);
      onSelect({
        provinceId: province.id,
        provinceName: province.name,
        districtId: district.id,
        districtName: district.name,
        ward: item.name,
        street
      });
      onClose();
    }
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
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-[32px] max-h-[85%]">
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-slate-50">
            <View className="flex-row items-center gap-3">
              {step !== "province" && (
                <TouchableOpacity onPress={handleBack} className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
                  <ChevronLeft size={18} color={COLORS.slate[600]} />
                </TouchableOpacity>
              )}
              <View>
                <Text className="text-xl font-bold text-slate-900">
                  Chọn {step === "province" ? "Tỉnh / Thành phố" : step === "district" ? "Quận / Huyện" : "Phường / Xã"}
                </Text>
                {step !== "province" && (
                  <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                    {[province.name, district.name].filter(p => !!p).join(" > ")}
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

          <View className="px-6 py-4 bg-slate-50 border-b border-slate-100 relative z-10">
            <Text className="text-[14px] font-bold text-slate-800 mb-2">Số nhà, tên đường</Text>
            <View className="flex-row items-center bg-white px-4 rounded-2xl border border-slate-200 min-h-[52px] gap-3">
              <MapPin size={18} color={COLORS.slate[400]} />
              <TextInput
                className="flex-1 text-[15px] text-slate-900 py-2 font-medium"
                value={street} onChangeText={setStreet}
                placeholder="Ví dụ: 123 Đường 3/2" placeholderTextColor={COLORS.slate[400]}
              />
              {isSearching && <ActivityIndicator size="small" color={COLORS.primary[600]} />}
            </View>

            {suggestions.length > 0 && (
              <View className="absolute top-[100%] left-6 right-6 bg-white rounded-2xl shadow-xl border border-slate-100 mt-1 py-1 overflow-hidden z-20">
                {suggestions.map((item, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    className="px-4 py-3 border-b border-slate-50 active:bg-slate-50"
                    onPress={() => {
                      // Extract name from display_name
                      const name = item.display_name.split(",")[0];
                      setStreet(name);
                      setSuggestions([]);
                    }}
                  >
                    <Text className="text-[14px] text-slate-700 font-medium" numberOfLines={1}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <FlatList
            data={data}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => {
              const isSelected = 
                (step === "province" && province.id === item.id) || 
                (step === "district" && district.id === item.id) ||
                (step === "ward" && ward === item.name);
              
              return (
                <TouchableOpacity 
                  className={["flex-row items-center justify-between py-4 px-4 mb-2 rounded-2xl border transition-all", 
                    isSelected ? "bg-primary-50 border-primary-100" : "bg-white border-slate-100"].join(" ")}
                  onPress={() => handleSelect(item)}
                >
                  <Text className={["font-semibold text-base", isSelected ? "text-primary-700" : "text-slate-700"].join(" ")}>{item.name}</Text>
                  {isSelected ? (
                    <Check size={20} color={COLORS.primary[600]} />
                  ) : (
                    <ChevronRight size={16} color={COLORS.slate[300]} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
