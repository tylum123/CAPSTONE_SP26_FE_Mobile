import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { authService, workerProfileService } from "../services";
import { STORAGE_KEYS } from "../constants/api";

interface User {
  id: string;
  name: string;
  email: string;
  roleID: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleToken: string, roleId?: number) => Promise<void>;
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

  const applyUserProfile = (profile: {
    id: string;
    fullName?: string;
    email?: string;
    roleID?: string;
  }) => {
    setUser({
      id: profile.id,
      name: profile.fullName || profile.email || "",
      email: profile.email || "",
      roleID: profile.roleID || "worker",
    });
  };

  const login = async (email: string, password: string) => {
    const loginRequest = email.includes("@")
      ? { email, password }
      : { phoneNumber: email, password };
    const response = await authService.login(loginRequest);
    await AsyncStorage.multiSet([[STORAGE_KEYS.AUTH_TOKEN, response.token]]);
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
  };

  const loginWithGoogle = async (googleToken: string, roleId = 3) => {
    const response = await authService.googleLogin({ googleToken, roleId });
    await AsyncStorage.multiSet([[STORAGE_KEYS.AUTH_TOKEN, response.token]]);

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
  };

  const fetchProfile = async () => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      setUser(null);
      return;
    }

    const cachedProfileRaw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    const cachedProfile = cachedProfileRaw
      ? (JSON.parse(cachedProfileRaw) as { email?: string })
      : null;
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
  };

  const register = async (payload: {
    email: string;
    phoneNumber: string;
    password: string;
    address: string;
    roleId: number;
  }) => {
    const response = await authService.register(payload);
    await AsyncStorage.multiSet([[STORAGE_KEYS.AUTH_TOKEN, response.token]]);

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
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore API logout failure and clear local session anyway
    }

    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore if user was not logged in via Google
    }

    setUser(null);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]).catch(() => undefined);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setUser(null);
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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        fetchProfile,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
