import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { WorkerTabNavigator } from "./WorkerTabNavigator";
import { FarmerTabNavigator } from "./FarmerTabNavigator";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { useAuth } from "../context/AuthContext";

const Stack = createStackNavigator();

export function RootNavigator() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack - Chưa đăng nhập
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Main App Stack - Đã đăng nhập, tự động chuyển theo role
        <>
          {user?.role === "worker" ? (
            <Stack.Screen name="Worker" component={WorkerTabNavigator} />
          ) : (
            <Stack.Screen name="Farmer" component={FarmerTabNavigator} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}
