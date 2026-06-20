"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal, MapPin, Calendar, Trophy, X, Loader2 } from "lucide-react";
import EventCard from "@/frontend/shared/components/events/EventCard";
import { MOCK_EVENTS } from "@/backend/lib/mock-data";
import { SPORTS } from "@/backend/lib/constants/sports";
import { INDIAN_CITIES } from "@/backend/lib/constants/cities";
import { cn } from "@/backend/lib/utils/cn";
import { createClient } from "@/frontend/shared/utils/supabase/client";

export default function EventsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  
  const [filters, setFilters] = useState({
    sport: "",
    city: "",
    mode: "",
    level: "",
    fee: "all",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      
      const formattedEvents = (data || []).map((e: any) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        college: e.college ? {
          name: e.college.name,
          city: e.college.city,
          state: e.college.state
        } : { name: 'Unknown', city: 'Unknown', state: '' },
        sport: e.sport ? {
          name: e.sport.name,
          icon: e.sport.icon,
          color: e.sport.color
        } : { name: 'Sport', icon: '🏆', color: '#3B82F6' },
        eventDate: e.eventDate,
        fee: e.fee || 0,
        posterUrl: e.posterUrl,
        isLive: e.status === 'approved' || e.status === 'live' || e.isLive,
        isFeatured: e.isFeatured || false,
        participantCount: e.participantCount || 0,
        level: e.level || 'college',
        mode: e.mode || 'offline',
        isCancelled: e.isCancelled || false,
      }));

      setEvents(formattedEvents);
      setIsFallback(false);
    } catch (err) {
      console.warn("Local API fetch failed, falling back to mock data.", err);
      // Fallback to MOCK_EVENTS if DB is not configured
      setEvents(MOCK_EVENTS.filter(e => e.isLive || new Date(e.eventDate) > new Date()));
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logic applied locally on the fetched (or mock) events
  const filteredEvents = events.filter((event) => {
    if (event.isCancelled) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.sport) {
      const selectedSport = SPORTS.find(s => s.slug === filters.sport);
      if (selectedSport && event.sport.name !== selectedSport.name) return false;
    }
    if (filters.city && event.college.city !== filters.city) return false;
    if (filters.mode && event.mode !== filters.mode) return false;
    if (filters.level && event.level !== filters.level) return false;
    if (filters.fee === "free" && event.fee > 0) return false;
    if (filters.fee === "paid" && event.fee === 0) return false;
    return true;
  });

  return (
    <div className="pt-20 min-h-screen bg-[#F4F4F9] pb-20">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-[#111827] tracking-tight">Explore Events</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Find and register for college sports tournaments</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="input w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border-slate-200 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl border transition-colors md:hidden",
                  filtersOpen ? "bg-[#6B46C1]/10 border-[#6B46C1]/30 text-[#6B46C1]" : "bg-white border-slate-200 text-slate-600 shadow-sm"
                )}
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={cn(
            "md:w-64 flex-shrink-0 space-y-8",
            filtersOpen ? "block" : "hidden md:block"
          )}>
            <div className="surface p-6 shadow-md border-0 ring-1 ring-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[#111827] flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Filter className="w-4 h-4 text-[#6B46C1]" /> Filters
                </h3>
                {(filters.sport || filters.city || filters.mode || filters.level || filters.fee !== "all") && (
                  <button
                    onClick={() => setFilters({ sport: "", city: "", mode: "", level: "", fee: "all" })}
                    className="text-xs text-slate-500 hover:text-[#EF4444] font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Sport Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">SPORT</label>
                  <select
                    className="input w-full px-3 py-2 text-sm bg-slate-50"
                    value={filters.sport}
                    onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                  >
                    <option value="">All Sports</option>
                    {SPORTS.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">CITY</label>
                  <select
                    className="input w-full px-3 py-2 text-sm bg-slate-50"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  >
                    <option value="">All Cities</option>
                    {INDIAN_CITIES.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
                  </select>
                </div>

                {/* Mode Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">EVENT MODE</label>
                  <div className="flex flex-wrap gap-2">
                    {["offline", "online", "hybrid"].map((m) => (
                      <button
                        key={m}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border",
                          filters.mode === m
                            ? "bg-[#6B46C1]/10 text-[#6B46C1] border-[#6B46C1]/30 font-bold"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"
                        )}
                        onClick={() => setFilters({ ...filters, mode: filters.mode === m ? "" : m })}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fee Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">ENTRY FEE</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "Any" },
                      { id: "free", label: "Free Only" },
                      { id: "paid", label: "Paid" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                          filters.fee === f.id
                            ? "bg-[#6B46C1]/10 text-[#6B46C1] border-[#6B46C1]/30 font-bold"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"
                        )}
                        onClick={() => setFilters({ ...filters, fee: f.id })}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#6B46C1]" />
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Showing <span className="text-[#111827] font-bold">{filteredEvents.length}</span> events
                  </p>
                </div>

                {filteredEvents.length > 0 ? (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                        }}
                      >
                        <EventCard {...event} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-20 surface rounded-3xl border-dashed border-2 border-slate-200 bg-slate-50 shadow-none">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#111827] mb-2 tracking-tight">No events found</h3>
                    <p className="text-slate-500 text-sm font-medium">
                      Try adjusting your filters or search query to find what you're looking for.
                    </p>
                    <button
                      onClick={() => { setSearchQuery(""); setFilters({ sport: "", city: "", mode: "", level: "", fee: "all" }); }}
                      className="mt-6 btn-secondary shadow-sm"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
