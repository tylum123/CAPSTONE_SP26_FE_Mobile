import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Wallet,
  User,
} from "lucide-react-native";
import { COLORS } from "../constants/theme";

import { FarmerDashboardScreen } from "../screens/FarmerDashboardScreen";
import { FarmerProfileScreen } from "../screens/FarmerProfileScreen";

// Placeholder screens
import { View, Text, StyleSheet } from "react-native";

function FarmerJobsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Danh sách công việc</Text>
    </View>
  );
}

function FarmerApplicantsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Quản lý ứng viên</Text>
    </View>
  );
}

function FarmerPaymentsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Thanh toán</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export function FarmerTabNavigator() {
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
        name="Dashboard"
        component={FarmerDashboardScreen}
        options={{
          title: "Tổng quan",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={FarmerJobsScreen}
        options={{
          title: "Công việc",
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Applicants"
        component={FarmerApplicantsScreen}
        options={{
          title: "Ứng viên",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Payments"
        component={FarmerPaymentsScreen}
        options={{
          title: "Thanh toán",
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={FarmerProfileScreen}
        options={{
          title: "Tài khoản",
          headerShown: true,
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
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.emerald[50],
  },
  placeholderText: {
    fontSize: 18,
    color: COLORS.gray[600],
    fontWeight: "600",
  },
});
