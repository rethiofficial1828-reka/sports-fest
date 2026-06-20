"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Trophy, 
  Settings, 
  LogOut,
  Globe,
  Bell,
  Loader2,
  Home,
  Search
} from "lucide-react";
import { cn } from "@/backend/lib/utils/cn";
import { useAuth } from "@/frontend/shared/context/AuthContext";

const SIDEBAR_LINKS = [
  { label: "Home Page", href: "/", icon: Home },
  { label: "Events Directory", href: "/events", icon: Search },
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create Event", href: "/create-event", icon: CalendarPlus },
  { label: "My Tournaments", href: "/tournaments", icon: Trophy },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, role, isLoggedIn, isLoading, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else if (role === "student") {
        router.push("/");
      }
    }
  }, [isLoading, isLoggedIn, role, router]);

  if (isLoading || !isLoggedIn || role === "student") {
    return (
      <div className="min-h-screen bg-[#F4F4F9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B46C1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F9] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col hidden md:flex sticky top-0 h-screen z-40">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-[#111827]">
              <Globe className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="font-display text-lg font-bold text-[#111827] tracking-tight">
              sportsfest.
            </span>
          </Link>
        </div>

        <div className="p-4 flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
            {role === 'admin' ? 'Admin Menu' : 'Organizer Menu'}
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
                      ? "bg-[#6B46C1]/10 text-[#6B46C1] font-bold" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#111827]"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#111827]" />
            <span className="font-display font-bold text-[#111827]">sportsfest.</span>
          </Link>
          <button onClick={logout} className="p-2 text-red-600">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-slate-200 p-4 items-center justify-end sticky top-0 z-30">
          <div className="flex items-center gap-4 relative">
            <button 
              className="p-2 text-slate-400 hover:text-[#111827] transition-colors relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            
            {showNotifications && (
              <div className="absolute top-full mt-2 right-40 w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50">
                <h4 className="font-bold text-[#111827] mb-3">Notifications</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                    New registration for Cricket Championship.
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-sm rounded-lg">
                    Your event has been approved by admin.
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-[#111827]">{user?.user_metadata?.full_name || (role === 'admin' ? 'Super Admin' : 'Organizer')}</p>
                <p className="text-xs text-slate-500 font-medium capitalize">{role || 'Organizer'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#6B46C1]/10 text-[#6B46C1] flex items-center justify-center font-bold">
                {(user?.user_metadata?.full_name || 'O')[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
