import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, Briefcase, Wallet, User } from "lucide-react-native";
import { COLORS, SHADOWS } from "../constants/theme";

import { WorkerHomeScreen } from "../screens/WorkerHomeScreen";
import { WorkerSearchScreen } from "../screens/WorkerSearchScreen";
import { WorkerJobsScreen } from "../screens/WorkerJobsScreen";
import { WorkerWalletScreen } from "../screens/WorkerWalletScreen";
import { WorkerProfileScreen } from "../screens/WorkerProfileScreen";

const Tab = createBottomTabNavigator();

const TABS = [
  { name: "Search", label: "Tìm việc", Icon: Search },
  { name: "Jobs", label: "Công việc", Icon: Briefcase },
  { name: "Home", label: "Trang chủ", Icon: Home }, // center highlighted
  { name: "Wallet", label: "Ví tiền", Icon: Wallet },
  { name: "Profile", label: "Tôi", Icon: User },
];

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  const focusedName = state.routes[state.index]?.name;

  const handlePress = (routeName: string) => {
    const event = navigation.emit({
      type: "tabPress",
      target: routeName,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {TABS.map(({ name, label, Icon }, i) => {
        const focused = focusedName === name;
        const isCenter = i === 2;

        return (
          <TouchableOpacity
            key={name}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => handlePress(name)}
          >
            {isCenter ? (
              <View style={styles.centerItemWrap}>
                <View
                  style={[
                    styles.centerCircle,
                    focused && styles.centerCircleFocused,
                  ]}
                >
                  <Icon size={24} color={COLORS.white} strokeWidth={2.5} />
                </View>
                <Text
                  style={[
                    styles.centerTabLabel,
                    focused && styles.tabLabelFocused,
                  ]}
                >
                  {label}
                </Text>
              </View>
            ) : (
              <View style={styles.normalItemWrap}>
                <View
                  style={[styles.iconWrap, focused && styles.iconWrapFocused]}
                >
                  <Icon
                    size={22}
                    color={focused ? COLORS.emerald[600] : COLORS.slate[400]}
                    strokeWidth={focused ? 2.5 : 1.8}
                  />
                </View>
                <Text
                  style={[styles.tabLabel, focused && styles.tabLabelFocused]}
                >
                  {label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function WorkerTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={WorkerHomeScreen}
        options={{ title: "Trang chủ" }}
      />
      <Tab.Screen
        name="Search"
        component={WorkerSearchScreen}
        options={{ title: "Tìm việc" }}
      />
      <Tab.Screen
        name="Jobs"
        component={WorkerJobsScreen}
        options={{ title: "Công việc" }}
      />
      <Tab.Screen
        name="Wallet"
        component={WorkerWalletScreen}
        options={{ title: "Ví tiền" }}
      />
      <Tab.Screen
        name="Profile"
        component={WorkerProfileScreen}
        options={{ title: "Tôi" }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100],
    paddingTop: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end", // Align items to bottom
    paddingBottom: 4,
  },
  normalItemWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconWrapFocused: {
    backgroundColor: COLORS.emerald[50],
  },
  // Wrapping container to create the "cutout" transparent gap effect
  centerItemWrap: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "absolute",
    top: -36,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.white, // Match tab background color
    zIndex: 10,
  },
  // Center Home button — elevated green circle
  centerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.emerald[400],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.emerald[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  centerCircleFocused: {
    backgroundColor: COLORS.emerald[500],
  },
  centerTabLabel: {
    position: "absolute",
    bottom: -12,
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.slate[400],
    textAlign: "center",
    width: 100,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.slate[400],
    textAlign: "center",
  },
  tabLabelFocused: {
    color: COLORS.emerald[600],
  },
});
