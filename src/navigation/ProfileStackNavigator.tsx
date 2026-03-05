import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WorkerProfileScreen } from "../screens/WorkerProfileScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";

const Stack = createStackNavigator();

export function ProfileStackNavigator() {
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
        name="ProfileMain"
        component={WorkerProfileScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            // Ẩn header "Tài khoản" khi vào ProfileMain
            navigation.getParent()?.setOptions({
              tabBarStyle: defaultTabBarStyle,
              headerShown: false,
            });
          },
        })}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: "none" },
              headerShown: false, // Ẩn header "Tài khoản"
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
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: "none" },
              headerShown: false,
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: defaultTabBarStyle,
              headerShown: false,
            });
          },
        })}
      />
    </Stack.Navigator>
  );
}
