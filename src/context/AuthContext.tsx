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
import { authService, workerProfileService } from "../services";
import { authTokenService } from "../services/auth-token.service";
import { STORAGE_KEYS } from "../constants/api";

interface User {
  id: string;
  name: string;
  email: string;
  roleID: string;
  isDemo?: boolean; // cờ đánh dấu tài khoản demo
}

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
        name: profile.fullName || profile.email || "User",
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
      } catch {
        applyUserProfile({
          id: "me",
          fullName: response.email || email,
          email: response.email || email,
          roleID: "worker",
        });
      }
    },
    [applyUserProfile],
  );

  const loginWithGoogle = useCallback(
    async (googleToken: string, roleId = 3) => {
      const response = await authService.googleLogin({ googleToken, roleId });
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
      } catch {
        applyUserProfile({
          id: "me",
          fullName: response.email,
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
        applyUserProfile({
          id: "me",
          fullName: response.email || payload.email,
          email: response.email || payload.email,
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

  useEffect(() => {
    const initializeAuth = async () => {
      if (user?.isDemo) return;
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      authTokenService.setTokenToMemory(token);
      if (!token) {
        // Only set null if there is no user currently (specifically handles demo user persistence briefly on reload before demo triggers)
        return;
      }

      try {
        const cachedProfileRaw = await AsyncStorage.getItem(
          STORAGE_KEYS.USER_DATA,
        );
        const cachedProfile = cachedProfileRaw
          ? (JSON.parse(cachedProfileRaw) as { email?: string })
          : null;
        if (cachedProfileRaw) {
          applyUserProfile(JSON.parse(cachedProfileRaw));
        }

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
        setUser(null);
      }
    };

    initializeAuth().catch(() => undefined);
  }, [applyUserProfile]);

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
