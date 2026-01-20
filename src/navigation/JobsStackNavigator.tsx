import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { WorkerJobsScreen } from "../screens/WorkerJobsScreen";
import { JobDetailScreen } from "../screens/JobDetailScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ReviewScreen } from "../screens/ReviewScreen";

const Stack = createStackNavigator();

export function JobsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="JobsMain" component={WorkerJobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
}
