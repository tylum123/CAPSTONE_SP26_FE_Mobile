import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react-native";
import { Button } from "./Button";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "../../constants/theme";

export type FeedbackVariant = "success" | "error" | "info";

interface FeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: FeedbackVariant;
  confirmLabel?: string;
  onClose: () => void;
}

export function FeedbackModal({
  visible,
  title,
  message,
  variant = "info",
  confirmLabel = "Đóng",
  onClose,
}: FeedbackModalProps) {
  const renderIcon = () => {
    if (variant === "success") {
      return <CheckCircle2 size={28} color={COLORS.emerald[600]} />;
    }
    if (variant === "error") {
      return <AlertTriangle size={28} color={COLORS.rose[500]} />;
    }
    return <Info size={28} color={COLORS.blue[600]} />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrapper}>{renderIcon()}</View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button style={styles.button} onPress={onClose}>
              {confirmLabel}
            </Button>
          </View>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <X size={16} color={COLORS.gray[500]} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
    ...SHADOWS.md,
  },
  iconWrapper: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.slate[100],
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.title,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  message: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    minWidth: 120,
  },
  close: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
  },
});
