import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { WorkerProfileScreen } from "../screens/WorkerProfileScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";

const Stack = createStackNavigator();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={WorkerProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}
