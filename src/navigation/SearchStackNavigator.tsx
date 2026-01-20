import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { WorkerSearchScreen } from "../screens/WorkerSearchScreen";
import { JobDetailScreen } from "../screens/JobDetailScreen";
import { ChatScreen } from "../screens/ChatScreen";

const Stack = createStackNavigator();

export function SearchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SearchMain" component={WorkerSearchScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
