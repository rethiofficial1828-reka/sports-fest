"use client";

import { motion } from "framer-motion";
import { Gavel, AlertCircle, ShieldCheck, FileCheck2 } from "lucide-react";

export default function RulesPage() {
  const rules = [
    {
      icon: ShieldCheck,
      title: "1. Eligibility & Verification",
      content: "All participating students must carry their original physical college ID card and a government-issued photo ID (Aadhar/Driving License) on the day of the event. Failure to produce valid ID will result in immediate disqualification."
    },
    {
      icon: Gavel,
      title: "2. Code of Conduct",
      content: "Participants must maintain discipline and sportsmanship. Use of foul language, misbehavior with referees, or damage to host college property will lead to the entire contingent being disqualified and reported to their respective institution."
    },
    {
      icon: FileCheck2,
      title: "3. Registration Validity",
      content: "Registrations are strictly non-transferable. Only the students whose names are on the official registration list submitted through the college registration link will be permitted to play. Substitutions are only allowed before the registration deadline."
    },
    {
      icon: AlertCircle,
      title: "4. Referee Decisions",
      content: "The decisions of the referees, umpires, and event coordinators are final and binding. Any disputes must be raised formally by the team captain to the sports committee within 30 minutes of the match conclusion."
    }
  ];

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">Standard Rules</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base max-w-2xl mx-auto">
            General guidelines and code of conduct applicable to all tournaments listed on SportsFest.
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            While each specific tournament may have its own detailed sport-specific rules on its event page, the following standard rules apply universally to every event registered through the platform.
          </p>

          <div className="space-y-6">
            {rules.map((rule, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex gap-4 items-start"
              >
                <div className="p-3 bg-white border border-slate-200 rounded-xl shrink-0 shadow-sm">
                  <rule.icon className="w-6 h-6 text-[#6B46C1]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">{rule.title}</h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {rule.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-[#6B46C1]/5 border border-[#6B46C1]/20 rounded-2xl flex items-center gap-4">
             <AlertCircle className="w-8 h-8 text-[#6B46C1] shrink-0" />
             <p className="text-sm font-medium text-[#111827]">
               <strong>Note:</strong> Host colleges reserve the right to amend these rules. Always check the specific tournament detail page for any sport-specific variations or additional requirements.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
