import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WorkerSearchScreen } from "../screens/WorkerSearchScreen";
import { JobDetailScreen } from "../screens/JobDetailScreen";
import { ChatScreen } from "../screens/ChatScreen";

const Stack = createStackNavigator();

export function SearchStackNavigator() {
  const insets = useSafeAreaInsets();

  const defaultTabBarStyle = {
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom,
    paddingTop: 5,
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="SearchMain"
        component={WorkerSearchScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            // Đảm bảo hiển thị bottom tab và ẩn header khi vào SearchMain
            navigation.getParent()?.setOptions({
              tabBarStyle: defaultTabBarStyle,
              headerShown: false,
            });
          },
        })}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: "none" },
              headerShown: false, // Ẩn header "Tìm việc"
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: defaultTabBarStyle,
              headerShown: false, // Giữ ẩn header khi quay về
            });
          },
        })}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: "none" },
              headerShown: false, // Ẩn header "Tìm việc"
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: defaultTabBarStyle,
              headerShown: false, // Giữ ẩn header khi quay về
            });
          },
        })}
      />
    </Stack.Navigator>
  );
}
