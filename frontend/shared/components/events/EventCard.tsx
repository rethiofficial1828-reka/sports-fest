import Link from "next/link";
import { Calendar, Users, MapPin, GraduationCap, ChevronRight } from "lucide-react";
import { EventCardProps } from "@/frontend/shared/types/event.types";
import { formatDate, formatFee } from "@/backend/lib/utils/date";

export default function EventCard({
  id,
  slug,
  title,
  college,
  sport,
  eventDate,
  fee,
  participantCount,
  level,
  mode,
  isLive,
  isFeatured,
  posterUrl,
}: EventCardProps) {
  return (
    <Link href={`/events/${slug}`} className="block group h-full">
      <div className="surface h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden relative">
        {/* Image Area */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${posterUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isLive && (
              <span className="badge badge-live shadow-sm backdrop-blur-md bg-white/90">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5" />
                LIVE
              </span>
            )}
            {!isLive && isFeatured && (
              <span className="badge badge-pending shadow-sm backdrop-blur-md bg-white/90 text-[#6B46C1] border-[#6B46C1]/20">
                FEATURED
              </span>
            )}
          </div>
          
          <div className="absolute top-3 right-3">
            <span 
              className="sport-pill bg-white/90 backdrop-blur-md text-[#111827] shadow-sm"
            >
              <span>{sport.icon}</span> {sport.name}
            </span>
          </div>
        </div>

        {/* Body Area */}
        <div className="p-5 flex flex-col flex-1 bg-white">
          <div className="mb-4">
            <h3 className="font-display font-bold text-[#111827] text-lg leading-snug line-clamp-2 mb-2 group-hover:text-[#6B46C1] transition-colors">
              {title}
            </h3>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm text-slate-600 flex items-center gap-2 line-clamp-1 font-medium">
                <GraduationCap className="w-4 h-4 flex-shrink-0 text-slate-400" />
                {college.name}
              </p>
              {mode !== "online" && college.city && (
                <p className="text-sm text-slate-500 flex items-center gap-2 line-clamp-1">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  {college.city}, {college.state}
                </p>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4 flex flex-wrap gap-x-5 gap-y-3">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Calendar className="w-4 h-4 text-[#6B46C1]" />
              {formatDate(eventDate)}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Users className="w-4 h-4 text-[#6B46C1]" />
              {participantCount}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold ml-auto">
              {fee === 0 ? (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Free</span>
              ) : (
                <span className="text-[#111827] bg-slate-100 px-2 py-0.5 rounded-md">{formatFee(fee)}</span>
              )}
            </div>
          </div>
          
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {level}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {mode}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#6B46C1] transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
