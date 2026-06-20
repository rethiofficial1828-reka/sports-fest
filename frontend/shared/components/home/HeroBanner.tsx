"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#F4F4F9] via-[#E9E4F5] to-[#F4F4F9] animate-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left Text Content */}
          <motion.div 
            className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="w-2.5 h-2.5 bg-[#FF3B30]" />
              <span className="text-[#6B46C1] font-bold text-xs uppercase tracking-[0.2em]">
                NEW SPORTSFEST PLATFORM
              </span>
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#111827] leading-[1.1] tracking-tight mb-8">
              Unleash Your <br className="hidden lg:block" />
              Athletic Potential.
            </h1>
            
            <p className="text-lg text-[#4B5563] mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              The premier platform for college students to discover, participate, and host sports tournaments across India. Build your identity on the field.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/events" className="btn-primary px-8 py-4 text-lg w-full sm:w-auto">
                Discover Events
              </Link>
            </div>
          </motion.div>

          {/* Right 3D Image */}
          <motion.div 
            className="flex-1 w-full max-w-xl lg:max-w-2xl relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative aspect-square w-full"
            >
              <Image
                src="/hero-3d.png"
                alt="3D Sports Elements Floating"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs font-bold text-[#111827] uppercase tracking-widest hidden md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="w-5 h-8 border-2 border-[#111827] rounded-full flex justify-center p-1">
          <motion.div 
            className="w-1 h-2 bg-[#111827] rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
        Explore Now
      </motion.div>
    </div>
  );
}
