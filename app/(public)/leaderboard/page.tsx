"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award, Star } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const colleges = [
    { rank: 1, name: "Indian Institute of Technology Madras", points: 1250, events: 15 },
    { rank: 2, name: "National Institute of Technology Trichy", points: 980, events: 12 },
    { rank: 3, name: "Anna University, Guindy", points: 850, events: 10 },
    { rank: 4, name: "Vellore Institute of Technology", points: 720, events: 8 },
    { rank: 5, name: "SRM Institute of Science and Technology", points: 640, events: 7 },
  ];

  return (
    <div className="pt-24 pb-16 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">College Leaderboard</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base max-w-2xl mx-auto">
            Top performing colleges based on tournament participation and victories across all active sports festivals.
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[#6B46C1]" />
              <h2 className="text-xl font-bold text-[#111827]">Current Standings</h2>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="space-y-4">
              {colleges.map((college, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-[#6B46C1]/30 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-lg text-slate-700 shadow-inner">
                      {college.rank === 1 ? <Medal className="w-6 h-6 text-yellow-500" /> : 
                       college.rank === 2 ? <Medal className="w-6 h-6 text-slate-400" /> :
                       college.rank === 3 ? <Medal className="w-6 h-6 text-amber-600" /> :
                       `#${college.rank}`}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#111827]">{college.name}</h3>
                      <p className="text-sm text-slate-500">{college.events} Tournaments Participated</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-display font-extrabold text-2xl text-[#6B46C1]">{college.points}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Points</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-slate-500 mb-6">Want to see your college at the top?</p>
              <Link href="/events" className="btn-primary">
                Register for Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
