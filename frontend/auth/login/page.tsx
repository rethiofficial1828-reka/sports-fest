"use client";

import Link from "next/link";
import { Globe, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/frontend/shared/utils/supabase/client";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [devVerificationLink, setDevVerificationLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number>(0);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Lockout countdown timer
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lockoutTimeStr = localStorage.getItem("sportsfest_lockout_until");
      if (lockoutTimeStr) {
        const lockoutTimeVal = parseInt(lockoutTimeStr);
        const timeLeft = Math.ceil((lockoutTimeVal - Date.now()) / 1000);
        if (timeLeft > 0) {
          setLockoutTime(timeLeft);
          const interval = setInterval(() => {
            setLockoutTime((prev) => {
              if (prev <= 1) {
                localStorage.removeItem("sportsfest_lockout_until");
                localStorage.removeItem("sportsfest_login_attempts");
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          return () => clearInterval(interval);
        }
      }
    }
  }, []);

  const handleQuickLogin = (selectedRole: "student" | "organizer" | "admin") => {
    const email = `${selectedRole}@sportsfest.in`;
    const fullName = selectedRole === "student" 
      ? "Student" 
      : selectedRole === "organizer" 
        ? "Organizer" 
        : "Super Admin";
    
    const mockSessionUser = {
      id: `mock-user-${selectedRole}`,
      email,
      role: selectedRole,
      full_name: fullName,
      institution: selectedRole === "organizer" ? "IIT Madras" : undefined,
      user_metadata: {
        full_name: fullName,
        institution: selectedRole === "organizer" ? "IIT Madras" : undefined
      }
    };
    
    const base64Token = btoa(JSON.stringify(mockSessionUser));
    document.cookie = `mock_access_token=${base64Token}; path=/`;
    document.cookie = `session=true; path=/`;
    document.cookie = "mock_session=true; path=/";
    
    localStorage.setItem("mock_user", JSON.stringify(mockSessionUser));
    
    const usersList = JSON.parse(localStorage.getItem("sportsfest_users") || "[]");
    if (!usersList.some((u: any) => u.email === email)) {
      usersList.push(mockSessionUser);
      localStorage.setItem("sportsfest_users", JSON.stringify(usersList));
    }

    if (selectedRole === "student") {
      window.location.href = "/";
    } else if (selectedRole === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleFailedAttempt = () => {
    const attempts = parseInt(localStorage.getItem("sportsfest_login_attempts") || "0") + 1;
    localStorage.setItem("sportsfest_login_attempts", attempts.toString());
    if (attempts >= 5) {
      const until = Date.now() + 60 * 1000;
      localStorage.setItem("sportsfest_lockout_until", until.toString());
      setLockoutTime(60);
      
      const interval = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("sportsfest_lockout_until");
            localStorage.removeItem("sportsfest_login_attempts");
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setError("Too many failed attempts. Login locked for 60 seconds.");
    } else {
      setError(`Invalid email or password. Attempt ${attempts} of 5.`);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setDevVerificationLink(null);
    try {
      const csrfToken = typeof document !== "undefined" ? (document.cookie.match(/(^|;)\s*csrf_token\s*=\s*([^;]+)/)?.[2] || "") : "";
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const resData = await res.json();
      if (!res.ok) {
        if (resData.verificationLink) {
          setDevVerificationLink(resData.verificationLink);
        }
        throw new Error(resData.error || "Invalid email or password.");
      }

      const role = resData.role || "student";

      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "organizer") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
    } catch (err: any) {
      if (err.message === "Failed to fetch" || err.message.includes("fetch")) {
        setError("Network error: Please ensure your Supabase keys are configured in .env.local");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F9]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="text-[#111827]">
              <Globe className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <span className="font-display text-2xl font-bold text-[#111827] tracking-tight">
              sportsfest.
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#111827] mb-2 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 font-medium text-sm">Sign in to your account to continue</p>
        </div>

        <div className="surface p-8 shadow-xl border border-slate-100 shadow-indigo-500/10 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">Email Address</label>
              <input 
                type="email" 
                className="input w-full px-4 py-3" 
                placeholder="you@college.edu.in"
                {...register("email")}
              />
              {errors.email && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-[#111827]">Password</label>
                <Link href="/reset-password" className="text-xs font-semibold text-[#6B46C1] hover:text-[#553C9A] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input 
                type="password" 
                className="input w-full px-4 py-3" 
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.password.message}</p>}
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || isGoogleLoading}
              className="btn-primary w-full py-3.5 mt-2 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-70"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Sign in with Google
          </button>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#6B46C1] hover:text-[#553C9A] font-bold transition-colors">
              Register now
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
