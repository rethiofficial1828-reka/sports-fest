"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Settings, 
  LogOut,
  Globe,
  Bell,
  Activity,
  AlertOctagon,
  Loader2,
  Check
} from "lucide-react";
import { cn } from "@/backend/lib/utils/cn";
import { useAuth } from "@/frontend/shared/context/AuthContext";

const SIDEBAR_LINKS = [
  { label: "Platform Overview", href: "/admin", icon: Activity },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Approvals & Reports", href: "/admin/approvals", icon: AlertOctagon },
  { label: "Security & Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
  { label: "System Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, role, isLoggedIn, isLoading, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [pathname]);

  const loadNotifications = async () => {
    try {
      const [verRes, repRes, evtRes, regRes, notifRes] = await Promise.all([
        fetch("/api/admin/verifications"),
        fetch("/api/admin/reports"),
        fetch("/api/events"),
        fetch("/api/registrations"),
        fetch("/api/notifications")
      ]);
      
      const verifications = verRes.ok ? await verRes.json() : [];
      const reports = repRes.ok ? await repRes.json() : [];
      const eventsList = evtRes.ok ? await evtRes.json() : [];
      const registrations = regRes.ok ? await regRes.json() : [];
      const apiNotifs = notifRes.ok ? await notifRes.json() : [];
      
      const readNotifs = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("sportsfest_read_notifications") || "[]") : [];

      const list: any[] = [];
      
      apiNotifs.forEach((n: any) => {
        if (!n.isRead && !readNotifs.includes(n.id)) {
          list.push({
            id: n.id,
            text: n.text,
            date: n.date,
            type: n.type || "system"
          });
        }
      });

      verifications.forEach((v: any) => {
        if (v.status === "pending" && !readNotifs.includes(v.id)) {
          list.push({
            id: v.id,
            text: `New verification request from ${v.collegeName}`,
            date: v.date,
            type: "verification"
          });
        }
      });

      reports.forEach((r: any) => {
        if (r.status === "active" && !readNotifs.includes(r.id)) {
          list.push({
            id: r.id,
            text: `Report: "${r.eventTitle}" flagged by ${r.reporter}`,
            date: r.date,
            type: "report"
          });
        }
      });

      eventsList.forEach((e: any) => {
        if (e.status === "pending" && !readNotifs.includes(e.id)) {
          list.push({
            id: e.id,
            text: `Approval Request: New event "${e.title}" from ${e.college?.name || 'Unknown College'}`,
            date: new Date(e.created_at || Date.now()).toISOString().split("T")[0],
            type: "event_approval"
          });
        }
      });

      registrations.forEach((r: any) => {
        if (!readNotifs.includes(r.id)) {
          list.push({
            id: r.id,
            text: `New Registration: ${r.userName} (${r.college}) registered for "${r.eventTitle}"`,
            date: r.date,
            type: "registration"
          });
        }
      });

      setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      if (id.startsWith("nt-")) {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isRead: true })
        });
      } else if (id.startsWith("vr-")) {
        await fetch(`/api/admin/verifications?id=${id}`, { method: "DELETE" });
      } else if (id.startsWith("rep-")) {
        await fetch(`/api/admin/reports?id=${id}`, { method: "DELETE" });
      } else {
        const readNotifs = JSON.parse(localStorage.getItem("sportsfest_read_notifications") || "[]");
        readNotifs.push(id);
        localStorage.setItem("sportsfest_read_notifications", JSON.stringify(readNotifs));
      }
      loadNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else if (role !== "admin") {
        router.push("/");
      }
    }
  }, [isLoading, isLoggedIn, role, router]);

  if (isLoading || !isLoggedIn || role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F4F4F9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#EF4444]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F9] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#111827] border-r border-slate-800 flex-shrink-0 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-white">
              <Globe className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">
              sportsfest.
            </span>
          </Link>
        </div>

        <div className="p-4 flex-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EF4444]" /> Admin Panel
          </p>
          <nav className="space-y-1">
            {SIDEBAR_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-[#EF4444] text-white font-bold" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#111827] p-4 flex items-center justify-between sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-white" />
            <span className="font-display font-bold text-white">sportsfest.</span>
          </Link>
          <button onClick={logout} className="p-2 text-slate-400">
            <LogOut className="w-5 h-5 text-[#EF4444]" />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-slate-200 p-4 items-center justify-end sticky top-0 z-30">
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-[#111827] transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full mt-2 right-44 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50">
                <h4 className="font-bold text-[#111827] mb-3 flex items-center justify-between">
                  <span>System Alerts</span>
                  {notifications.length > 0 && (
                    <span className="text-[10px] font-extrabold uppercase bg-red-50 text-red-650 px-2 py-0.5 rounded-md">
                      {notifications.length} Pending
                    </span>
                  )}
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium text-center py-4">No new alerts to resolve.</p>
                  ) : (
                    notifications.map((notif, i) => (
                      <div 
                        key={i} 
                        className={`p-3 text-xs rounded-xl border flex justify-between items-start gap-2 ${
                          notif.type === "verification" 
                            ? "bg-indigo-50 border-indigo-100 text-indigo-800" 
                            : notif.type === "event_approval"
                              ? "bg-amber-50 border-amber-100 text-amber-800"
                              : notif.type === "registration"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                                : "bg-red-50 border-red-100 text-red-805"
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold leading-relaxed">{notif.text}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">Date: {notif.date}</p>
                        </div>
                        <button 
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors pt-0.5 shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-[#111827]">{user?.user_metadata?.full_name || 'System Admin'}</p>
                <p className="text-xs text-[#EF4444] font-medium">Superuser</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center font-bold">
                SA
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
