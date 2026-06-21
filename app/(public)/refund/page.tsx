"use client";

import { motion } from "framer-motion";
import { DollarSign, AlertTriangle, HelpCircle, CheckCircle } from "lucide-react";

export default function RefundPage() {
  const sections = [
    {
      icon: DollarSign,
      title: "1. Listing Fees",
      content: "Hosting and listing tournaments on the SportsFest directory is 100% free for all verified collegiate entities. There are no fees to register as an organizer or publish fests."
    },
    {
      icon: CheckCircle,
      title: "2. Registration and Entry Fees",
      content: "Certain tournaments charge entry fees set directly by the host colleges. SportsFest acts strictly as an informational directory and registration portal. Any registration fees are paid directly to the host college."
    },
    {
      icon: AlertTriangle,
      title: "3. Host Cancellation Refunds",
      content: "If a college tournament is cancelled or postponed, the host college is solely responsible for processing refunds to registered student teams. SportsFest does not collect, manage, or hold registration funds."
    },
    {
      icon: HelpCircle,
      title: "4. Disputes",
      content: "In case of disputes, students must contact the host college's physical education director or student committee using the contact details supplied on the tournament detail page."
    }
  ];

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">Refund Policy</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Last updated: June 21, 2026</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            This Refund Policy explains payment and refund responsibilities for tournament entry fees listed on SportsFest.
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
              If you have any questions about this Refund Policy, you can reach out to us at <a href="mailto:hello@sportsfest.in" className="text-[#6B46C1] hover:underline font-bold">hello@sportsfest.in</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
