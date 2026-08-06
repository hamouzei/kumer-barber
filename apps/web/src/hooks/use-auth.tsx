"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as authLib from "@/lib/auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check sessionStorage first — if a token already exists (e.g. user
    // just logged in and navigated here), trust it immediately instead
    // of forcing a round-trip refreshSession that can race with the
    // AdminGuard redirect.
    if (authLib.isAuthenticated()) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // No token in storage — try restoring the session from the refresh
    // token cookie (covers page-reload / new-tab scenarios).
    authLib
      .refreshSession()
      .then((success) => {
        setIsAuthenticated(success);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const success = await authLib.login(email, password);
      setIsAuthenticated(success);
      return success;
    },
    []
  );

  const logout = useCallback(async () => {
    await authLib.logout();
    setIsAuthenticated(false);
    router.push("/admin/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
