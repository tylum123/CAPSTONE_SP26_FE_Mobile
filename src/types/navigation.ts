/**
 * Navigation Type Definitions — CAPSTONE SP26
 *
 * Strict typing cho React Navigation. Thay thế `navigation: any` và `route: any`
 * trong tất cả screens bằng các typed params dưới đây.
 *
 * Usage trong screen:
 *   import { NativeStackScreenProps } from '@react-navigation/native-stack';
 *   import { RootStackParamList } from '../types/navigation';
 *   type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;
 */

// ─── Root Stack — toàn bộ màn hình trong stack navigator chính ───────────────

export type RootStackParamList = {
  // Auth flow
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;

  // Onboarding
  OnboardingProfile: undefined;

  // Worker Main Tabs (bottom tab navigator - no params)
  WorkerTabs: undefined;

  // Stack screens (pushed on top of tabs)
  JobDetail: { jobId: string };
  SubmitReport: { jobApplicationId: string; jobTitle?: string };
  ReportHistory: { workerProfileId: string };
  ReportDetail: {
    reportId?: string;
    report?: import('./define_worker_interfaces').JobDetailDTO;
  };
  DisputeHistory: undefined;
  WorkerWallet: undefined;
  Withdrawal: undefined;
  Notifications: undefined;
  Chat: {
    farmerId: string;
    farmerName?: string;
    farmerAvatar?: string;
  };
  ConversationList: undefined;
  Review: {
    jobPostId: string;
    rateeId: string;
    rateeName?: string;
  };
  EditProfile: undefined;
};

// ─── Worker Tab Navigator ─────────────────────────────────────────────────────

export type WorkerTabParamList = {
  Home: undefined;
  Search: undefined;
  Jobs: { initialTab?: 'applied' | 'upcoming' | 'history' } | undefined;
  Messages: undefined;
  Profile: undefined;
};

// ─── Convenience types ────────────────────────────────────────────────────────

import type { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

/** Nav prop cho root stack — dùng trong hook useNavigation<RootStackNavProp>() */
export type RootStackNavProp = StackNavigationProp<RootStackParamList>;

/** Nav prop cho worker tab — dùng trong hook useNavigation<WorkerTabNavProp>() */
export type WorkerTabNavProp = BottomTabNavigationProp<WorkerTabParamList>;

/** Screen props factory — dùng cho từng screen cụ thể */
export type WorkerHomeScreenProps    = StackScreenProps<RootStackParamList, 'WorkerTabs'>;
export type JobDetailScreenProps     = StackScreenProps<RootStackParamList, 'JobDetail'>;
export type SubmitReportScreenProps  = StackScreenProps<RootStackParamList, 'SubmitReport'>;
export type ReportDetailScreenProps  = StackScreenProps<RootStackParamList, 'ReportDetail'>;
export type ReportHistoryScreenProps = StackScreenProps<RootStackParamList, 'ReportHistory'>;
export type ChatScreenProps          = StackScreenProps<RootStackParamList, 'Chat'>;
export type ReviewScreenProps        = StackScreenProps<RootStackParamList, 'Review'>;
