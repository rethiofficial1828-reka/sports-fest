"use client";

import { motion } from "framer-motion";
import { Scale, Users, AlertCircle, Ban } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      icon: Scale,
      title: "1. Acceptance of Terms",
      content: "By registering an account or accessing the SportsFest platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must immediately cease using the platform."
    },
    {
      icon: Users,
      title: "2. Account Responsibilities",
      content: "Users must provide accurate information. Organizers must be authorized representatives of their respective colleges. You are entirely responsible for maintaining the confidentiality of your session and password."
    },
    {
      icon: AlertCircle,
      title: "3. Event Listings & Cancellation Policy",
      content: "Organizers commit to listing legitimate collegiate tournaments. In the event of a cancellation, organizers must update the event listing status immediately on the portal to prevent athletic teams from traveling under false pretenses."
    },
    {
      icon: Ban,
      title: "4. Abuse & Moderation",
      content: "SportsFest administrators reserve the right to audit, modify, decline, or delete any listing or registration, and block accounts that list spam, violate community guidelines, or threaten the platform's security."
    }
  ];

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Last updated: June 21, 2026</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Welcome to SportsFest. These Terms of Service govern your use of our website, features, and platform services.
          </p>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-xl bg-[#6B46C1]/10 text-[#6B46C1] flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#111827]">{section.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{section.content}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              If you have any questions about these Terms of Service, you can reach out to us at <a href="mailto:hello@sportsfest.in" className="text-[#6B46C1] hover:underline font-bold">hello@sportsfest.in</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
