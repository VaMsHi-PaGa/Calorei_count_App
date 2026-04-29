"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  signup as apiSignup,
  login as apiLogin,
  refreshToken as apiRefreshToken,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  storeTokens,
  clearTokens,
  getStoredTokens,
  type User,
} from "@/services/api";

type UserContextValue = {
  user: User | null;
  loading: boolean;
  authReady: boolean;
  error: string;
  signup: (
    email: string,
    password: string,
    height: number,
    age: number,
    gender: string,
    firstName?: string,
    lastName?: string,
    preferredName?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(
    typeof window !== "undefined" ? false : true
  );
  const [error, setError] = useState("");

  const redirectAfterAuth = useCallback((u: User) => {
    if (!u.onboarding_complete) {
      router.push("/onboarding");
    }
  }, [router]);

  // Restore session from stored tokens on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const restore = async () => {
      try {
        const tokens = getStoredTokens();
        if (!tokens) {
          if (!cancelled) setAuthReady(true);
          return;
        }

        // Try to refresh the token to verify it's still valid
        try {
          const response = await apiRefreshToken(tokens.refreshToken);
          if (!cancelled) {
            storeTokens(response.access_token, response.refresh_token);
            setUser(response.user);
          }
        } catch (err) {
          console.error("Failed to refresh token on restore:", err);
          clearTokens();
          if (!cancelled) {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    };
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      height: number,
      age: number,
      gender: string,
      firstName?: string,
      lastName?: string,
      preferredName?: string
    ) => {
      setError("");
      setLoading(true);
      try {
        const response = await apiSignup(email, password, height, age, gender, firstName, lastName, preferredName);
        storeTokens(response.access_token, response.refresh_token);
        setUser(response.user);
        redirectAfterAuth(response.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to sign up.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [redirectAfterAuth]
  );

  const login = useCallback(async (email: string, password: string) => {
    setError("");
    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      storeTokens(response.access_token, response.refresh_token);
      setUser(response.user);
      redirectAfterAuth(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to log in.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [redirectAfterAuth]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setError("");
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setError("");
    try {
      await apiForgotPassword(email);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to request password reset.";
      setError(message);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      setError("");
      setLoading(true);
      try {
        const response = await apiResetPassword(token, newPassword);
        storeTokens(response.access_token, response.refresh_token);
        setUser(response.user);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to reset password.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      loading,
      authReady,
      error,
      signup,
      login,
      logout,
      forgotPassword,
      resetPassword,
    }),
    [user, loading, authReady, error, signup, login, logout, forgotPassword, resetPassword]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside <UserProvider>");
  }
  return ctx;
}
