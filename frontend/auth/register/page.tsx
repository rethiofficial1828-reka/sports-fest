"use client";

import Link from "next/link";
import { Globe, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/frontend/shared/utils/supabase/client";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  role: z.enum(["student", "organizer"]),
  institution: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  contactNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "organizer") {
    if (!data.institution || data.institution.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Institution name is required for organizers",
        path: ["institution"]
      });
    }
    if (!data.contactNumber || data.contactNumber.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A valid contact number (min 10 digits) is required for college verification",
        path: ["contactNumber"]
      });
    }
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devVerificationLink, setDevVerificationLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "student" }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const csrfToken = typeof document !== "undefined" ? (document.cookie.match(/(^|;)\s*csrf_token\s*=\s*([^;]+)/)?.[2] || "") : "";
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to register.");
      }

      if (resData.verificationLink) {
        setSuccess("Registration successful! Please verify your email.");
        setDevVerificationLink(resData.verificationLink);
        setIsLoading(false);
        return;
      }

      // Automatically log the user in after registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (loginRes.ok) {
        if (data.role === "student") {
          window.location.href = "/";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    } finally {
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
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://sports-fest.vercel.app"}/auth/callback`,
        },
      });
      if (authError) throw authError;
    } catch (err: any) {
      if (err.message === "Failed to fetch" || err.message.includes("fetch")) {
        setError("Network error: Please ensure your Supabase keys are configured in .env.local");
      } else {
        setError(err.message || "Failed to sign up with Google.");
      }
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F9]">
      <div className="w-full max-w-md my-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="text-[#111827]">
              <Globe className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <span className="font-display text-2xl font-bold text-[#111827] tracking-tight">
              sportsfest.
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#111827] mb-2 tracking-tight">Create an account</h1>
          <p className="text-slate-500 font-medium text-sm">Join the largest college sports platform</p>
        </div>

        <div className="surface p-8 shadow-xl border border-slate-100 shadow-indigo-500/10 rounded-2xl">
          {success ? (
            <div className="text-center space-y-4 py-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Success</h3>
              <p className="text-sm text-slate-500">{success}</p>

              <Link href="/login" className="btn-primary w-full py-3 mt-6 shadow-md inline-block">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className={`mb-6 p-4 border rounded-xl text-sm font-medium flex items-start gap-3 bg-red-50 border-red-200 text-red-600`}>
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-2">First Name</label>
                    <input type="text" className="input w-full px-4 py-3" placeholder="John" {...register("firstName")} />
                    {errors.firstName && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#111827] mb-2">Last Name</label>
                    <input type="text" className="input w-full px-4 py-3" placeholder="Doe" {...register("lastName")} />
                    {errors.lastName && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.lastName.message}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">Account Type</label>
                  <select className="input w-full px-4 py-3" {...register("role")}>
                    <option value="student">Student / Participant</option>
                    <option value="organizer">College / Organizer</option>
                  </select>
                </div>

                {selectedRole === "organizer" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Institution / College Name</label>
                      <input type="text" className="input w-full px-4 py-3" placeholder="e.g. National Institute of Technology" {...register("institution")} />
                      {errors.institution && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.institution.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111827] mb-2">Verification Contact Number</label>
                      <input type="tel" className="input w-full px-4 py-3" placeholder="e.g. +91 9876543210" {...register("contactNumber")} />
                      {errors.contactNumber && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.contactNumber.message}</p>}
                      <p className="text-[11px] text-slate-400 font-medium mt-1">Required for administrators to contact and verify your college.</p>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">Email Address</label>
                  <input type="email" className="input w-full px-4 py-3" placeholder="you@college.edu.in" {...register("email")} />
                  {errors.email && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.email.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#111827] mb-2">Password</label>
                  <input type="password" className="input w-full px-4 py-3" placeholder="••••••••" {...register("password")} />
                  <p className="text-xs text-slate-500 mt-2 font-medium">Must be at least 8 characters long</p>
                  {errors.password && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.password.message}</p>}
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading || isGoogleLoading}
                  className="btn-primary w-full py-3.5 mt-2 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
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
                Sign up with Google
              </button>

              <div className="mt-8 text-center text-sm font-medium text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-[#6B46C1] hover:text-[#553C9A] font-bold transition-colors">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
