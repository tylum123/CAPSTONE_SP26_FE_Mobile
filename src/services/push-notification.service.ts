/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('--- ERROR: Notification permissions not granted! ---');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      console.log('--- WARNING: EAS Project ID not found in app.json. ---');
    }
    try {
      // Sử dụng getExpoPushTokenAsync để lấy Token tương thích với Backend hiện tại (Expo API)
      const tokenResult = await Notifications.getExpoPushTokenAsync({ 
        projectId: projectId || undefined 
      });
      token = tokenResult.data;
      console.log('--- EXPO PUSH TOKEN: ---', token);
    } catch (e: unknown) {
      console.error('--- ERROR GETTING EXPO PUSH TOKEN: ---', e);
    }
  } else {
    console.log('--- ERROR: Must use physical device for Push Notifications ---');
  }

  return token;
}
