import { type Event, type EventCardProps } from "@/frontend/shared/types/event.types";

// ─── Realistic Mock Data ──────────────────────────────────────────────────────

export const MOCK_STATS = {
  totalEvents: 1247,
  activeColleges: 342,
  citiesCovered: 58,
  sportsCategories: 18,
};

export const MOCK_SPORTS = [
  { id: "1", name: "Cricket", slug: "cricket", icon: "🏏", color: "#2ECC71", is_active: true },
  { id: "2", name: "Football", slug: "football", icon: "⚽", color: "#3498DB", is_active: true },
  { id: "3", name: "Basketball", slug: "basketball", icon: "🏀", color: "#E67E22", is_active: true },
  { id: "4", name: "Volleyball", slug: "volleyball", icon: "🏐", color: "#9B59B6", is_active: true },
  { id: "5", name: "Badminton", slug: "badminton", icon: "🏸", color: "#1ABC9C", is_active: true },
  { id: "6", name: "Table Tennis", slug: "table-tennis", icon: "🏓", color: "#E74C3C", is_active: true },
  { id: "7", name: "Chess", slug: "chess", icon: "♟️", color: "#9B59B6", is_active: true },
  { id: "8", name: "Athletics", slug: "athletics", icon: "🏃", color: "#E74C3C", is_active: true },
  { id: "9", name: "Swimming", slug: "swimming", icon: "🏊", color: "#27AEF5", is_active: true },
  { id: "10", name: "Kabaddi", slug: "kabaddi", icon: "🤼", color: "#F39C12", is_active: true },
  { id: "11", name: "Tennis", slug: "tennis", icon: "🎾", color: "#1ABC9C", is_active: true },
  { id: "12", name: "Throwball", slug: "throwball", icon: "🏐", color: "#FF5722", is_active: true },
];

export const MOCK_COLLEGES: any[] = [];

export const MOCK_EVENTS: EventCardProps[] = [];

export const MOCK_FEATURED_EVENTS = MOCK_EVENTS.filter((e) => e.isFeatured);

export const MOCK_EVENT_DETAIL = {
  id: "e1",
  slug: "sportanza-2025-iit-madras-cricket",
  title: "Sportanza 2025 — Inter-College Cricket Championship",
  description: `
Sportanza 2025 is the flagship sports festival of IIT Madras, bringing together the finest cricket talent from colleges across India. This prestigious tournament features T20 format matches played under floodlights on the iconic IIT Madras cricket ground.

With a history spanning over two decades, Sportanza has hosted cricket legends and produced several Ranji Trophy players. The tournament is sanctioned by the Tamil Nadu Cricket Association and follows BCCI-standard rules.

Join us for an electrifying week of cricket, camaraderie, and competition!
  `.trim(),
  eligibility: "Currently enrolled undergraduate or postgraduate students from any recognized college in India. Maximum age: 25 years. Players must carry a valid college ID and bonafide certificate.",
  rules: [
    "Each team must have 11 players + 4 substitutes",
    "T20 format — 20 overs per side",
    "Power play: First 6 overs mandatory",
    "DLS method applies in case of rain",
    "No-ball height limit: waist level",
    "Decision of the on-field umpire is final",
    "Teams must report 30 minutes before match time",
    "Abusive language or unsportsmanlike conduct will lead to disqualification",
  ],
  schedule: [
    { round: "Group Stage - Day 1", date: "2025-08-15", description: "12 teams, 6 matches" },
    { round: "Group Stage - Day 2", date: "2025-08-16", description: "6 matches" },
    { round: "Quarter Finals", date: "2025-08-17", description: "4 matches" },
    { round: "Semi Finals", date: "2025-08-18", description: "2 matches" },
    { round: "Grand Final", date: "2025-08-19", description: "Evening under floodlights" },
  ],
  prizes: [
    { position: "1st", amount: 25000, extra: "Trophy + Medals" },
    { position: "2nd", amount: 15000, extra: "Trophy + Medals" },
    { position: "3rd", amount: 10000, extra: "Medals + Certificate" },
    { position: "Best Batsman", amount: 2000, extra: "Certificate" },
    { position: "Best Bowler", amount: 2000, extra: "Certificate" },
  ],
  college: { id: "c1", name: "IIT Madras", slug: "iit-madras", short_name: "IITM", city: "Chennai", state: "Tamil Nadu", is_verified: true, events_count: 24, logo_url: null },
  sport: MOCK_SPORTS[0],
  eventDate: "2025-08-15T09:00:00Z",
  registrationDeadline: "2025-08-10T23:59:00Z",
  mode: "offline" as const,
  fee: 500,
  posterUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80",
  isLive: false,
  isFeatured: true,
  participantCount: 312,
  maxParticipants: 500,
  prizePool: 50000,
  level: "national" as const,
  venueName: "IIT Madras Cricket Ground",
  venueCity: "Chennai",
  venueState: "Tamil Nadu",
  googleMapsUrl: "https://maps.google.com",
  coordinatorName: "Arjun Krishnamurthy",
  coordinatorPhone: "9876543210",
  coordinatorEmail: "sportanza@iitm.ac.in",
  whatsappNumber: "9876543210",
  isTeamEvent: true,
  minTeamSize: 11,
  maxTeamSize: 15,
};
