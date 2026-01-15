import React, { createContext, useState, useContext, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "worker" | "farmer";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    role: "worker" | "farmer"
  ) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "worker" | "farmer"
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (
    email: string,
    password: string,
    role: "worker" | "farmer"
  ) => {
    // TODO: Implement actual API call
    // Giả lập đăng nhập
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUser({
      id: "1",
      name: email.split("@")[0],
      email,
      role,
    });
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "worker" | "farmer"
  ) => {
    // TODO: Implement actual API call
    // Giả lập đăng ký
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUser({
      id: "1",
      name,
      email,
      role,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
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
