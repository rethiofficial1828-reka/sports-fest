"use client";

import Link from "next/link";
import { Globe, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Verification token is missing.");
      setIsLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const csrfToken = typeof document !== "undefined" ? (document.cookie.match(/(^|;)\s*csrf_token\s*=\s*([^;]+)/)?.[2] || "") : "";
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccess(true);
        } else {
          setError(data.error || "Failed to verify email. Token may be invalid or expired.");
        }
      } catch (err: any) {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="surface p-8 shadow-xl border border-slate-100 shadow-indigo-500/10 rounded-2xl text-center space-y-6">
      {isLoading && (
        <div className="py-6 space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 text-[#6B46C1] animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Verifying Email...</h2>
          <p className="text-sm text-slate-500">Please wait while we confirm your email address.</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-2">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-red-600">Verification Failed</h2>
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600">
            {error}
          </div>
          <p className="text-sm text-slate-500">
            The verification link might be invalid, expired, or already used.
          </p>
          <Link href="/login" className="btn-primary w-full py-3 mt-6 shadow-md inline-block">
            Return to Login
          </Link>
        </div>
      )}

      {success && !isLoading && (
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-emerald-600">Email Verified!</h2>
          <p className="text-sm text-slate-600">
            Thank you! Your email address has been verified successfully. You can now log in.
          </p>
          <Link href="/login" className="btn-primary w-full py-3 mt-6 shadow-md inline-block">
            Go to Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <h1 className="font-display text-3xl font-bold text-[#111827] mb-2 tracking-tight">Email Verification</h1>
          <p className="text-slate-500 font-medium text-sm">Completing your security registration</p>
        </div>

        <Suspense fallback={
          <div className="surface p-8 shadow-xl border border-slate-100 shadow-indigo-500/10 rounded-2xl text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto text-[#6B46C1] animate-spin mb-4" />
            <p className="text-slate-500 text-sm">Loading verification content...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
