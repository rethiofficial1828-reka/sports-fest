"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function CancellationAnnouncements() {
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const events = await res.json();
          const list = events.filter((e: any) => e.isCancelled);
          const dismissed = JSON.parse(sessionStorage.getItem("dismissed_cancellations") || "[]");
          const active = list.filter((n: any) => !dismissed.includes(n.id));
          setNotifs(active);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    loadNotifs();
    const interval = setInterval(loadNotifs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: string) => {
    try {
      const dismissed = JSON.parse(sessionStorage.getItem("dismissed_cancellations") || "[]");
      dismissed.push(id);
      sessionStorage.setItem("dismissed_cancellations", JSON.stringify(dismissed));
      setNotifs(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (notifs.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 max-w-4xl mx-auto space-y-2 pointer-events-none">
      {notifs.map((n) => (
        <div 
          key={n.id} 
          className="pointer-events-auto flex items-center justify-between p-4 bg-red-650 text-white rounded-2xl shadow-xl shadow-red-500/10 border border-red-500/20 text-sm font-bold"
          style={{ backgroundColor: "#DC2626" }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Notice: "{n.title}" has been cancelled/removed by the administrator.</span>
          </div>
          <button 
            onClick={() => handleDismiss(n.id)}
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors ml-4 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
