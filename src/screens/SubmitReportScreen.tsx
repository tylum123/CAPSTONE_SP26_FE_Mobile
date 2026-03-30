/* AI CONTEXT:
 * Action: Submits new daily work proof (images/text) for a job.
 * Inputs: Text description, selected photos/media.
 * Outputs: Multipart form data API request.
 * Dependencies: Report service, Media service, Expo Image Picker. */

import React, { useState, useRef } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Image, DeviceEventEmitter, Animated, Modal, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Camera, Upload, X, CheckCircle2, Star, Home, ArrowRight, Info, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "../components/ui/Button";
import { reportService } from "../services/report.service";
import { mediaService } from "../services/media.service";
import { FeedbackModal } from "../components/ui/FeedbackModal";
import { hapticFeedback } from "../utils/haptic";

export function SubmitReportScreen({ navigation, route }: any) {
  const { jobApplicationId } = route.params || {};
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<{ uri: string; fileName?: string; type?: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [feedback, setFeedback] = useState<{ 
    visible: boolean; 
    title: string; 
    message: string; 
    variant: "success" | "error" | "info"; 
    onConfirm?: () => void 
  }>({ 
    visible: false, 
    title: "", 
    message: "", 
    variant: "info" 
  });

  const showFeedback = (params: { 
    title: string; 
    message: string; 
    variant?: "success" | "error" | "info"; 
    onConfirm?: () => void 
  }) => setFeedback({ 
    visible: true, 
    title: params.title, 
    message: params.message, 
    variant: params.variant || "info", 
    onConfirm: params.onConfirm 
  });

  const closeFeedback = () => { 
    const cb = feedback.onConfirm; 
    setFeedback((p) => ({ ...p, visible: false })); 
    cb?.(); 
  };

  const pickImage = async () => {
    if (images.length >= 3) {
      showFeedback({ title: "Thông báo", message: "Tối đa 3 hình ảnh", variant: "info" });
      return;
    }
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showFeedback({ title: "Thiếu quyền", message: "Cần quyền truy cập thư viện ảnh để thêm ảnh báo cáo.", variant: "error" });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setImages([...images, { 
          uri: asset.uri, 
          fileName: asset.fileName || `report_${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg"
        }]);
      }
    } catch (error) {
      showFeedback({ title: "Lỗi", message: "Không thể chọn ảnh lúc này.", variant: "error" });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true })
    ]).start();
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      showFeedback({ title: "Lỗi", message: "Vui lòng nhập mô tả công việc hôm nay.", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (jobApplicationId) {
        let evidenceUrl = "";
        
        // Upload images if any
        if (images.length > 0) {
          setIsUploading(true);
          const uploadPromises = images.map(img => 
            mediaService.uploadImage({
              uri: img.uri,
              name: img.fileName || "report.jpg",
              type: img.type || "image/jpeg"
            })
          );
          const urls = await Promise.all(uploadPromises);
          evidenceUrl = urls.join(",");
          setIsUploading(false);
        }

        await reportService.submitDailyReport({
          jobApplicationId,
          workerDescription: description,
          evidenceUrl // Now sending the joined URLs
        });
        hapticFeedback.success();
        DeviceEventEmitter.emit("REFRESH_DATA");
        triggerSuccess();
      }
    } catch (error: any) {
      setIsUploading(false);
      hapticFeedback.error();
      showFeedback({ 
        title: "Lỗi", 
        message: error.message || "Không thể gửi báo cáo lúc này.", 
        variant: "error" 
      });
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
        <Text className="text-sm font-semibold text-slate-700 mb-2 pl-1">Mô tả công việc hôm nay <Text className="text-red-500">*</Text></Text>
        <View className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 min-h-[160px] shadow-sm shadow-slate-200/50">
          <TextInput
            multiline
            placeholder="Ví dụ: Đã hái xong 50kg cà phê, dọn sạch cỏ khu vực A..."
            className="flex-1 text-[16px] text-slate-800 leading-6"
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <Text className="text-sm font-semibold text-slate-700 mb-2 pl-1">Hình ảnh tiến độ (Tối đa 3)</Text>
        <View className="flex-row gap-3 mb-6">
          {images.map((img, index) => (
            <View key={index} className="flex-1 aspect-square rounded-2xl overflow-hidden relative border border-slate-100 bg-slate-100">
              <Image source={{ uri: img.uri }} className="w-full h-full" />
              <TouchableOpacity
                className="absolute top-1.5 right-1.5 bg-black/40 rounded-full p-1.5"
                onPress={() => removeImage(index)}
              >
                <X size={12} color="white" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < 3 && (
            <TouchableOpacity 
              className="flex-1 aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 items-center justify-center"
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <View className="bg-primary-50 p-2 rounded-full mb-1">
                <ImageIcon size={20} color="#059669" />
              </View>
              <Text className="text-[10px] text-slate-500 font-bold">Thêm ảnh</Text>
            </TouchableOpacity>
          )}

          {/* Placeholders to keep everything aligned and horizontal even with 1 image */}
          {images.length === 1 && <View className="flex-1 aspect-square" />}
          {images.length === 0 && (
            <>
              <View className="flex-1 aspect-square" />
              <View className="flex-1 aspect-square" />
            </>
          )}
        </View>

        <View className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-8 flex-row gap-3">
          <Info size={18} color="#059669" />
          <Text className="flex-1 text-[13px] text-emerald-800 leading-5">
            <Text className="font-bold">Nhắc nhở: </Text>
            Báo cáo chi tiết và có hình ảnh sẽ giúp chủ nông trại duyệt nhanh và chính xác hơn.
          </Text>
        </View>

        <View className="w-full mb-10">
          <Button 
            onPress={handleSubmit} 
            disabled={isSubmitting || !description.trim()}
            className="bg-primary-600 h-16 rounded-3xl shadow-lg shadow-primary-500/30"
          >
            {isSubmitting ? (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold text-lg">
                  {isUploading ? "Đang tải ảnh..." : "Đang gửi báo cáo..."}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-extrabold text-lg">Gửi báo cáo ngay</Text>
                <ArrowRight size={20} color="white" strokeWidth={3} />
              </View>
            )}
          </Button>
        </View>
      </ScrollView>

      {/* SUCCESS MODAL OVERLAY */}
      <Modal visible={showSuccess} transparent animationType="none">
        <View className="flex-1 bg-black/60 items-center justify-center px-8">
          <Animated.View 
            style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
            className="bg-white w-full rounded-[40px] p-8 items-center border border-white/20 shadow-2xl"
          >
            <View className="w-24 h-24 bg-primary-500 rounded-full items-center justify-center mb-6 shadow-xl shadow-primary-500/50">
              <CheckCircle2 size={56} color="white" strokeWidth={2.5} />
            </View>
            
            <Text className="text-2xl font-black text-slate-900 mb-2 text-center">Tuyệt vời!</Text>
            <Text className="text-slate-500 text-center mb-8 leading-5">
              Báo cáo của bạn đã được gửi. Chúc bạn một ngày làm việc năng suất!
            </Text>

            <View className="flex-row gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={20} fill="#fbbf24" color="#fbbf24" />
              ))}
            </View>

            <View className="w-full gap-3">
              <Button 
                onPress={() => {
                  setShowSuccess(false);
                  navigation.navigate("Worker", { screen: "Home" });
                }}
                className="bg-primary-600 h-14 rounded-2xl"
              >
                <View className="flex-row items-center gap-2">
                  <Home size={18} color="white" strokeWidth={3} />
                  <Text className="text-white font-bold">Về trang chủ</Text>
                </View>
              </Button>
              <TouchableOpacity 
                onPress={() => {
                  setShowSuccess(false);
                  navigation.goBack();
                }}
                className="h-14 items-center justify-center"
              >
                <Text className="text-slate-400 font-bold">Quay lại chi tiết</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <FeedbackModal
        visible={feedback.visible}
        title={feedback.title}
        message={feedback.message}
        variant={feedback.variant}
        onClose={closeFeedback}
        onConfirm={feedback.onConfirm}
      />
    </SafeAreaView>
  );
}
