/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, Briefcase, User, MessageSquare } from "lucide-react-native";

import { WorkerHomeScreen } from "../screens/WorkerHomeScreen";
import { WorkerSearchScreen } from "../screens/WorkerSearchScreen";
import { WorkerJobsScreen } from "../screens/WorkerJobsScreen";
import { WorkerProfileScreen } from "../screens/WorkerProfileScreen";
import { ConversationListScreen } from "../screens/ConversationListScreen";
import { useUnreadCounts } from "../hooks/use_unread_counts";

const Tab = createBottomTabNavigator();

const TABS = [
  { name: "Search",   label: "Tìm việc",  Icon: Search        },
  { name: "Jobs",     label: "Công việc", Icon: Briefcase     },
  { name: "Home",     label: "Trang chủ", Icon: Home          }, // center
  { name: "Messages", label: "Tin nhắn",  Icon: MessageSquare },
  { name: "Profile",  label: "Tôi",       Icon: User          },
];

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const focusedName = state.routes[state.index]?.name;
  const { unreadMessages } = useUnreadCounts();

  const handlePress = (routeName: string) => {
    const event = navigation.emit({ type: "tabPress", target: routeName, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(routeName);
  };

  return (
    <View
      className="flex-row bg-white border-t border-slate-100 pt-2"
      style={{
        paddingBottom: insets.bottom || 8,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {TABS.map(({ name, label, Icon }, i) => {
        const focused = focusedName === name;
        const isCenter = i === 2;

        return (
          <TouchableOpacity
            key={name}
            className="flex-1 items-center justify-end pb-1"
            activeOpacity={0.7}
            onPress={() => handlePress(name)}
          >
            {isCenter ? (
              <View className="items-center justify-center self-center absolute w-[68px] h-[68px] rounded-full bg-white z-10" style={{ top: -36 }}>
                <View
                  className={["w-[52px] h-[52px] rounded-full items-center justify-center", focused ? "bg-primary-500" : "bg-primary-400"].join(" ")}
                  style={{ shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}
                >
                  <Icon size={24} color="#ffffff" strokeWidth={2.5} />
                </View>
                <Text
                  className={["absolute text-[10px] font-semibold text-center w-[100px]", focused ? "text-primary-600" : "text-slate-400"].join(" ")}
                  style={{ bottom: -12 }}
                >
                  {label}
                </Text>
              </View>
            ) : (
              <View className="items-center justify-end">
                <View className={["w-[34px] h-[34px] rounded-full items-center justify-center mb-1", focused ? "bg-primary-50" : ""].join(" ")}>
                  <Icon size={22} color={focused ? "#059669" : "#94a3b8"} strokeWidth={focused ? 2.5 : 1.8} />
                  {name === "Messages" && unreadMessages > 0 && (
                    <View 
                      className="absolute top-0 right-0 w-[10px] h-[10px] rounded-full bg-rose-500 border-2 border-white" 
                      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, elevation: 1 }} 
                    />
                  )}
                </View>
                <Text className={["text-[10px] font-semibold text-center", focused ? "text-primary-600" : "text-slate-400"].join(" ")}>
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
      initialRouteName="Home"
    >
      <Tab.Screen name="Home"     component={WorkerHomeScreen}     options={{ title: "Trang chủ" }} />
      <Tab.Screen name="Search"   component={WorkerSearchScreen}   options={{ title: "Tìm việc"  }} />
      <Tab.Screen name="Jobs"     component={WorkerJobsScreen}     options={{ title: "Công việc" }} />
      <Tab.Screen name="Messages" component={ConversationListScreen} options={{ title: "Tin nhắn"  }} />
      <Tab.Screen name="Profile"  component={WorkerProfileScreen}  options={{ title: "Tôi"        }} />
    </Tab.Navigator>
  );
}
