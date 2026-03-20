import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react-native";
import { Button } from "./Button";

export type FeedbackVariant = "success" | "error" | "info";

interface FeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: FeedbackVariant;
  confirmLabel?: string;
  cancelLabel?: string;  // Nếu có cancelLabel thì hiện 2 nút
  onClose: () => void;
  onConfirm?: () => void; // Nếu có thì nút chính gọi onConfirm, không thì gọi onClose
}

export function FeedbackModal({
  visible,
  title,
  message,
  variant = "info",
  confirmLabel = "Đóng",
  cancelLabel,
  onClose,
  onConfirm,
}: FeedbackModalProps) {
  const renderIcon = () => {
    if (variant === "success") return <CheckCircle2 size={28} color="#059669" />;
    if (variant === "error")   return <AlertTriangle size={28} color="#f43f5e" />;
    return <Info size={28} color="#2563eb" />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: "rgba(15,23,42,0.4)" }}>
        <View
          className="w-full bg-white rounded-2xl p-6 border border-slate-100"
          style={{
            maxWidth: 360,
            shadowColor: "#0f172a",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <View className="self-center w-14 h-14 rounded-full items-center justify-center bg-slate-100 mb-4">
            {renderIcon()}
          </View>
          <Text className="text-xl font-bold text-slate-900 text-center mb-1">{title}</Text>
          <Text className="text-[15px] text-slate-600 text-center mb-6">{message}</Text>
          <View
            style={{ flexDirection: 'row', gap: 12, alignItems: 'stretch', justifyContent: 'center' }}
          >
            {cancelLabel && (
              <Button variant="outline" onPress={onClose} style={{ flex: 1 }}>
                {cancelLabel}
              </Button>
            )}
            <Button
              onPress={onConfirm ?? onClose}
              style={cancelLabel ? { flex: 1 } : { minWidth: 120 }}
              variant={variant === "error" ? "danger" : "default"}
            >
              {confirmLabel}
            </Button>
          </View>
          <TouchableOpacity className="absolute top-2 right-2 p-1" onPress={onClose}>
            <X size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
