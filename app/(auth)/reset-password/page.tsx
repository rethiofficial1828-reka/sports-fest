"use client";

import Link from "next/link";
import { Globe, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const resetSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ForgotFormValues = z.infer<typeof forgotSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const forgotForm = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onForgotSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const csrfToken = typeof document !== "undefined" ? (document.cookie.match(/(^|;)\s*csrf_token\s*=\s*([^;]+)/)?.[2] || "") : "";
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok) {
        setSuccess(resData.message || "Instructions to reset your password have been sent to your email.");
        if (resData.resetLink) {
          setDevResetLink(resData.resetLink);
        }
      } else {
        setError(resData.error || "Failed to request password reset.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetFormValues) => {
    const passwordStr = data.password;
    if (
      passwordStr.length < 8 ||
      !/[A-Z]/.test(passwordStr) ||
      !/[a-z]/.test(passwordStr) ||
      !/[0-9]/.test(passwordStr) ||
      !/[^A-Za-z0-9]/.test(passwordStr)
    ) {
      setError("Password must be 8+ chars and contain upper, lower, number, and special character.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const csrfToken = typeof document !== "undefined" ? (document.cookie.match(/(^|;)\s*csrf_token\s*=\s*([^;]+)/)?.[2] || "") : "";
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ token, password: data.password }),
      });
      const resData = await res.json();
      if (res.ok) {
        setSuccess("Password reset successful. You can now login with your new password.");
      } else {
        setError(resData.error || "Failed to reset password. Link may be expired.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="surface p-8 shadow-xl border border-slate-100 shadow-indigo-500/10 rounded-2xl">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center space-y-4 py-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Success</h3>
          <p className="text-sm text-slate-500">{success}</p>
          
          {devResetLink && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
              <p className="text-xs text-indigo-700 font-bold mb-2">Development Mode Link:</p>
              <Link href={devResetLink} className="btn-primary w-full py-2.5 inline-block text-xs font-bold shadow-sm">
                Follow Reset Link to Set New Password
              </Link>
            </div>
          )}

          <Link href="/login" className="btn-primary w-full py-3 mt-6 shadow-md inline-block">
            Go to Login
          </Link>
        </div>
      ) : token ? (
        // Reset Password confirmation form
        <form className="space-y-5" onSubmit={resetForm.handleSubmit(onResetSubmit)}>
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-2">New Password</label>
            <input
              type="password"
              className="input w-full px-4 py-3"
              placeholder="••••••••"
              {...resetForm.register("password")}
            />
            {resetForm.formState.errors.password && (
              <p className="text-red-500 text-xs font-medium mt-1.5">
                {resetForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#111827] mb-2">Confirm Password</label>
            <input
              type="password"
              className="input w-full px-4 py-3"
              placeholder="••••••••"
              {...resetForm.register("confirmPassword")}
            />
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-red-500 text-xs font-medium mt-1.5">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3.5 mt-2 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
          </button>
        </form>
      ) : (
        // Request Reset email form
        <form className="space-y-5" onSubmit={forgotForm.handleSubmit(onForgotSubmit)}>
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-2">Email Address</label>
            <input
              type="email"
              className="input w-full px-4 py-3"
              placeholder="you@college.edu.in"
              {...forgotForm.register("email")}
            />
            {forgotForm.formState.errors.email && (
              <p className="text-red-500 text-xs font-medium mt-1.5">
                {forgotForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3.5 mt-2 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
          </button>
        </form>
      )}

      {!success && (
        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Remember your password?{" "}
          <Link href="/login" className="text-[#6B46C1] hover:text-[#553C9A] font-bold transition-colors">
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="font-display text-3xl font-bold text-[#111827] mb-2 tracking-tight">
            Reset Password
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Securely upgrade or recover your credentials
          </p>
        </div>

        <Suspense
          fallback={
            <div className="surface p-8 shadow-xl border border-slate-100 shadow-indigo-500/10 rounded-2xl text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto text-[#6B46C1] animate-spin mb-4" />
              <p className="text-slate-500 text-sm">Loading content...</p>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
