import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import { authService, workerProfileService, notificationService } from "../services";
import { registerForPushNotificationsAsync } from "../services/push-notification.service";
import { authTokenService } from "../services/auth-token.service";
import { STORAGE_KEYS } from "../constants/api";

// Global reference to logout function for use in axios interceptors
let forceLogoutRef: (() => Promise<void>) | null = null;
export const forceLogout = async () => {
  if (forceLogoutRef) {
    await forceLogoutRef();
  }
};


interface User {
  id: string;
  name: string;
  email: string;
  roleID: string;
  isDemo?: boolean; // cờ đánh dấu tài khoản demo
}

// Hàm format tên hiển thị, không để lộ @gmail.com
const resolveName = (fullName?: string, email?: string) => {
  if (fullName && fullName.trim() !== "") return fullName;
  if (email && email.includes("@")) return email.split("@")[0];
  return "Người dùng mới";
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleToken: string, roleId?: number) => Promise<void>;
  demoLogin: () => void;
  fetchProfile: () => Promise<void>;
  register: (payload: {
    email: string;
    phoneNumber: string;
    password: string;
    address: string;
    roleId: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const applyUserProfile = useCallback(
    (profile: {
      id: string;
      fullName?: string;
      email?: string;
      roleID?: string;
      isDemo?: boolean;
    }) => {
      setUser({
        id: profile.id,
        name: resolveName(profile.fullName, profile.email),
        email: profile.email || "",
        roleID: profile.roleID || "worker",
        isDemo: profile.isDemo,
      });
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const loginRequest = email.includes("@")
        ? { email, password }
        : { phoneNumber: email, password };
      const response = await authService.login(loginRequest);

      // Dùng response.role trực tiếp từ backend thay vì decode JWT
      // NOTE: Nếu BE thay đổi tên role (khác 'Worker'), cần cập nhật điều kiện này
      if (response.role && response.role !== "Worker") {
        throw new Error("UNAUTHORIZED_ROLE");
      }

      await AsyncStorage.multiSet([[STORAGE_KEYS.AUTH_TOKEN, response.token]]);
      authTokenService.setTokenToMemory(response.token);
      try {
        const profile = await workerProfileService.getProfile();
        const profileWithEmail = {
          ...profile,
          email: response.email || (email.includes("@") ? email : undefined),
        };
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(profileWithEmail),
        );
        applyUserProfile(profileWithEmail);

        // Đăng ký Push Notification
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await notificationService.registerPushToken(pushToken);
        }
      } catch {
        const fbEmail = response.email || email;
        applyUserProfile({
          id: "me",
          fullName: resolveName(undefined, fbEmail),
          email: fbEmail,
          roleID: "worker",
        });
      }
    },
    [applyUserProfile],
  );

  const loginWithGoogle = useCallback(
    async (googleToken: string, roleId = 3) => {
      const response = await authService.googleLogin({ googleToken, roleId });

      // Dùng response.role trực tiếp từ backend thay vì decode JWT
      // NOTE: Nếu BE thay đổi tên role (khác 'Worker'), cần cập nhật điều kiện này
      if (response.role && response.role !== "Worker") {
        throw new Error("UNAUTHORIZED_ROLE");
      }

      await AsyncStorage.multiSet([[STORAGE_KEYS.AUTH_TOKEN, response.token]]);
      authTokenService.setTokenToMemory(response.token);

      try {
        const profile = await workerProfileService.getProfile();
        const profileWithEmail = {
          ...profile,
          email: response.email,
        };
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(profileWithEmail),
        );
        applyUserProfile(profileWithEmail);

        // Đăng ký Push Notification
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await notificationService.registerPushToken(pushToken);
        }
      } catch {
        applyUserProfile({
          id: "me",
          fullName: resolveName(undefined, response.email),
          email: response.email,
          roleID: "worker",
        });
      }
    },
    [applyUserProfile],
  );

  const demoLogin = useCallback(() => {
    applyUserProfile({
      id: "demo",
      fullName: "Tài khoản Demo",
      email: "demo@agrotemp.vn",
      roleID: "worker",
      isDemo: true,
    });
  }, [applyUserProfile]);

  const fetchProfile = useCallback(async () => {
    if (user?.isDemo) return; // Không fetch network nếu là user demo
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      setUser(null);
      return;
    }

    const cachedProfileRaw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    const cachedProfile = cachedProfileRaw
      ? (JSON.parse(cachedProfileRaw) as { email?: string })
      : null;
    try {
      const profile = await workerProfileService.getProfile();
      const profileWithEmail = {
        ...profile,
        email: cachedProfile?.email,
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(profileWithEmail),
      );
      applyUserProfile(profileWithEmail);
    } catch {
      // Giữ nguyên hiện trạng nếu lỗi mạng
    }
  }, [applyUserProfile, user?.isDemo]);

  const register = useCallback(
    async (payload: {
      email: string;
      phoneNumber: string;
      password: string;
      address: string;
      roleId: number;
    }) => {
      const response = await authService.register(payload);
      await AsyncStorage.multiSet([[STORAGE_KEYS.AUTH_TOKEN, response.token]]);
      authTokenService.setTokenToMemory(response.token);

      try {
        const profile = await workerProfileService.getProfile();
        const profileWithEmail = {
          ...profile,
          email: response.email || payload.email,
        };
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(profileWithEmail),
        );
        applyUserProfile(profileWithEmail);
      } catch {
        const fEmail = response.email || payload.email;
        applyUserProfile({
          id: "me",
          fullName: resolveName(undefined, fEmail),
          email: fEmail,
          roleID: String(payload.roleId),
        });
      }
    },
    [applyUserProfile],
  );

  const logout = useCallback(async () => {
    try {
      if (!user?.isDemo) {
        await authService.logout();
      }
    } catch {
      // ignore
    }

    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore if user was not logged in via Google
    }

    setUser(null);
    authTokenService.setTokenToMemory(null);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]).catch(() => undefined);
  }, [user?.isDemo]);

  // Set global reference
  useEffect(() => {
    forceLogoutRef = logout;
    return () => {
      forceLogoutRef = null;
    };
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (user?.isDemo) return;
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      authTokenService.setTokenToMemory(token);
      
      if (!token || authTokenService.isTokenExpired(token)) {
        if (token) {
          // Token exists but is expired, clear everything
          await logout();
        }
        return;
      }

      const cachedProfileRaw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      try {
        if (cachedProfileRaw) {
          // Temporarily apply cached profile to show UI while verifying
          applyUserProfile(JSON.parse(cachedProfileRaw));
        }

        const profile = await workerProfileService.getProfile();
        const cachedProfile = cachedProfileRaw ? JSON.parse(cachedProfileRaw) : null;
        const profileWithEmail = {
          ...profile,
          email: profile.email || cachedProfile?.email,
        };
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(profileWithEmail),
        );
        applyUserProfile(profileWithEmail);

        // Register Push Notification on startup
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await notificationService.registerPushToken(pushToken);
        }
      } catch (error: any) {
        // If it's a 401 (Unauthorized), the token is invalid - logout
        // If it's a network error (backend down) and we have a cached UI, 
        // we might stay logged in but some apps prefer to logout for security.
        // Given the USER's feedback about backend being down, let's clear it
        // if we can't verify the session to avoid "fake" login state.
        if (error?.response?.status === 401 || !cachedProfileRaw) {
          await logout();
        } else {
          // It's a network error but we have cached data.
          // Let's check if the backend is truly unreachable.
          console.log("Auth initialization: Backend unreachable, keeping cached session.");
        }
      }
    };

    initializeAuth().catch(() => undefined);
  }, [applyUserProfile]);

  useEffect(() => {
    if (user && !user.isDemo) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          const deviceName = `${Platform.OS === 'ios' ? 'iOS' : 'Android'} Device`;
          notificationService.registerPushToken(token, deviceName)
            .catch(err => console.log("Failed to register push token with backend", err));
        }
      });
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      demoLogin,
      fetchProfile,
      register,
      logout,
    }),
    [user, login, loginWithGoogle, demoLogin, fetchProfile, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
