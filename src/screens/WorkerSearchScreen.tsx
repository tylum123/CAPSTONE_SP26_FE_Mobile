import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

export function WorkerSearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tìm kiếm công việc</Text>
      <Text style={styles.subtitle}>Chức năng đang phát triển</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.emerald[50],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray[600],
    marginTop: 8,
  },
});
