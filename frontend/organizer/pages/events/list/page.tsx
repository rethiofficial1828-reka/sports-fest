"use client";

import Link from "next/link";
import { Plus, MapPin, Calendar, Search, Trash2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/frontend/shared/context/AuthContext";
import { useEvents } from "@/frontend/shared/context/EventContext";

export default function TournamentsPage() {
  const { role, user, isLoading: authLoading } = useAuth();
  const { events, deleteEvent, updateEvent, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCancelEvent = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to cancel the tournament "${title}"?`)) return;
    deleteEvent(id);
  };

  const handleRestoreEvent = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to restore the tournament "${title}"?`)) return;
    updateEvent(id, { isCancelled: false });

    // Clean up from global cancellation notifications
    try {
      const cancelledList = JSON.parse(localStorage.getItem("sportsfest_cancelled_notifications") || "[]");
      const updatedList = cancelledList.filter((c: any) => c.id !== id);
      localStorage.setItem("sportsfest_cancelled_notifications", JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  // Filter events belonging to this college (or all if admin)
  const userInstitution = user?.institution || user?.user_metadata?.institution || "IIT Madras";

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (role === "admin") return true;

    return (
      (event.organizerId && event.organizerId === user?.id) ||
      event.college?.name?.toLowerCase() === userInstitution.toLowerCase()
    );
  });

  if (authLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B46C1]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#111827] tracking-tight">
            {role === 'admin' ? 'All Events' : 'My Tournaments'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track your sports events.</p>
        </div>
        <Link href="/organizer/create-event" className="btn-primary flex items-center justify-center gap-2 shadow-md">
          <Plus className="w-5 h-5" />
          Create Event
        </Link>
      </div>

      <div className="surface shadow-sm border border-slate-200 overflow-hidden rounded-2xl">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tournaments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10 py-2 text-sm"
            />
          </div>
        </div>
        
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
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">
                    No tournaments found. Start by creating one!
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event: any) => (
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
                            <MapPin className="w-3 h-3" /> {event.college?.name || 'Your College'}
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
                        <span className="badge bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold uppercase rounded-xl">Registration Open</span>
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
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/events/${event.slug}`} 
                          className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 transition-all shadow-sm"
                        >
                          View Listing
                        </Link>
                        {event.isCancelled ? (
                          <button
                            onClick={() => handleRestoreEvent(event.id, event.title)}
                            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#6B46C1] hover:text-[#553C9A] rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-indigo-200 shadow-sm"
                            title="Restore Event"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Restore
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleCancelEvent(event.id, event.title)}
                            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-750 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 border border-red-200 shadow-sm"
                            title="Cancel Event"
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
  );
}
