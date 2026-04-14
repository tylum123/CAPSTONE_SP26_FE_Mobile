/* AI CONTEXT:
 * Full-screen image viewer modal for evidence photos in report detail.
 * Extracted from ReportDetailScreen to enforce <250 line rule. */

import React from "react";
import { View, Image, TouchableOpacity, Modal, Dimensions } from "react-native";
import { X } from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

export function ImageViewerModal({ visible, imageUrl, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.92)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 48,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.15)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <X size={22} color="#fff" />
        </TouchableOpacity>
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: SCREEN_WIDTH - 32,
            height: SCREEN_HEIGHT * 0.65,
            borderRadius: 12,
          }}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
}
