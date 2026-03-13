import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { WorkerTabNavigator } from "./WorkerTabNavigator";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { OnboardingProfileScreen } from "../screens/OnboardingProfileScreen";
import { useAuth } from "../context/AuthContext";
import { workerProfileService } from "../services";

// Standalone screens
import { JobDetailScreen } from "../screens/JobDetailScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { ReviewScreen } from "../screens/ReviewScreen";
import { CheckInScreen } from "../screens/CheckInScreen";
import { AttendanceHistoryScreen } from "../screens/AttendanceHistoryScreen";
import { AttendanceDetailScreen } from "../screens/AttendanceDetailScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";

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

  const renderAuthenticatedScreens = () => (
    <>
      <Stack.Screen name="Worker" component={WorkerTabNavigator} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
      <Stack.Screen name="AttendanceDetail" component={AttendanceDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </>
  );

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
          {renderAuthenticatedScreens()}
        </>
      ) : (
        // Main App Stack - Đã đăng nhập (Worker only)
        renderAuthenticatedScreens()
      )}
    </Stack.Navigator>
  );
}
