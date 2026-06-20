"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight, Trophy, Users, MapPin, Activity } from "lucide-react";
import { SPORTS } from "@/backend/lib/constants/sports";
import { MOCK_EVENTS } from "@/backend/lib/mock-data";
import EventCard from "@/frontend/shared/components/events/EventCard";
import { cn } from "@/backend/lib/utils/cn";

export default function SportCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  
  const sport = SPORTS.find((s) => s.slug === category);
  const events = MOCK_EVENTS.filter((e) => e.sport.name === sport?.name);

  if (!sport) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#F4F4F9]">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-[#111827] mb-4">Sport Not Found</h1>
          <Link href="/events" className="btn-primary">Browse All Sports</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F9] pb-20">
      {/* Hero Area */}
      <div className="bg-white border-b border-slate-200 pt-32 pb-16 relative overflow-hidden">
        {/* Decorative Background Icon */}
        <div 
          className="absolute -right-20 -bottom-20 text-[20rem] opacity-[0.03] pointer-events-none select-none"
          aria-hidden="true"
        >
          {sport.icon}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-sm font-semibold mb-8">
            <Link href="/" className="text-slate-500 hover:text-[#111827] transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link href="/events" className="text-slate-500 hover:text-[#111827] transition-colors">Sports</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-[#6B46C1]">{sport.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-sm border border-slate-100"
                style={{ backgroundColor: `${sport.color}15` }}
              >
                <span className="drop-shadow-sm">{sport.icon}</span>
              </div>
              <div>
                <h1 className="font-display text-5xl font-extrabold text-[#111827] tracking-tight mb-2">
                  {sport.name} Events
                </h1>
                <div className="flex gap-3">
                  <span className="badge bg-slate-100 text-slate-600 border border-slate-200">
                    {sport.type} Sport
                  </span>
                  <span className="badge bg-slate-100 text-slate-600 border border-slate-200">
                    <Activity className="w-3.5 h-3.5 mr-1" /> Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="surface p-4 text-center min-w-[120px] shadow-sm">
                <Trophy className="w-5 h-5 text-[#6B46C1] mx-auto mb-2" />
                <p className="font-bold text-2xl text-[#111827]">{events.length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tournaments</p>
              </div>
              <div className="surface p-4 text-center min-w-[120px] shadow-sm">
                <Users className="w-5 h-5 text-[#6B46C1] mx-auto mb-2" />
                <p className="font-bold text-2xl text-[#111827]">{events.reduce((acc, curr) => acc + curr.participantCount, 0)}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Players</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-[#111827]">
            Active Tournaments
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Sort by:</span>
            <select className="input text-sm py-1.5 px-3">
              <option>Upcoming First</option>
              <option>Registration Closing Soon</option>
              <option>Prize Pool: High to Low</option>
            </select>
          </div>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 surface border-dashed border-2 border-slate-200 bg-slate-50 shadow-none">
            <h3 className="font-display text-xl font-bold text-[#111827] mb-2">No active {sport.name} events</h3>
            <p className="text-slate-500 font-medium mb-6">Check back later or host your own tournament!</p>
            <Link href="/dashboard/create-event" className="btn-primary">
              Host an Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
