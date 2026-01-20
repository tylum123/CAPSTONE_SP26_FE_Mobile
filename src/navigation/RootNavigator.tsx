import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { WorkerTabNavigator } from "./WorkerTabNavigator";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { useAuth } from "../context/AuthContext";

const Stack = createStackNavigator();

export function RootNavigator() {
  const { isAuthenticated } = useAuth();

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
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
        </>
      ) : (
        // Main App Stack - Đã đăng nhập (Worker only)
        <Stack.Screen name="Worker" component={WorkerTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
