import "./global.css";
import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./src/context/AuthContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import * as Notifications from "expo-notifications";
import { DeviceEventEmitter } from "react-native";
import Toast from "react-native-toast-message";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const notificationListener = React.useRef<Notifications.EventSubscription | null>(null);
  const responseListener = React.useRef<Notifications.EventSubscription | null>(null);

  React.useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Refresh dữ liệu khi có thông báo mới (ví dụ: công việc mới)
      DeviceEventEmitter.emit("REFRESH_DATA");
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
      <Toast />
    </GestureHandlerRootView>
  );
}
