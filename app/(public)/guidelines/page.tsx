"use client";

import { motion } from "framer-motion";
import { Smile, Award, ShieldAlert, Heart } from "lucide-react";

export default function GuidelinesPage() {
  const sections = [
    {
      icon: Smile,
      title: "1. Respectful Interactions",
      content: "All athletes, organizers, coaches, and administrators should communicate with respect. Harassment, hate speech, or derogatory comments targeting any team or individual are strictly prohibited."
    },
    {
      icon: Award,
      title: "2. Fair Play & Sportsmanship",
      content: "Integrity is core to sports. Teams must represent their colleges honestly. Submitting fake registrations or misrepresenting academic status violates our core guidelines."
    },
    {
      icon: ShieldAlert,
      title: "3. Accurate Listings",
      content: "Organizers must provide true descriptions, contact numbers, rules, and entry fees. Spam listings or clickbait titles will result in the college host profile being flagged and blocked."
    },
    {
      icon: Heart,
      title: "4. Supporting Student Athletics",
      content: "Our goal is to promote college sports across India. Help other students by sharing accurate results, posting rules, and updating tournaments promptly."
    }
  ];

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">Community Guidelines</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Last updated: June 21, 2026</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            SportsFest is designed to foster a safe, positive, and competitive environment for collegiate sports across India. These guidelines outline expectations for all participants.
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
              If you have any questions about these Community Guidelines, you can reach out to us at <a href="mailto:hello@sportsfest.in" className="text-[#6B46C1] hover:underline font-bold">hello@sportsfest.in</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
