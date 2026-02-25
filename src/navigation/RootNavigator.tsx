import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { WorkerTabNavigator } from "./WorkerTabNavigator";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { IntroScreen } from "../screens/IntroScreen";
import { OnboardingProfileScreen } from "../screens/OnboardingProfileScreen";
import { useAuth } from "../context/AuthContext";
import { workerProfileService } from "../services";

const Stack = createStackNavigator();

export function RootNavigator() {
  const { isAuthenticated } = useAuth();
  const [profileStatus, setProfileStatus] = React.useState<
    "unknown" | "hasProfile" | "needsProfile"
  >("unknown");

  React.useEffect(() => {
    if (!isAuthenticated) {
      setProfileStatus("unknown");
      return;
    }

    const checkProfile = async () => {
      try {
        await workerProfileService.getProfile();
        setProfileStatus("hasProfile");
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setProfileStatus("needsProfile");
        } else {
          setProfileStatus("hasProfile");
        }
      }
    };

    checkProfile().catch(() => undefined);
  }, [isAuthenticated]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack - Chưa đăng nhập
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="WorkerDemo" component={WorkerTabNavigator} />
        </>
      ) : profileStatus === "needsProfile" ? (
        <>
          <Stack.Screen
            name="OnboardingProfile"
            component={OnboardingProfileScreen}
          />
          <Stack.Screen name="Worker" component={WorkerTabNavigator} />
        </>
      ) : (
        // Main App Stack - Đã đăng nhập (Worker only)
        <Stack.Screen name="Worker" component={WorkerTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
