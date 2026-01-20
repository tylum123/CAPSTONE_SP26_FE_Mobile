import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { WorkerHomeScreen } from "../screens/WorkerHomeScreen";
import { JobDetailScreen } from "../screens/JobDetailScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";

const Stack = createStackNavigator();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={WorkerHomeScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
