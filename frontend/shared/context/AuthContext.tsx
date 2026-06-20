"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/frontend/shared/utils/supabase/client";

export type UserRole = "student" | "organizer" | "admin" | null;

interface AuthContextType {
  role: UserRole;
  user: any | null;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const initializeAuth = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setRole(data.role);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch (e) {
      console.error("Failed to check auth session:", e);
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Override window.fetch to automatically inject CSRF token
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      const method = init?.method?.toUpperCase() || "GET";
      if (["POST", "PUT", "DELETE"].includes(method)) {
        const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
        const csrfToken = match ? decodeURIComponent(match[1]) : "";
        if (csrfToken) {
          init = init || {};
          init.headers = {
            ...init.headers,
            "x-csrf-token": csrfToken,
          } as any;
        }
      }
      return originalFetch(input, init);
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    setIsLoading(true);
    try {
      // 1. Sign out of Supabase client first
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Supabase signOut failed:", e);
    }

    try {
      // 2. Clear backend session cookies
      await fetch("/api/auth/session", { method: "POST" });
    } catch (e) {
      console.error("Backend session clear failed:", e);
    }

    // 3. Clear all potential mock/development cookies and localStorage
    try {
      document.cookie = "mock_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "mock_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      localStorage.removeItem("mock_user");
    } catch (e) {}

    // 4. Update state and redirect with a full page reload to clear client caches
    setUser(null);
    setRole(null);
    setIsLoading(false);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ role, user, logout, isLoggedIn: !!user, isLoading }}>
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
