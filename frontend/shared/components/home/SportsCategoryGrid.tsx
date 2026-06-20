"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SPORTS } from "@/backend/lib/constants/sports";

export default function SportsCategoryGrid() {
  return (
    <section className="py-20 bg-[#F4F4F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-[#111827] tracking-tight mb-2">
              Browse by Sport
            </h2>
            <p className="text-slate-500 text-sm">Find events for your favorite sports across India</p>
          </div>
          <Link href="/events" className="text-sm font-semibold text-[#6B46C1] hover:text-[#553C9A] transition-colors">
            View all sports →
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05, ease: "easeOut" } }
          }}
          className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
        >
          {SPORTS.map((sport) => (
            <motion.div 
              key={sport.slug} 
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.3 } }
              }}
            >
              <Link
                href={`/sport/${sport.slug}`}
                className="group surface hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-5 text-center flex flex-col justify-center items-center gap-3 aspect-square"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${sport.color}15` }}
                >
                  <span className="drop-shadow-sm">{sport.icon}</span>
                </div>
                <h3 className="font-semibold text-sm text-[#111827]">
                  {sport.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
