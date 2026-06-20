"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Trophy, ChevronRight, Share2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { formatDate, formatFee } from "@/backend/lib/utils/date";
import { cn } from "@/backend/lib/utils/cn";
import { useEvents } from "@/frontend/shared/context/EventContext";
import { useAuth } from "@/frontend/shared/context/AuthContext";
import { useRouter } from "next/navigation";

const DEFAULT_EVENT_DETAILS = {
  description: "Join us for an exciting collegiate tournament! This event brings together top student talent from across the region to compete in standard formats.",
  eligibility: "Open to all currently enrolled undergraduate and postgraduate students from recognized colleges. Carry a valid college ID and bonafide certificate.",
  rules: [
    "Standard tournament regulations apply.",
    "Decisions of the referees and match officials are final and binding.",
    "Teams must report at the venue at least 30 minutes before the scheduled match time.",
    "Unsportsmanlike conduct will lead to immediate disqualification."
  ],
  prizes: [
    { position: "Winner", amount: 10000, extra: "Trophy + Merit Certificates" },
    { position: "Runner Up", amount: 5000, extra: "Runner Trophy + Certificates" },
    { position: "Third Place", amount: 2500, extra: "Certificates" }
  ],
  coordinatorName: "Sports Committee Coordinator",
  coordinatorPhone: "+91 99999 88888",
  coordinatorEmail: "sportsfest.coord@college.edu.in",
  venueName: "College Sports Arena / Main Ground",
  maxParticipants: 100,
  prizePool: 17500,
  isTeamEvent: true,
  minTeamSize: 2,
  maxTeamSize: 11
};

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { events, updateEvent, fetchEvents } = useEvents();
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Re-fetch events on mount to ensure we have the latest counts and details
  useState(() => {
    fetchEvents();
  });

  // Find the event in the context
  const contextEvent = events.find((e) => e.slug === slug);
  
  const event = contextEvent ? {
    ...DEFAULT_EVENT_DETAILS,
    ...contextEvent,
    description: contextEvent.description || DEFAULT_EVENT_DETAILS.description,
    category: (contextEvent as any).category || "General",
    location: (contextEvent as any).location || DEFAULT_EVENT_DETAILS.venueName || "Sports Arena",
    minParticipants: (contextEvent as any).minParticipants || 1,
    maxParticipants: (contextEvent as any).maxParticipants || DEFAULT_EVENT_DETAILS.maxParticipants || 100,
    isTeamEvent: (contextEvent as any).isTeamEvent !== undefined ? (contextEvent as any).isTeamEvent : DEFAULT_EVENT_DETAILS.isTeamEvent,
    teamSize: (contextEvent as any).teamSize || 1,
    minTeamSize: (contextEvent as any).minTeamSize || DEFAULT_EVENT_DETAILS.minTeamSize || 1,
    maxTeamSize: (contextEvent as any).maxTeamSize || DEFAULT_EVENT_DETAILS.maxTeamSize || 1,
    prizePool: typeof (contextEvent as any).prizePool === 'number' ? (contextEvent as any).prizePool : DEFAULT_EVENT_DETAILS.prizePool,
    prizeFirst: (contextEvent as any).prizeFirst || "Winner Trophy + Merit Certificate",
    prizeSecond: (contextEvent as any).prizeSecond || "Runner Up Trophy + Certificate",
    prizeThird: (contextEvent as any).prizeThird || "Certificate",
    rewardsAdditional: (contextEvent as any).rewardsAdditional || "",
    trophyInfo: (contextEvent as any).trophyInfo || "",
    certificateInfo: (contextEvent as any).certificateInfo || "",
    rules: (contextEvent as any).rules || "",
    eligibility: (contextEvent as any).eligibility || DEFAULT_EVENT_DETAILS.eligibility,
    rulesTeam: (contextEvent as any).rulesTeam || "",
    equipmentRequirements: (contextEvent as any).equipmentRequirements || "",
    conductRules: (contextEvent as any).conductRules || "",
    disqualificationConditions: (contextEvent as any).disqualificationConditions || "",
    coordinatorName: (contextEvent as any).contactName || DEFAULT_EVENT_DETAILS.coordinatorName,
    coordinatorPhone: (contextEvent as any).contactPhone || DEFAULT_EVENT_DETAILS.coordinatorPhone,
    coordinatorEmail: (contextEvent as any).contactEmail || DEFAULT_EVENT_DETAILS.coordinatorEmail,
    collegeName: (contextEvent as any).collegeName || "",
  } : undefined;

  const [activeTab, setActiveTab] = useState("overview");

  const rulesList = typeof event?.rules === "string" && event.rules.trim()
    ? event.rules.split(/[.\n]+/).map(r => r.trim()).filter(Boolean)
    : Array.isArray(event?.rules) ? event.rules : DEFAULT_EVENT_DETAILS.rules;

  const handleRegisterEvent = async () => {
    if (!isLoggedIn) {
      alert("Please log in to register for events.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event?.id,
          eventTitle: event?.title,
          userName: user?.full_name || user?.user_metadata?.full_name || "Student Participant",
          userEmail: user?.email || "student@sportsfest.in",
          college: user?.institution || user?.user_metadata?.institution || "Other College",
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Failed to register.");
        return;
      }

      const responseData = await res.json();
      if (responseData.waitlisted) {
        alert(responseData.message || "Event is full. You have been added to the waitlist.");
        fetchEvents();
        return;
      }

      await fetchEvents();
      
      alert("Successfully registered for this event!");
      
      const extUrl = (event as any)?.registrationUrl || (event as any)?.externalLink;
      if (extUrl) {
        window.open(extUrl, "_blank");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to register. Please try again.");
    }
  };

  const handleShareEvent = async () => {
    const url = window.location.href;
    const title = event?.title || "SportsFest Event";
    const text = event?.description || "Check out this tournament!";

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.error("Web Share failed, fallback to copy:", err);
        copyLink(url);
      }
    } else {
      copyLink(url);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    alert("Event link copied to clipboard!");
  };

  if (!event) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#F4F4F9]">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#111827] mb-4">Event Not Found</h1>
          <p className="text-slate-500 mb-8 font-medium">The tournament you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/events" className="btn-primary block shadow-md">
            Browse All Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F9] pb-20">
      {/* Hero Section */}
      <div className="relative pt-24 pb-12 overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-10 scale-110"
            style={{ backgroundImage: `url(${event.posterUrl})` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full md:w-1/3 max-w-sm shrink-0"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 relative border-4 border-white bg-slate-100">
                <Image
                  src={event.posterUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
                {event.isLive && (
                  <div className="absolute top-4 left-4 badge badge-live shadow-sm backdrop-blur-md bg-white/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5" />
                    LIVE NOW
                  </div>
                )}
              </div>
            </motion.div>

            {/* Header Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              <div className="flex items-center gap-2 text-sm text-[#6B46C1] font-semibold mb-4 bg-[#6B46C1]/10 w-fit px-3 py-1 rounded-full">
                <Link href="/events" className="hover:text-[#553C9A] transition-colors">Events</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#6B46C1]">{event.sport.name}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] mb-6 tracking-tight leading-[1.1]">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <span className="text-sm">{event.sport.icon}</span>
                  </div>
                  <span>{event.college.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span>{event.college.city}, {event.college.state}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: formatDate(event.eventDate).split(",")[0] },
                  { icon: Clock, label: "Registration Closes", value: formatDate(event.registrationDeadline).split(",")[0] },
                  { icon: Users, label: "Participants", value: `${event.participantCount} / ${event.maxParticipants}` },
                  { icon: Trophy, label: "Prize Pool", value: `₹${event.prizePool.toLocaleString()}` },
                ].map((stat, i) => (
                  <div key={i} className="surface p-4 shadow-sm text-center">
                    <stat.icon className="w-5 h-5 text-[#6B46C1] mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="font-bold text-[#111827] text-sm">{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {["overview", "rules", "prizes", "contact"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab
                    ? "border-[#6B46C1] text-[#6B46C1]"
                    : "border-transparent text-slate-500 hover:text-[#111827] hover:border-slate-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1 min-w-0">
            {/* Dynamic Tab Content */}
            <div className="surface p-6 sm:p-10 shadow-sm border border-slate-200 bg-white rounded-2xl">
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-slate max-w-none">
                  <h3 className="font-display text-2xl font-bold text-[#111827] mb-6">About the Event</h3>
                  <div className="text-slate-600 leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                    {event.description}
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6 mt-10">
                    <div>
                      <h4 className="font-display text-lg font-bold text-[#111827] mb-3">Event Location</h4>
                      <p className="text-slate-600 font-medium">{event.location}</p>
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-[#111827] mb-3">Category / Sport Type</h4>
                      <p className="text-slate-600 font-medium capitalize">{event.category} - {event.sport.name}</p>
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#111827] mt-10 mb-4">Eligibility</h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-blue-800 font-medium flex gap-3">
                    <CheckCircle2 className="w-6 h-6 shrink-0 text-blue-500" />
                    <p>{event.eligibility}</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "rules" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#111827] mb-6">Rules & Regulations</h3>
                    <ul className="space-y-4">
                      {rulesList.map((rule: string, idx: number) => (
                        <li key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 items-start">
                          <div className="w-6 h-6 rounded-full bg-[#6B46C1]/10 text-[#6B46C1] flex items-center justify-center shrink-0 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <p className="text-slate-700 font-medium pt-0.5">{rule}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {event.rulesTeam && (
                    <div>
                      <h4 className="font-display text-lg font-bold text-[#111827] mb-3">Team Configuration Rules</h4>
                      <p className="text-slate-600 font-medium whitespace-pre-wrap bg-slate-55 p-4 rounded-xl border border-slate-100">{event.rulesTeam}</p>
                    </div>
                  )}

                  {event.equipmentRequirements && (
                    <div>
                      <h4 className="font-display text-lg font-bold text-[#111827] mb-3">Equipment Requirements</h4>
                      <p className="text-slate-600 font-medium whitespace-pre-wrap bg-slate-55 p-4 rounded-xl border border-slate-100">{event.equipmentRequirements}</p>
                    </div>
                  )}

                  {event.conductRules && (
                    <div>
                      <h4 className="font-display text-lg font-bold text-[#111827] mb-3">Conduct & Code of Discipline</h4>
                      <p className="text-slate-600 font-medium whitespace-pre-wrap bg-slate-55 p-4 rounded-xl border border-slate-100">{event.conductRules}</p>
                    </div>
                  )}

                  {event.disqualificationConditions && (
                    <div>
                      <h4 className="font-display text-lg font-bold text-[#111827] mb-3 text-red-650">Disqualification Conditions</h4>
                      <p className="text-red-700 font-medium whitespace-pre-wrap bg-red-50/50 p-4 rounded-xl border border-red-100">{event.disqualificationConditions}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "prizes" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#111827] mb-1">Prize Distribution</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">Total event prize pool: <span className="text-[#6B46C1] font-bold">₹{event.prizePool.toLocaleString()}</span></p>
                  </div>

                  <div className="grid gap-4">
                    {/* First Prize */}
                    {event.prizeFirst && (
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl shadow-sm">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-[#111827] text-lg">Winner (First Prize)</p>
                            <p className="text-sm text-slate-500 font-medium">{event.trophyInfo || "Winner Trophy + Merit Certificate"}</p>
                          </div>
                        </div>
                        <p className="font-display text-xl font-bold text-[#6B46C1]">{event.prizeFirst}</p>
                      </div>
                    )}

                    {/* Second Prize */}
                    {event.prizeSecond && (
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl shadow-sm">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-[#111827] text-lg">Runner Up (Second Prize)</p>
                            <p className="text-sm text-slate-500 font-medium">Runner Shield + Certificates</p>
                          </div>
                        </div>
                        <p className="font-display text-xl font-bold text-slate-600">{event.prizeSecond}</p>
                      </div>
                    )}

                    {/* Third Prize */}
                    {event.prizeThird && (
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-orange-50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl shadow-sm">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-[#111827] text-lg">Second Runner Up (Third Prize)</p>
                            <p className="text-sm text-slate-500 font-medium">Merit Certificates</p>
                          </div>
                        </div>
                        <p className="font-display text-xl font-bold text-orange-600">{event.prizeThird}</p>
                      </div>
                    )}
                  </div>

                  {event.rewardsAdditional && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mt-6">
                      <h4 className="font-display text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Additional Perks & Rewards</h4>
                      <p className="text-slate-600 font-medium whitespace-pre-wrap text-sm">{event.rewardsAdditional}</p>
                    </div>
                  )}

                  {event.certificateInfo && (
                    <div className="bg-violet-50/50 p-5 rounded-2xl border border-violet-100/50 mt-4 text-xs font-medium text-slate-500">
                      <span className="font-bold text-[#6B46C1]">Certificate Note: </span>{event.certificateInfo}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "contact" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="font-display text-2xl font-bold text-[#111827] mb-6">Contact & Venue</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Event Coordinator</p>
                      <p className="text-[#111827] font-bold text-lg mb-1">{event.coordinatorName}</p>
                      <p className="text-sm text-[#6B46C1] mb-1 font-bold">{event.coordinatorPhone}</p>
                      <p className="text-sm text-slate-600 font-medium">{event.coordinatorEmail}</p>
                      {event.collegeName && (
                        <p className="text-xs text-slate-500 mt-3 border-t border-slate-200 pt-2 font-bold uppercase tracking-wider">Institution: {event.collegeName}</p>
                      )}
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Venue Address</p>
                      <p className="text-[#111827] font-bold text-lg mb-1">{event.location}</p>
                      <p className="text-sm text-slate-600 font-medium">{event.college.name}</p>
                      <p className="text-sm text-slate-500 font-medium">{event.college.city}, {event.college.state}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Registration Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-[140px] surface p-6 shadow-xl border border-slate-200 shadow-indigo-500/10 bg-white rounded-2xl">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Entry Fee</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-4xl font-extrabold text-[#111827]">
                    {event.fee === 0 ? "Free" : `₹${event.fee}`}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleRegisterEvent}
                className="btn-primary w-full py-4 text-lg mb-4 shadow-lg shadow-[#6B46C1]/20 font-bold"
              >
                Register Now
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="btn-secondary w-full py-4 flex justify-center items-center gap-2 mb-4 font-bold"
                >
                  <Share2 className="w-5 h-5" /> Share Event
                </button>

                {showShareOptions && (
                  <div className="absolute top-[60px] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 space-y-2 text-xs">
                    <button 
                      onClick={handleShareEvent} 
                      className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg font-bold flex items-center justify-between"
                    >
                      <span>Web Share / Copy Link</span>
                      <span className="text-[10px] text-slate-400 font-medium">{isCopied ? "Copied!" : "Click"}</span>
                    </button>
                    <a 
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(event.title + " - Join here: " + window.location.href)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block py-2 px-3 hover:bg-slate-50 rounded-lg text-emerald-600 font-bold"
                    >
                      WhatsApp
                    </a>
                    <a 
                      href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block py-2 px-3 hover:bg-slate-50 rounded-lg text-sky-500 font-bold"
                    >
                      Telegram
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-800 font-bold"
                    >
                      Twitter / X
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block py-2 px-3 hover:bg-slate-50 rounded-lg text-blue-700 font-bold"
                    >
                      Facebook
                    </a>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block py-2 px-3 hover:bg-slate-50 rounded-lg text-[#0A66C2] font-bold"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-[#6B46C1] shrink-0" />
                  <div>
                    <p className="font-bold text-[#111827] mb-0.5">Venue Location</p>
                    <p className="text-slate-600 font-medium">{event.location}</p>
                    <p className="text-slate-500 text-xs">{event.college.city}, {event.college.state}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 text-sm">
                  <Users className="w-5 h-5 text-[#6B46C1] shrink-0" />
                  <div>
                    <p className="font-bold text-[#111827] mb-0.5">Team Settings</p>
                    <p className="text-slate-600 font-medium">
                      {event.isTeamEvent ? `${event.minTeamSize}-${event.maxTeamSize} players (Team)` : "Individual Entry"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-sm">
                  <Trophy className="w-5 h-5 text-[#6B46C1] shrink-0" />
                  <div>
                    <p className="font-bold text-[#111827] mb-0.5">Participant Capacity</p>
                    <p className="text-slate-600 font-medium">
                      Max: {event.maxParticipants} | Min: {event.minParticipants}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Slots remaining: {Math.max(0, event.maxParticipants - event.participantCount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
