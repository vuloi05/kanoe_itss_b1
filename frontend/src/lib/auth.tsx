"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi, type AuthResponse, type UserProfile, ApiException } from "./api";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  loginAction: (email: string, password: string) => Promise<AuthResponse>;
  registerLearner: (data: { email: string; password: string; displayName: string; displayNameJa?: string; level?: string }) => Promise<AuthResponse>;
  registerPartner: (data: { email: string; password: string; displayName: string; displayNameJa?: string; phone?: string; bio?: string }) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (partial: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializer avoids synchronous setState inside useEffect
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return { user: null, token: null, isLoading: true, isAuthenticated: false };
    }
    const storedToken = localStorage.getItem("auth_token");
    if (!storedToken) {
      return { user: null, token: null, isLoading: false, isAuthenticated: false };
    }
    return { user: null, token: storedToken, isLoading: true, isAuthenticated: false };
  });

  // Only runs async profile verification when a token exists but user hasn't been hydrated yet
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (!storedToken) return;

    let cancelled = false;

    // Timeout prevents infinite loading when backend is unreachable
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        localStorage.removeItem("auth_token");
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        cancelled = true;
      }
    }, 5000);

    authApi.getProfile()
      .then((profile) => {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setState({ user: profile, token: storedToken, isLoading: false, isAuthenticated: true });
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(timeoutId);
          localStorage.removeItem("auth_token");
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleAuthSuccess = (response: AuthResponse) => {
    localStorage.setItem("auth_token", response.token);
    setState({
      user: {
        userId: response.userId,
        email: response.email,
        displayName: response.displayName,
        displayNameJa: response.displayNameJa,
        role: response.role,
        avatarUrl: response.avatarUrl,
        phone: null,
        languagePref: null,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        passwordChangedAt: null,
      },
      token: response.token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const loginAction = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    handleAuthSuccess(response);
    return response;
  };

  const registerLearner = async (data: { email: string; password: string; displayName: string; displayNameJa?: string; level?: string }) => {
    const response = await authApi.registerLearner(data);
    handleAuthSuccess(response);
    return response;
  };

  const registerPartner = async (data: { email: string; password: string; displayName: string; displayNameJa?: string; phone?: string; bio?: string }) => {
    const response = await authApi.registerPartner(data);
    handleAuthSuccess(response);
    return response;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
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
