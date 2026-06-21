"use client";

import Link from "next/link";
import { Globe, Loader2, AlertCircle, CheckCircle2, LockKeyhole } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useForgotStore } from "@/frontend/shared/hooks/useForgotStore";
import { motion } from "framer-motion";

const resetSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, "Must contain an uppercase letter.")
    .regex(/[a-z]/, "Must contain a lowercase letter.")
    .regex(/[0-9]/, "Must contain a number.")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { step, reset } = useForgotStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingSession, setIsValidatingSession] = useState(true);

  useEffect(() => {
    // 1. Strict Frontend Check: Force linear flow from step 2
    if (step !== "reset") {
      router.push("/forgot-password");
      return;
    }

    // 2. Strict Backend Check: Verify the secure session cookie
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/check-session");
        const data = await res.json();
        
        if (!data.valid) {
          router.push("/forgot-password");
        } else {
          setIsValidatingSession(false);
        }
      } catch (err) {
        router.push("/forgot-password");
      }
    };
    checkSession();
  }, [step, router]);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password-final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password }),
      });

      const resData = await res.json();
      
      if (!res.ok) {
        setError(resData.error || "Failed to reset password. Session may have expired.");
        setIsLoading(false);
        return;
      }

      reset(); // Clear zustand store
      setSuccess("Your password has been reset successfully. You can now log in.");

    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  if (isValidatingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F9]">
        <Loader2 className="w-8 h-8 text-[#6B46C1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F9]">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
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
            Set New Password
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Please enter a strong password for your account
          </p>
        </div>

        <div className="surface p-8 shadow-xl border border-slate-100 shadow-indigo-500/10 rounded-2xl">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-2"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Success!</h3>
              <p className="text-sm text-slate-500">{success}</p>
              
              <Link href="/login" className="btn-primary w-full py-3.5 mt-6 shadow-md inline-block">
                Go to Login
              </Link>
            </motion.div>
          ) : (
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-bold text-[#111827] mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockKeyhole className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    className="input w-full pl-11 pr-4 py-3"
                    placeholder="••••••••"
                    {...form.register("password")}
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs font-medium mt-1.5">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111827] mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockKeyhole className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    className="input w-full pl-11 pr-4 py-3"
                    placeholder="••••••••"
                    {...form.register("confirmPassword")}
                  />
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-medium mt-1.5">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 mt-2 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 transition-all hover:scale-[1.02]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
