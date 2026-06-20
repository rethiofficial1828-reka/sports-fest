"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  AlertOctagon, 
  ShieldCheck, 
  Building2, 
  Flag,
  Check,
  Trash2,
  Loader2
} from "lucide-react";
import { useEvents } from "@/frontend/shared/context/EventContext";

// Initial mock requests
const DEFAULT_VERIFICATIONS: any[] = [];

const DEFAULT_REPORTS: any[] = [];

export default function ApprovalsPage() {
  const { events, deleteEvent, updateEvent } = useEvents();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"verifications" | "reports" | "events">("verifications");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [verRes, repRes] = await Promise.all([
        fetch("/api/admin/verifications"),
        fetch("/api/admin/reports")
      ]);
      
      if (verRes.ok) {
        const data = await verRes.json();
        setVerifications(data);
      }
      
      if (repRes.ok) {
        const data = await repRes.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCollege = async (id: string, collegeName: string) => {
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, collegeName, action: "approve" })
      });
      if (res.ok) {
        setVerifications(verifications.filter((v) => v.id !== id));
        setMessage({
          text: `Successfully verified and approved ${collegeName}!`,
          type: "success"
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to verify college.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to verify college.");
    }
  };

  const handleRejectVerification = async (id: string, collegeName: string) => {
    if (!window.confirm(`Are you sure you want to reject the verification request for "${collegeName}"?`)) return;
    
    try {
      const res = await fetch(`/api/admin/verifications?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setVerifications(verifications.filter((v) => v.id !== id));
        setMessage({
          text: `Rejected verification request for ${collegeName}.`,
          type: "error"
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to reject request.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to reject request.");
    }
  };

  const handleDismissReport = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reports?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setReports(reports.filter((r) => r.id !== id));
        setMessage({
          text: `Report dismissed successfully.`,
          type: "success"
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to dismiss report.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to dismiss report.");
    }
  };

  const handleDeleteReportedEvent = async (reportId: string, eventId: string, title: string) => {
    if (!window.confirm(`Confirm permanent removal of "${title}" based on user reports?`)) return;

    try {
      // 1. Delete event from server
      await deleteEvent(eventId);

      // 2. Clear report
      const res = await fetch(`/api/admin/reports?id=${reportId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setReports(reports.filter((r) => r.id !== reportId));
        setMessage({
          text: `Successfully removed event "${title}" and resolved report.`,
          type: "success"
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to resolve reported event.");
    }
  };

  const handleApproveEvent = async (id: string, title: string) => {
    try {
      await updateEvent(id, { status: "approved", isLive: true });
      setMessage({
        text: `Successfully approved event "${title}"!`,
        type: "success"
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to approve event.");
    }
  };

  const handleRejectEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to reject the event "${title}"?`)) return;
    try {
      await updateEvent(id, { status: "rejected", isLive: false });
      setMessage({
        text: `Rejected event "${title}".`,
        type: "error"
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to reject event.");
    }
  };

  const pendingEvents = events.filter((e) => e.status === "pending");

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#111827] tracking-tight">Approvals & Reports</h1>
        <p className="text-slate-500 font-medium mt-1">Audit verification requests and resolve student flagged reviews.</p>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border rounded-2xl text-sm font-medium flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Selector Toolbar */}
      <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl gap-1 w-fit flex-wrap">
        <button
          onClick={() => setActiveView("verifications")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeView === "verifications"
              ? "bg-[#EF4444] text-white"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Verification Requests ({verifications.length})
        </button>
        <button
          onClick={() => setActiveView("reports")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeView === "reports"
              ? "bg-[#EF4444] text-white"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Reported Listings ({reports.length})
        </button>
        <button
          onClick={() => setActiveView("events")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeView === "events"
              ? "bg-[#EF4444] text-white"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Event Approvals ({pendingEvents.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#EF4444]" />
        </div>
      ) : (
        <div>
          {activeView === "verifications" ? (
            /* VERIFICATIONS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifications.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200 p-8 text-center rounded-3xl text-slate-400 font-medium">
                  All institution verification requests have been resolved!
                </div>
              ) : (
                verifications.map((req) => (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request #{req.id}</span>
                        <span className="text-[10px] font-bold uppercase bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded-md">Pending</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-[#111827]">{req.collegeName}</h3>
                        <p className="text-xs text-slate-500 font-medium">Requested by: {req.requester}</p>
                        <p className="text-xs text-slate-400 font-medium">{req.email}</p>
                        {req.phone && (
                          <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg w-fit mt-1.5 flex items-center gap-1">
                            📞 Verification Contact: {req.phone}
                          </p>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-100">
                        Received on: {req.date}
                      </div>
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleRejectVerification(req.id, req.collegeName)}
                        className="py-2.5 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4 text-slate-400" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerifyCollege(req.id, req.collegeName)}
                        className="py-2.5 bg-[#EF4444] hover:bg-[#D9383A] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : activeView === "reports" ? (
            /* REPORTS ACCORDION/LIST */
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 text-center rounded-3xl text-slate-400 font-medium">
                  No flagged listings at this time.
                </div>
              ) : (
                reports.map((rep) => (
                  <motion.div
                    key={rep.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report #{rep.id}</span>
                        <span className="text-[10px] font-bold uppercase bg-rose-50 border border-rose-250 text-[#EF4444] px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Flag className="w-3 h-3" /> Flagged
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-[#111827] text-base">{rep.eventTitle}</h3>
                        <p className="text-xs text-slate-400 font-medium">Reporter: <span className="text-slate-600 font-bold">{rep.reporter}</span> on {rep.date}</p>
                      </div>

                      <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 text-sm font-medium text-red-750 flex items-start gap-2.5 max-w-2xl">
                        <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm">{rep.reason}</p>
                      </div>
                    </div>

                    <div className="inline-flex gap-3 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleDismissReport(rep.id)}
                        className="px-4 py-2.5 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-slate-400" />
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleDeleteReportedEvent(rep.id, rep.eventId, rep.eventTitle)}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-750 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Event
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            /* EVENT APPROVALS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingEvents.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200 p-8 text-center rounded-3xl text-slate-400 font-medium">
                  No new event approval requests!
                </div>
              ) : (
                pendingEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event ID: {event.id}</span>
                        <span className="text-[10px] font-bold uppercase bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded-md">Pending</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-[#111827]">{event.title}</h3>
                        <p className="text-xs text-slate-550 font-medium mt-1">College: <span className="font-semibold text-slate-700">{event.college?.name}</span></p>
                        <p className="text-xs text-slate-550 font-medium">Sport: <span className="font-semibold text-slate-700">{event.sport?.name}</span></p>
                        <p className="text-xs text-slate-550 font-medium">Fee: <span className="font-semibold text-slate-700">{event.fee === 0 ? "Free" : `₹${event.fee}`}</span></p>
                      </div>
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleRejectEvent(event.id, event.title)}
                        className="py-2.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4 text-slate-400" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveEvent(event.id, event.title)}
                        className="py-2.5 bg-[#EF4444] hover:bg-[#D9383A] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
