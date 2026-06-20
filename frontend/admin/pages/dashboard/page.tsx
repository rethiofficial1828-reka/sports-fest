"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Building2, 
  ShieldAlert, 
  Activity, 
  Loader2, 
  Trash2, 
  ShieldX, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useEvents } from "@/frontend/shared/context/EventContext";
import { MOCK_COLLEGES } from "@/backend/lib/mock-data";

export default function AdminDashboardPage() {
  const { events, deleteEvent, updateEvent, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, []);
  const [colleges, setColleges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsTab, setEventsTab] = useState<"active" | "removed">("active");
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchColleges();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.summary);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  };

  const fetchColleges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/colleges");
      if (res.ok) {
        const data = await res.json();
        setColleges(data);
      }
    } catch (err) {
      console.error("Failed to load colleges:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove the event "${title}"? This will place it in the Removed listings and notify student users.`)) return;
    try {
      await deleteEvent(id);
      fetchAnalytics(); // Re-sync counts
    } catch (e) {
      alert("Failed to remove event.");
    }
  };

  const handleRestoreEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to restore the event "${title}"? This will make it active in the public directories again.`)) return;
    try {
      await updateEvent(id, { isCancelled: false, status: "approved" });
      fetchAnalytics(); // Re-sync counts
    } catch (err) {
      console.error("Failed to restore event:", err);
      alert("Failed to restore event.");
    }
  };

  const handleBlockCollege = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to block "${name}"? This will restrict this institution and automatically remove all events hosted by them.`)) return;

    try {
      const res = await fetch(`/api/admin/colleges?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setColleges(colleges.filter((c) => c.id !== id));
        // Remove all events belonging to this college
        const collegeEvents = events.filter(
          (e) => e.college?.name?.toLowerCase() === name.toLowerCase()
        );
        for (const e of collegeEvents) {
          await deleteEvent(e.id);
        }
        fetchAnalytics(); // Re-sync counts
      } else {
        alert("Failed to block college.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to block college.");
    }
  };

  // Filter events
  const activeEvents = events.filter((e) => !e.isCancelled);
  const removedEvents = events.filter((e) => e.isCancelled);
  const displayedEvents = eventsTab === "active" ? activeEvents : removedEvents;
  const pendingApprovalsCount = events.filter((e) => e.status === "pending").length;

  const statCards = [
    { label: "Pending Approvals", value: pendingApprovalsCount.toString(), icon: ShieldAlert, trend: "Requires Admin Review" },
    { label: "Total Events", value: events.length.toString(), icon: Building2, trend: `${activeEvents.length} Active / ${removedEvents.length} Removed` },
    { label: "Total Users", value: analytics ? analytics.totalUsers.toLocaleString() : "Loading...", icon: Users, trend: "Registered Accounts" },
    { label: "Total Registrations", value: analytics ? analytics.totalRegistrations.toLocaleString() : "Loading...", icon: Activity, trend: `${analytics?.waitlistCount || 0} on Waitlist` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#111827] tracking-tight">Platform Controls</h1>
        <p className="text-slate-500 font-medium mt-1">Directly manage active tournaments and institutions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="surface p-5 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-750 flex items-center justify-center border border-slate-100">
                <stat.icon className="w-5 h-5 text-[#EF4444]" />
              </div>
            </div>
            <h3 className="text-3xl font-display font-extrabold text-[#111827] mb-1">{stat.value}</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-xs text-slate-400 font-medium">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#EF4444]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Colleges Database (Block College) */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-[#111827]">Active Institutions</h2>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{colleges.length} Colleges</span>
            </div>
            
            <div className="surface shadow-sm border border-slate-200 overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">College Name</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {colleges.length === 0 ? (
                      <tr><td colSpan={2} className="p-6 text-center text-slate-500 font-medium">No active colleges.</td></tr>
                    ) : (
                      colleges.map((college) => (
                        <tr key={college.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-[#111827] font-bold">{college.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{college.city}, {college.state}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleBlockCollege(college.id, college.name)} 
                              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-red-150"
                              title="Block College"
                            >
                              <ShieldX className="w-3.5 h-3.5" />
                              Block
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Published Events (Remove / Restore Event) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="font-display text-xl font-bold text-[#111827]">Published Tournaments</h2>
              
              {/* Active vs Removed Tabs */}
              <div className="flex bg-white border border-slate-200 p-1 rounded-xl gap-0.5 self-start sm:self-center">
                <button
                  onClick={() => setEventsTab("active")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    eventsTab === "active"
                      ? "bg-[#EF4444] text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Active ({activeEvents.length})
                </button>
                <button
                  onClick={() => setEventsTab("removed")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    eventsTab === "removed"
                      ? "bg-[#EF4444] text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Removed ({removedEvents.length})
                </button>
              </div>
            </div>
            
            <div className="surface shadow-sm border border-slate-200 overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Event Details</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {displayedEvents.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-6 text-center text-slate-400 font-medium">
                          No {eventsTab} events.
                        </td>
                      </tr>
                    ) : (
                      displayedEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-[#111827]">{event.title}</p>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                              {event.college?.name || 'Hosted Event'}
                              {event.isCancelled && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[9px] font-extrabold uppercase rounded">
                                  <AlertCircle className="w-2 h-2" /> Removed
                                </span>
                              )}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {event.isCancelled ? (
                              <button 
                                onClick={() => handleRestoreEvent(event.id, event.title)} 
                                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#6B46C1] hover:text-[#553C9A] rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-indigo-200"
                                title="Restore Event"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Restore
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleRemoveEvent(event.id, event.title)} 
                                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-red-150"
                                title="Remove Event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            )}
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
      )}
    </div>
  );
}
