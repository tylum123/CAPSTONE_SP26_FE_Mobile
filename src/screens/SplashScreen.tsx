import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";

export function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      // Fade out then redirect
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace("Login");
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.title}>AgroTemp</Text>
          <Text style={styles.subtitle}>Ứng dụng tìm việc thời vụ nông nghiệp Việt Nam</Text>
        </Animated.View>
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
  },
  content: {
    alignItems: "center",
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.emerald[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
    overflow: "hidden",
    shadowColor: COLORS.emerald[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  logo: {
    width: "120%",
    height: "120%",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.emerald[700],
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.slate[500],
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
