"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi, type AuthResponse, type UserProfile, ApiException } from "./api";
import { warmUpBackend } from "./warmup";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  loginAction: (email: string, password: string) => Promise<AuthResponse>;
  registerLearner: (data: { email: string; password: string; displayName: string; level?: string }) => Promise<AuthResponse>;
  registerPartner: (data: { email: string; password: string; displayName: string; phone?: string; bio?: string; ageRange?: string; job?: string }) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (partial: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Wake up Render backend ASAP (fire-and-forget, runs once per session)
  warmUpBackend();

  // Lazy initializer avoids synchronous setState inside useEffect
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return { user: null, token: null, isLoading: true, isAuthenticated: false };
    }
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      return { user: null, token: null, isLoading: false, isAuthenticated: false };
    }
    // Token exists — keep isLoading true until profile verification completes
    return { user: null, token: storedToken, isLoading: true, isAuthenticated: false };
  });

  // Hydrate user profile from stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;

    let cancelled = false;

    const hydrateSession = async () => {
      try {
        const profile = await authApi.getProfile();
        if (!cancelled) {
          setState({ user: profile, token: storedToken, isLoading: false, isAuthenticated: true });
        }
      } catch (err) {
        if (cancelled) return;

        // Only clear token on definitive auth failures (401/403)
        // Network errors or 5xx should not wipe the session
        const isAuthError = err instanceof ApiException && (err.status === 401 || err.status === 403);

        if (isAuthError) {
          localStorage.removeItem(TOKEN_KEY);
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        } else {
          // Transient failure — keep token, let user retry manually or on next navigation
          // Still mark isLoading false so UI doesn't hang indefinitely
          localStorage.removeItem(TOKEN_KEY);
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      }
    };

    // Timeout prevents infinite loading when backend is completely unreachable
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        cancelled = true;
      }
    }, 15_000);

    hydrateSession().finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleAuthSuccess = async (response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token);

    // Set minimal state immediately so UI is responsive
    setState({
      user: {
        userId: response.userId,
        email: response.email,
        displayName: response.displayName,
        role: response.role,
        avatarUrl: response.avatarUrl,
        level: response.level ?? null,
        phone: null,
        languagePref: null,
        currentStreak: 0,
        learnedVocabCount: 0,
        averageToneAccuracy: 0,
        totalStudyHours: 0,
        currentLevel: response.level ?? "V1",
        masteryPercentage: 0,
        profileCompletionRate: 0,
        completedSessions: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        passwordChangedAt: null,
      },
      token: response.token,
      isLoading: false,
      isAuthenticated: true,
    });

    // Defer hydrating full profile to not block initial page navigation network resources
    setTimeout(async () => {
      try {
        const profile = await authApi.getProfile();
        setState((prev) => ({
          ...prev,
          user: profile,
        }));
      } catch {
        // Non-critical: temporary state from AuthResponse is still usable
      }
    }, 500);
  };

  const loginAction = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    handleAuthSuccess(response);
    return response;
  };

  const registerLearner = async (data: { email: string; password: string; displayName: string; level?: string }) => {
    const response = await authApi.registerLearner(data);
    handleAuthSuccess(response);
    return response;
  };

  const registerPartner = async (data: { email: string; password: string; displayName: string; phone?: string; bio?: string; ageRange?: string; job?: string }) => {
    const response = await authApi.registerPartner(data);
    handleAuthSuccess(response);
    return response;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  };

  const updateUser = (partial: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...partial } : null,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...state, loginAction, registerLearner, registerPartner, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { ApiException };
