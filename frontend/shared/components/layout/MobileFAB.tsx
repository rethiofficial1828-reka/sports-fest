"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { useAuth } from "@/frontend/shared/context/AuthContext";

export default function MobileFAB() {
  const pathname = usePathname();
  const { isLoggedIn, role } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Don't show on auth pages or dashboard, and ONLY show to logged-in organizers
  const shouldShow = isLoggedIn && role === "organizer" &&
                     !pathname.startsWith("/login") && 
                     !pathname.startsWith("/register") && 
                     !pathname.startsWith("/organizer") &&
                     !pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 md:hidden"
        >
          <Link 
            href="/organizer/create-event"
            className="flex items-center justify-center w-14 h-14 bg-[#6B46C1] text-white rounded-full shadow-[0_8px_30px_rgb(107,70,193,0.4)] hover:bg-[#553C9A] transition-colors"
          >
            <Plus className="w-7 h-7" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
