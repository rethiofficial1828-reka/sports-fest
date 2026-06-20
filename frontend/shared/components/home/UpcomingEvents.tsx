"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import EventCard from "@/frontend/shared/components/events/EventCard";
import { useEvents } from "@/frontend/shared/context/EventContext";

export default function UpcomingEvents() {
  const { events } = useEvents();
  const upcomingEvents = events.filter((e) => e.status === "approved" && !e.isCancelled).slice(0, 6);

  if (upcomingEvents.length === 0) {
    return (
      <section className="py-20 bg-[#F4F4F9] text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-[#111827] tracking-tight mb-2">
            <span className="text-[#EF4444]">Upcoming</span> Tournaments
          </h2>
          <p className="text-slate-505 text-sm mb-4">Register now before spots fill up</p>
          <div className="surface p-10 max-w-md mx-auto border border-slate-200 shadow-sm rounded-2xl">
            <p className="text-slate-500 font-medium">No upcoming tournaments listed yet. Start by registering as an organizer and creating one!</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-20 bg-[#F4F4F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-[#111827] tracking-tight mb-2">
              <span className="text-[#EF4444]">Upcoming</span> Tournaments
            </h2>
            <p className="text-slate-500 text-sm">Register now before spots fill up</p>
          </div>
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1, ease: "easeOut" } }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {upcomingEvents.map((event) => (
            <motion.div
              key={event.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.4 } }
              }}
            >
              <EventCard {...event} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Link href="/events" className="btn-secondary px-8 py-4 shadow-sm hover:shadow-md transition-shadow">
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
}
