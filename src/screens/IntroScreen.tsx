import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../constants/theme";

export function IntroScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Tim viec nong nghiep</Text>
        <Text style={styles.subtitle}>Ket noi nhanh voi cong viec phu hop</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.primaryButtonText}>Dang nhap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.secondaryButtonText}>Dang ky</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => navigation.navigate("WorkerDemo")}
        >
          <Text style={styles.demoButtonText}>Xem demo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.gray[900],
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: COLORS.emerald[600],
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.emerald[600],
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.emerald[700],
    fontWeight: "600",
  },
  demoButton: {
    marginTop: SPACING.sm,
  },
  demoButtonText: {
    color: COLORS.gray[600],
    textDecorationLine: "underline",
  },
});
