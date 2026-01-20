import React, { useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Search, Briefcase, Wallet, User } from "lucide-react-native";
import { Animated } from "react-native";
import { COLORS } from "../constants/theme";

import { HomeStackNavigator } from "./HomeStackNavigator";
import { SearchStackNavigator } from "./SearchStackNavigator";
import { JobsStackNavigator } from "./JobsStackNavigator";
import { WorkerWalletScreen } from "../screens/WorkerWalletScreen";
import { ProfileStackNavigator } from "./ProfileStackNavigator";

const Tab = createBottomTabNavigator();

// Shared animated value for tab bar visibility
export const tabBarTranslateY = new Animated.Value(0);

export function WorkerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.gray[500],
        tabBarActiveBackgroundColor: COLORS.emerald[600],
        tabBarInactiveBackgroundColor: COLORS.white,
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          transform: [{ translateY: tabBarTranslateY }],
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
          color: COLORS.gray[900],
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: "Trang chủ",
          headerShown: true,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          title: "Tìm việc",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsStackNavigator}
        options={{
          title: "Công việc",
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WorkerWalletScreen}
        options={{
          title: "Ví tiền",
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: "Tài khoản",
          headerStyle: { paddingBottom: 16 },
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
