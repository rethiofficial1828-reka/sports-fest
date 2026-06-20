"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  ShieldCheck, 
  Flame, 
  Users, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  HelpCircle, 
  Award, 
  Mail, 
  Phone, 
  Laptop,
  CheckCircle2,
  Building2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { MOCK_STATS } from "@/backend/lib/mock-data";

const MISSION_ITEMS = [
  {
    icon: Flame,
    title: "Ignite Sports Spirit",
    description: "Bringing the thrill of inter-collegiate competitions to student athletes across India by making fests easily discoverable.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: ShieldCheck,
    title: "Standardized Hosting",
    description: "Empowering college sports directors and student committees with a robust control panel to manage registrations, teams, and fests.",
    color: "from-[#6B46C1] to-indigo-600",
  },
  {
    icon: Trophy,
    title: "Celebrate Achievements",
    description: "Showcasing winners, prize pools, medals, and certificates to motivate participation and elevate college sports recognition.",
    color: "from-amber-500 to-yellow-500",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Publishing & Tracking",
    desc: "Events go live immediately, bypassing tedious approval bottlenecks. Track registered team sizes, contact info, and payment records in real-time.",
    badge: "For Organizers"
  },
  {
    icon: Laptop,
    title: "Tailored Dashboards",
    desc: "Access a dedicated student workspace or coordinator control desk. No clutter—only the tools you need based on your user role.",
    badge: "Unified Portal"
  },
  {
    icon: AlertCircle,
    title: "Smart Cancellation Intimations",
    desc: "Cancelled events trigger a system-wide alert. Banners appear instantly across directories to ensure athletes never travel to a cancelled tournament.",
    badge: "Safety First"
  },
  {
    icon: Award,
    title: "College Accountability",
    desc: "Platform administrators hold the power to block bad actor colleges or delete spam listings, ensuring a premium, high-integrity directory.",
    badge: "Admin Oversight"
  }
];

const TEAM_MEMBERS = [
  {
    name: "Rethish S",
    role: "Founder & Developer",
    desc: "Cyber Security Student at Nehru Institute of Technology, passionate about ethical hacking, secure application development, and building innovative digital solutions.",
    image: "/images/rethish.jpg",
    email: "rethiofficial1828@gmail.com",
  }
];

const FAQS = [
  {
    q: "How do I register as a college sports organizer?",
    a: "Signing up is simple. Click 'Sign In' and then 'Register' to create an Organizer account. Once registered, you can immediately create events, define sports rules, specify prize pools, and manage student applications."
  },
  {
    q: "Is there any cost associated with listing sports fests?",
    a: "No, listing events and directories on SportsFest is 100% free. Our mission is to promote athletics and increase tournament visibility for college sports across India."
  },
  {
    q: "Can students view and filter fests without logging in?",
    a: "Yes! The public events directory is open to everyone. You can filter tournaments by sport category, venue city, online/offline mode, and registration fee. However, registering for an event requires a Student account."
  },
  {
    q: "How are cancelled events handled to notify participants?",
    a: "If an event is removed or marked cancelled by the admin or the college host, our platform automatically sets its status to cancelled. A bright warning bar displays globally on the events board and the host's tournament list so that teams don't waste time or travel."
  },
  {
    q: "How do we verify colleges hosting tournaments on the portal?",
    a: "Administrators audit college registrations. If a college hosts spam fests or violates standard guidelines, admins can block the college and remove their events instantly using the Admin dashboard."
  }
];

export default function AboutPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="pt-20 bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#6B46C1,transparent_55%)] opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#EF4444,transparent_55%)] opacity-25" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-[#A78BFA]"
          >
            🏆 India's Unified Collegiate Athletics Hub
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-white"
          >
            Connecting Athletes, Fests & <span className="text-[#A78BFA] bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Colleges</span> Nationwide
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto font-medium"
          >
            The premium directory for searching, publishing, and coordinating inter-collegiate sports tournaments.
          </motion.p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 -mt-10">
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl py-8 px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-display font-extrabold text-[#111827]">{MOCK_STATS.activeColleges}+</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Colleges Represented</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-display font-extrabold text-[#111827]">{MOCK_STATS.totalEvents}+</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Tournaments Listed</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-display font-extrabold text-[#111827]">{MOCK_STATS.citiesCovered}+</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Cities Covered</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-display font-extrabold text-[#111827]">{MOCK_STATS.sportsCategories}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Sports Categories</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">Our Core Mission</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-sm sm:text-base">
            We bridge the gap between talented college athletes and tournament organizers, replacing fragmented communication with a unified sports directory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MISSION_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white p-8 shadow-md hover:shadow-xl transition-all border border-slate-100 flex flex-col group rounded-3xl"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-110 duration-300`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed flex-1">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Key Platform Features */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-indigo-950/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Powerful Capabilities</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Standardizing Collegiate Sports Coordination</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base font-medium">
              Say goodbye to messy Google Forms, outdated brochures, and uncoordinated schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 hover:border-indigo-500/50 transition-all flex gap-5 items-start group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                    <span className="text-[10px] font-bold uppercase bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md">{feature.badge}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Team Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">The Builders</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">Our Advisory & Leadership</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-sm sm:text-base">
            SportsFest is backed by experienced physical education directors and student developers dedicated to collegiate sports development.
          </p>
        </div>

        <div className="flex justify-center">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group max-w-md w-full"
            >
              <div className="space-y-6">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/50">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#111827]">{member.name}</h3>
                  <p className="text-sm font-extrabold text-[#6B46C1] uppercase tracking-wider">{member.role}</p>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{member.desc}</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#6B46C1] hover:text-[#553C9A] transition-colors">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {member.email}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-600/10 px-3 py-1 rounded-full border border-violet-600/20">Got Questions?</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">
              Everything you need to know about publishing, searching, and managing fests on SportsFest.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div 
                  key={i} 
                  className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full py-5 px-6 flex items-center justify-between text-left hover:bg-slate-100/50 transition-colors"
                  >
                    <span className="font-bold text-[#111827] text-sm sm:text-base">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-slate-200/50 text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8 sm:p-16 overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,#6B46C1,transparent_50%)] opacity-35" />
          <div className="relative max-w-3xl space-y-6 text-center sm:text-left">
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold leading-tight text-white">Ready to Take Your Game to the Next Level?</h2>
            <p className="text-slate-300 text-base sm:text-lg font-medium">
              Join thousands of student athletes and college organizers listing their sports tournaments on SportsFest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center sm:justify-start">
              <Link href="/events" className="bg-white text-slate-950 hover:bg-slate-100 flex items-center justify-center gap-2 py-4 px-8 text-sm font-bold shadow-md rounded-2xl transition-all">
                Find Tournaments <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
              <Link href="/login" className="px-8 py-4 border border-white/20 hover:bg-white/5 rounded-2xl text-sm font-bold transition-all text-center">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
