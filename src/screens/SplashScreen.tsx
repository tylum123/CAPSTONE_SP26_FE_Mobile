import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { isAuthenticated } = useAuth();
  // Use a ref so the timer callback always reads the latest value
  // without re-triggering the effect every time auth state changes.
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        // If user is already authenticated, RootNavigator will auto-switch —
        // no need to navigate manually (and "Login" won't exist in the stack).
        if (!isAuthRef.current) {
          navigation.replace("Login");
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 justify-center items-center p-6">
        <Animated.View
          className="items-center"
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View
            className="w-[140px] h-[140px] rounded-[28px] bg-primary-50 justify-center items-center mb-6 overflow-hidden"
            style={{
              shadowColor: "#064e3b",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: "120%", height: "120%" }}
              resizeMode="cover"
            />
          </View>
          <Text className="text-[32px] font-extrabold text-primary-700" style={{ letterSpacing: -0.5 }}>
            AgroTemp
          </Text>
          <Text className="mt-2 text-[13px] text-slate-500 font-medium" style={{ letterSpacing: 0.2 }}>
            Ứng dụng tìm việc thời vụ nông nghiệp Việt Nam
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
