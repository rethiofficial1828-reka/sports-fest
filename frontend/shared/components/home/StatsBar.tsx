"use client";

import { motion } from "framer-motion";
import { Calendar, GraduationCap, MapPin, Trophy } from "lucide-react";

import { useEffect, useState } from "react";

export default function StatsBar() {
  const [stats, setStats] = useState({
    activeEvents: 0,
    colleges: 0,
    cities: 0,
    prizes: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const events = await res.json();
          const activeEvents = events.filter((e: any) => !e.isCancelled && e.status === "approved").length;
          
          const uniqueColleges = new Set(
            events.map((e: any) => e.college?.name?.toLowerCase().trim()).filter(Boolean)
          );
          
          const uniqueCities = new Set(
            events.map((e: any) => e.college?.city?.toLowerCase().trim()).filter(Boolean)
          );
 
          const totalPrizes = events.reduce((sum: number, e: any) => {
            if (e.isCancelled || e.status !== "approved") return sum;
            return sum + (Number(e.prizePool) || 0);
          }, 0);
 
          setStats({
            activeEvents,
            colleges: uniqueColleges.size,
            cities: uniqueCities.size,
            prizes: totalPrizes,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
  }, []);

  const statItems = [
    { label: "Active Events", value: `${stats.activeEvents}`, icon: Calendar },
    { label: "Colleges Registered", value: `${stats.colleges}`, icon: GraduationCap },
    { label: "Cities Covered", value: `${stats.cities}`, icon: MapPin },
    { label: "Prizes Offered", value: `₹${stats.prizes.toLocaleString()}`, icon: Trophy },
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-100 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F4F4F9] flex items-center justify-center mb-5 text-[#6B46C1]">
                <stat.icon className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-4xl font-bold text-[#111827] mb-1 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
