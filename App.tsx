import "./global.css";
import "react-native-gesture-handler";
import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./src/services/push-notification.service";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = React.useState('');
  const notificationListener = React.useRef<Notifications.EventSubscription | null>(null);
  const responseListener = React.useRef<Notifications.EventSubscription | null>(null);

  React.useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
      // Example: We can dispatch this to backend here, or in AuthContext on login
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // You can handle notification receiving here while app is in foreground
      console.log('Notification received in foreground:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle the user tapping on the notification
      console.log('User tapped the notification:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.webWrapperOuter}>
        <View style={styles.webWrapperInner}>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </AuthProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webWrapperOuter: {
    flex: 1,
    height: Platform.OS === "web" ? "100vh" as any : "100%",
    backgroundColor: Platform.OS === "web" ? "#f3f4f6" : "transparent",
    alignItems: Platform.OS === "web" ? "center" : undefined,
    justifyContent: Platform.OS === "web" ? "center" : undefined,
  },
  webWrapperInner: {
    flex: 1,
    height: Platform.OS === "web" ? "100vh" as any : "100%",
    width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : "100%",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    ...(Platform.OS === "web" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    }),
  },
});
