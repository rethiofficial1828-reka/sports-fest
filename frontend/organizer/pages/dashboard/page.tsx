"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trophy, Users, Eye, TrendingUp, Calendar, MapPin, Trash2, AlertCircle } from "lucide-react";
import { useEvents } from "@/frontend/shared/context/EventContext";
import { useAuth } from "@/frontend/shared/context/AuthContext";

export default function DashboardPage() {
  const { role, user } = useAuth();
  const { events, deleteEvent, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, []);

  // Get user's college/institution name to filter events (default to IIT Madras for mock organizer)
  const userInstitution = user?.institution || user?.user_metadata?.institution || "IIT Madras";

  // Filter events belonging to this college (or all if admin)
  const collegeEvents = events.filter((event) => 
    role === "admin" || 
    (event.organizerId && event.organizerId === user?.id) ||
    event.college?.name?.toLowerCase() === userInstitution.toLowerCase()
  );

  const activeEventsList = collegeEvents.filter((event) => !event.isCancelled);
  const activeEventsCount = activeEventsList.length;

  // Calculate dynamic stats
  const totalRegistrations = collegeEvents.reduce((acc, curr) => 
    acc + (curr.isCancelled ? 0 : (curr.participantCount || 0)), 0
  );

  const totalRevenue = collegeEvents.reduce((acc, curr) => 
    acc + (curr.isCancelled ? 0 : (curr.fee || 0) * (curr.participantCount || 0)), 0
  );

  // Simulated dynamic page views
  const pageViews = (activeEventsCount * 320) + 145;

  const stats = [
    { label: "Active Events", value: activeEventsCount.toString(), icon: Trophy, trend: "Published Instantly" },
    { label: "Total Registrations", value: totalRegistrations.toLocaleString(), icon: Users, trend: "Athletes Registered" },
    { label: "Page Views", value: pageViews.toLocaleString(), icon: Eye, trend: "Updated live" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, trend: "Registration Earnings" },
  ];

  const handleCancelEvent = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to cancel "${title}"? This will place it in the Removed directory and show a cancellation banner to students.`)) return;
    deleteEvent(id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#111827] tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium mt-1">
            {role === "admin" 
              ? "All collegiate activities dashboard overview." 
              : `Coordinator workspace for ${userInstitution}.`}
          </p>
        </div>
        <Link href="/organizer/create-event" className="btn-primary flex items-center justify-center gap-2 shadow-md">
          <Plus className="w-5 h-5" />
          Create Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="surface p-5 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-[#6B46C1] flex items-center justify-center border border-violet-100">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-display font-extrabold text-[#111827] mb-1">{stat.value}</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-xs text-slate-400 font-medium">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-[#111827]">Your Active Listings</h2>
          <Link href="/organizer/tournaments" className="text-sm font-semibold text-[#6B46C1] hover:text-[#553C9A]">
            View all fests
          </Link>
        </div>
        
        <div className="surface shadow-sm border border-slate-200 overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Event Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registrations</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {collegeEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                      No fests listed yet. Start by creating an event!
                    </td>
                  </tr>
                ) : (
                  collegeEvents.map((event: any) => (
                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shadow-sm border border-slate-200">
                            {event.sport?.icon || '🏆'}
                          </div>
                          <div>
                            <Link href={`/events/${event.slug}`} className="font-bold text-[#111827] hover:text-[#6B46C1] transition-colors">
                              {event.title}
                            </Link>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                              <MapPin className="w-3 h-3" /> {event.college?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {event.isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase rounded-xl">
                            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
                          </span>
                        ) : event.isLive ? (
                          <span className="badge badge-live">Live</span>
                        ) : (
                          <span className="badge bg-amber-50 text-amber-700 border-amber-250 text-[10px] font-bold uppercase rounded-xl">Registration Open</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[100px]">
                            <div className="bg-[#6B46C1] h-1.5 rounded-full" style={{ width: `${Math.min(100, (event.participantCount / 300) * 100)}%` }}></div>
                          </div>
                          <span className="font-bold text-slate-700">{event.participantCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-bold flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(event.eventDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <Link 
                            href={`/events/${event.slug}`} 
                            className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 transition-all shadow-sm"
                          >
                            View Page
                          </Link>
                          {!event.isCancelled && (
                            <button 
                              onClick={() => handleCancelEvent(event.id, event.title)} 
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-xl transition-all shadow-sm inline-flex items-center gap-1"
                              title="Cancel Tournament"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
