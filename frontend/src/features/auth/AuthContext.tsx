import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { login } from "./auth.api";
import type {
  AuthUser,
  LoginPayload,
} from "./auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const loginUser = async (
    payload: LoginPayload,
  ) => {
    setIsLoading(true);

    try {
      const response = await login(payload);

      localStorage.setItem(
        "accessToken",
        response.data.token,
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user),
      );

      setUser(response.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}