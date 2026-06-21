"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/backend/lib/utils/cn";
import { useAuth } from "@/frontend/shared/context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, role, user, logout } = useAuth();

  const links = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    ...(isLoggedIn && (role === "organizer" || role === "admin")
      ? [{ label: "Dashboard", href: "/organizer/dashboard" }]
      : []),
    ...(isLoggedIn && role === "admin"
      ? [{ label: "Admin", href: "/admin" }]
      : []),
    { label: "About", href: "/about" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled ? "bg-white/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white/20 py-3" : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="text-[#111827]">
                <Globe className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <span className="font-display text-xl font-bold text-[#111827] tracking-tight group-hover:text-[#6B46C1] transition-colors">
                sportsfest.
              </span>
            </Link>

             {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors relative py-1",
                      isActive ? "text-[#6B46C1]" : "text-slate-500 hover:text-[#111827]"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B46C1] rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                    👋 {user?.user_metadata?.full_name || user?.email || "User"}
                  </span>
                  <button 
                    onClick={logout}
                    className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-[#111827] transition-colors">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-[#111827] transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <span className="font-display text-xl font-bold text-[#111827]">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-[#111827] bg-slate-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
                {links.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "px-4 py-4 rounded-2xl text-lg font-medium transition-colors",
                        isActive ? "bg-[#6B46C1]/10 text-[#6B46C1]" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-slate-100">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-600 text-center">
                      Logged in as <span className="font-bold text-slate-800">{user?.user_metadata?.full_name || user?.email}</span>
                    </p>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex justify-center py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl text-lg font-bold transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full flex justify-center py-4 text-lg"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
