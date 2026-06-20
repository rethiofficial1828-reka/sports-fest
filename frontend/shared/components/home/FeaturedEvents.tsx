"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import EventCard from "@/frontend/shared/components/events/EventCard";
import { useEvents } from "@/frontend/shared/context/EventContext";

export default function FeaturedEvents() {
  const { events } = useEvents();
  const featuredEvents = events.filter((e) => e.isFeatured && e.status === "approved" && !e.isCancelled);

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView && featuredEvents.length > 0) {
      controls.start("show");
    }
  }, [isInView, controls, featuredEvents]);

  if (featuredEvents.length === 0) return null;

  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-[#111827] tracking-tight mb-2">
              <span className="text-[#6B46C1]">Featured</span> Events
            </h2>
            <p className="text-slate-500 text-sm">Don&apos;t miss out on the biggest tournaments of the season</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button 
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#6B46C1] hover:border-[#6B46C1] transition-colors"
              onClick={() => {
                const scrollContainer = document.getElementById("featured-scroll");
                if (scrollContainer) scrollContainer.scrollBy({ left: -350, behavior: "smooth" });
              }}
            >
              ←
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#6B46C1] hover:border-[#6B46C1] transition-colors"
              onClick={() => {
                const scrollContainer = document.getElementById("featured-scroll");
                if (scrollContainer) scrollContainer.scrollBy({ left: 350, behavior: "smooth" });
              }}
            >
              →
            </button>
          </div>
        </div>

        <motion.div
          ref={containerRef}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1, ease: "easeOut" } }
          }}
          initial="hidden"
          animate={controls}
          id="featured-scroll"
          className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollPaddingLeft: "1rem" }}
        >
          {featuredEvents.map((event) => (
            <motion.div
              key={event.id}
              variants={{
                hidden: { opacity: 0, x: 20 },
                show: { opacity: 1, x: 0, transition: { ease: "easeOut", duration: 0.4 } }
              }}
              className="min-w-[320px] max-w-[360px] snap-start shrink-0"
            >
              <EventCard {...event} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
