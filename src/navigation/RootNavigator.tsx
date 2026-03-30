/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { WorkerTabNavigator } from "./WorkerTabNavigator";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { OnboardingProfileScreen } from "../screens/OnboardingProfileScreen";
import { useAuth } from "../context/AuthContext";
import { workerProfileService } from "../services/export_services";

// Standalone screens
import { JobDetailScreen } from "../screens/JobDetailScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { ReviewScreen } from "../screens/ReviewScreen";
import { SubmitReportScreen } from "../screens/SubmitReportScreen";
import { ReportHistoryScreen } from "../screens/ReportHistoryScreen";
import { ReportDetailScreen } from "../screens/ReportDetailScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { WithdrawalScreen } from "../screens/WithdrawalScreen";

const Stack = createStackNavigator();

export function RootNavigator() {
  const { isAuthenticated, user } = useAuth();
  const [profileStatus, setProfileStatus] = React.useState<
    "unknown" | "hasProfile" | "needsProfile"
  >("unknown");

  React.useEffect(() => {
    if (!isAuthenticated) {
      setProfileStatus("unknown");
      return;
    }

    if (user?.isDemo) {
      setProfileStatus("hasProfile"); // bypass on-boarding profile call for demo user
      return;
    }

    const checkProfile = async () => {
      try {
        await workerProfileService.getProfile();
        setProfileStatus("hasProfile");
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "";
        const isProfileNotFound = errorMessage.toLowerCase().includes("profile not found") || error?.response?.status === 404;

        if (isProfileNotFound) {
          setProfileStatus("needsProfile");
        } else if (error?.response?.status === 401) {
          // If it's a real 401 (not profile missing), logout is handled by axios interceptor
          // but we set unknown to be safe
          setProfileStatus("unknown");
        } else {
          setProfileStatus("hasProfile");
        }
      }
    };

    checkProfile().catch(() => undefined);
  }, [isAuthenticated, user]);

  const renderAuthenticatedScreens = () => (
    <>
      <Stack.Screen name="Worker" component={WorkerTabNavigator} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="SubmitReport" component={SubmitReportScreen} />
      <Stack.Screen
        name="ReportHistory"
        component={ReportHistoryScreen}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Withdrawal" component={WithdrawalScreen} />
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
        </>
      ) : profileStatus === "unknown" ? (
        // Loading state while checking profile
        <Stack.Screen name="RootLoading" component={SplashScreen} />
      ) : profileStatus === "needsProfile" ? (
        <>
          <Stack.Screen
            name="OnboardingProfile"
            component={OnboardingProfileScreen}
          />
          {renderAuthenticatedScreens()}
        </>
      ) : (
        // Main App Stack - Đã đăng nhập (Worker real or Demo)
        renderAuthenticatedScreens()
      )}
    </Stack.Navigator>
  );
}
