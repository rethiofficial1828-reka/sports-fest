"use client";

import Link from "next/link";
import { Globe, Loader2, AlertCircle, ArrowRight, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useForgotStore } from "@/frontend/shared/hooks/useForgotStore";
import { motion } from "framer-motion";

const otpSchema = z.object({
  otp: z.string().length(6, { message: "Code must be exactly 6 digits." }).regex(/^\d+$/, "Code must contain only numbers."),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function VerifyOtpPage() {
  const router = useRouter();
  const { email, step, setStep } = useForgotStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // If no email or accessed out of order, push back to start
    if (!email || step !== "otp") {
      router.push("/forgot-password");
    }
  }, [email, step, router]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpFormValues) => {
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: data.otp }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setError(resData.error || "Invalid or expired code.");
        return;
      }

      setStep("reset");
      // Force a hard navigation to guarantee the cookie is sent and state is fully refreshed
      window.location.href = "/reset-password";
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    
    setCooldown(60);
    setError(null);
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        if (res.status === 429) {
          setError("Too many requests. Please wait before trying again.");
        } else {
          setError("Failed to resend code.");
        }
      }
    } catch (err) {
      setError("Network error while resending code.");
    }
  };

  if (!email) return null; // Prevent flicker while redirecting

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F9]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
            Check your email
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            We sent a 6-digit code to <span className="text-[#111827] font-bold">{email}</span>
          </p>
        </div>

        <div className="surface p-8 shadow-xl border border-slate-100 shadow-indigo-500/10 rounded-2xl">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2 text-center">Enter Recovery Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  className="input w-full pl-11 pr-4 py-3 tracking-widest font-mono text-center text-lg font-bold"
                  placeholder="000000"
                  {...form.register("otp")}
                />
              </div>
              {form.formState.errors.otp && (
                <p className="text-red-500 text-xs font-medium mt-1.5 text-center">
                  {form.formState.errors.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 mt-2 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 transition-all hover:scale-[1.02]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Verify Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium">
            <p className="text-slate-500 mb-2">Didn't receive the code?</p>
            <button 
              onClick={handleResend}
              disabled={cooldown > 0}
              className="text-[#6B46C1] hover:text-[#553C9A] font-bold transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
