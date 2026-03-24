import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Image, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Camera, Upload, X } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { reportService } from "../services/report.service";

export function SubmitReportScreen({ navigation, route }: any) {
  const { jobApplicationId } = route.params || {};
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo functionality for picking images
  const pickImage = () => {
    // In a real app, use expo-image-picker
    if (images.length >= 3) {
      Alert.alert("Lỗi", "Tối đa 3 hình ảnh");
      return;
    }
    const mockImageUri = "https://picsum.photos/300/300?random=" + Math.random();
    setImages([...images, mockImageUri]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mô tả công việc hôm nay.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (jobApplicationId) {
        // Send actual request
        await reportService.submitDailyReport({
          jobApplicationId,
          reportDate: new Date().toISOString(),
          description,
          imageUrls: images
        });
        DeviceEventEmitter.emit("REFRESH_DATA");
      }
      Alert.alert("Thành công", "Đã gửi báo cáo công việc.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi báo cáo lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 mr-8">
          Báo cáo công việc
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="text-sm font-semibold text-slate-700 mb-2">Mô tả công việc hôm nay <Text className="text-red-500">*</Text></Text>
        <View className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 min-h-[120px]">
          <TextInput
            multiline
            placeholder="Ví dụ: Đã hái xong 50kg cà phê, dọn sạch cỏ khu vực A..."
            className="flex-1 text-[15px] text-slate-800"
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <Text className="text-sm font-semibold text-slate-700 mb-2">Hình ảnh tiến độ (Tối đa 3)</Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {images.map((uri, index) => (
            <View key={index} className="w-24 h-24 rounded-xl overflow-hidden relative">
              <Image source={{ uri }} className="w-full h-full" />
              <TouchableOpacity
                className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                onPress={() => removeImage(index)}
              >
                <X size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < 3 && (
            <TouchableOpacity 
              className="w-24 h-24 rounded-xl border border-dashed border-slate-300 bg-slate-50 items-center justify-center"
              onPress={pickImage}
            >
              <Camera size={24} color="#94a3b8" />
              <Text className="text-xs text-slate-500 mt-1">Thêm ảnh</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
          <Text className="text-sm text-blue-800">
            <Text className="font-bold">Lưu ý: </Text>
            Báo cáo này sẽ được chủ nông trại đánh giá và duyệt % khối lượng để thanh toán.
          </Text>
        </View>

        <View className="w-full">
          <Button 
            onPress={handleSubmit} 
            disabled={isSubmitting || !description.trim()}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi Báo Cáo"}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
