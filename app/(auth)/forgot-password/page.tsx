"use client";

import Link from "next/link";
import { Globe, Loader2, AlertCircle, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useForgotStore } from "@/frontend/shared/hooks/useForgotStore";
import { motion } from "framer-motion";

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setEmail, setStep } = useForgotStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email);

      if (error) {
        // Supabase error: e.g., rate limit. Always show generic success for privacy, 
        // but if it's a rate limit error, we might want to warn the user.
        if (error.status === 429) {
          setError("Too many requests. Please wait a minute before trying again.");
          return;
        }
        // Log it silently
        console.error("Reset password error:", error);
      }

      // Proceed to OTP step regardless to prevent email enumeration
      setEmail(data.email);
      setStep("otp");
      router.push("/forgot-password/verify");

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F9]">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
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
            Forgot Password
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Enter your email to receive a recovery code
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

          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  className="input w-full pl-11 pr-4 py-3"
                  placeholder="you@college.edu.in"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-red-500 text-xs font-medium mt-1.5">
                  {form.formState.errors.email.message}
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
                  Send Recovery Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Remember your password?{" "}
            <Link href="/login" className="text-[#6B46C1] hover:text-[#553C9A] font-bold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
