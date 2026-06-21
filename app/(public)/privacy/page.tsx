"use client";

import { motion } from "framer-motion";
import { Shield, Eye, Lock, FileText } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Shield,
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us when creating a Student or Organizer account, such as your full name, email address, phone number, and college or institution affiliation. We also collect tournament details and listing configurations provided by coordinators."
    },
    {
      icon: Eye,
      title: "2. How We Use Your Information",
      content: "We use the information collected to facilitate tournament registration, verify collegiate affiliations, communicate updates about fests (including instant cancellation notices), prevent spam, and maintain the safety and integrity of the sports directory."
    },
    {
      icon: Lock,
      title: "3. Data Security",
      content: "We implement industry-standard administrative, technical, and physical security measures to safeguard your personal data. This includes token-based API authentication, CSRF double-submit token validations, and password hashing using bcrypt."
    },
    {
      icon: FileText,
      title: "4. Third-Party Services",
      content: "We use Supabase for authentication services and database management, and Resend for transactional email delivery (such as password reset links and verification emails). We do not sell or lease your personal information to third parties."
    }
  ];

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Last updated: June 21, 2026</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            At SportsFest, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, store, use, and protect your information when you access our platform.
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
              If you have any questions about this Privacy Policy, you can reach out to us at <a href="mailto:hello@sportsfest.in" className="text-[#6B46C1] hover:underline font-bold">hello@sportsfest.in</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
