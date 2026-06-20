import Link from "next/link";
import { Globe, Share2, Play, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="text-[#111827]">
                <Globe className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="font-display text-xl font-bold text-[#111827] tracking-tight">
                sportsfest.
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              The premier platform for college students to discover, participate, and host sports tournaments across India.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#6B46C1] hover:border-[#6B46C1] transition-all">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#6B46C1] hover:border-[#6B46C1] transition-all">
                <Play className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-[#111827] mb-6">Explore</h3>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="/events" className="hover:text-[#6B46C1] transition-colors">All Tournaments</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#6B46C1] transition-colors">Host an Event</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[#6B46C1] transition-colors">College Leaderboard</Link></li>
              <li><Link href="/rules" className="hover:text-[#6B46C1] transition-colors">Standard Rules</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-[#111827] mb-6">Legal</h3>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="/privacy" className="hover:text-[#6B46C1] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#6B46C1] transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-[#6B46C1] transition-colors">Refund Policy</Link></li>
              <li><Link href="/guidelines" className="hover:text-[#6B46C1] transition-colors">Community Guidelines</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-[#111827] mb-6">Get in Touch</h3>
            <ul className="space-y-4 text-sm text-slate-500">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href="mailto:hello@sportsfest.in" className="hover:text-[#6B46C1] transition-colors">hello@sportsfest.in</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                <span>IIT Madras Research Park,<br/>Chennai, Tamil Nadu 600113</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 text-center md:text-left">
            &copy; {currentYear} SportsFest Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
