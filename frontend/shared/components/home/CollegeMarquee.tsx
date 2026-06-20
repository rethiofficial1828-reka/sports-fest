"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function CollegeMarquee() {
  const [colleges, setColleges] = useState<any[]>([]);

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const events = await res.json();
          const uniqueCollegesMap = new Map();
          events.forEach((e: any) => {
            if (e.college && e.college.name && e.status === "approved" && !e.isCancelled) {
              const key = e.college.name.toLowerCase().trim();
              if (!uniqueCollegesMap.has(key)) {
                uniqueCollegesMap.set(key, {
                  id: e.college.slug || `col-${Date.now()}-${Math.random()}`,
                  short_name: e.college.short_name || e.college.name.substring(0, 3).toUpperCase(),
                  name: e.college.name,
                  city: e.college.city || "Chennai",
                  state: e.college.state || "Tamil Nadu",
                  is_verified: true,
                });
              }
            }
          });
          const list = Array.from(uniqueCollegesMap.values());
          setColleges(list);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadColleges();
  }, []);

  if (colleges.length === 0) {
    return null;
  }

  const collegesList = [...colleges, ...colleges]; // Duplicate for seamless loop

  return (
    <section className="py-16 bg-white border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 className="text-center font-display text-2xl font-bold text-[#111827] tracking-tight">
          Trusted by <span className="text-[#6B46C1]">Top Colleges</span>
        </h2>
      </div>

      <div className="marquee-container relative flex overflow-x-hidden">
        {/* Left/Right Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        <div className="marquee-content py-4 flex gap-6 px-6">
          {collegesList.map((college, idx) => (
            <div
              key={`${college.id}-${idx}`}
              className="surface flex-shrink-0 w-64 p-4 flex flex-col justify-center items-center text-center gap-2 hover:border-[#6B46C1]/30 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#111827] text-sm">
                  {college.short_name}
                </span>
                {college.is_verified && (
                  <CheckCircle2 className="w-4 h-4 text-[#6B46C1] flex-shrink-0" />
                )}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {college.city}, {college.state}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
