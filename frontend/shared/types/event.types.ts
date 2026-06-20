export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  is_active: boolean;
}

export interface College {
  id: string;
  name: string;
  slug: string;
  short_name?: string;
  city: string;
  state: string;
  address?: string;
  logo_url?: string;
  banner_url?: string;
  website?: string;
  established?: number;
  college_type?: string;
  affiliation?: string;
  is_verified: boolean;
  events_count: number;
}

export type EventStatus = "draft" | "pending" | "approved" | "rejected" | "expired";
export type EventMode = "online" | "offline" | "hybrid";
export type EventLevel = "zonal" | "state" | "national" | "invitational";

export interface Event {
  id: string;
  slug: string;
  title: string;
  college_id: string;
  sport_id: string;
  organizer_id: string;
  description: string;
  rules: string[];
  eligibility?: string;
  status: EventStatus;
  event_date: string;
  event_end_date?: string;
  registration_deadline: string;
  mode: EventMode;
  level: EventLevel;
  venue_name?: string;
  venue_city?: string;
  venue_state?: string;
  google_maps_url?: string;
  fee: number;
  max_participants?: number;
  current_participants: number;
  is_team_event: boolean;
  min_team_size: number;
  max_team_size: number;
  prize_pool?: number;
  prizes_detail?: string;
  coordinator_name: string;
  coordinator_phone: string;
  coordinator_email: string;
  whatsapp_number?: string;
  poster_url: string;
  external_registration_url?: string;
  schedule?: ScheduleRound[];
  is_featured: boolean;
  is_live: boolean;
  view_count: number;
  rejection_reason?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined
  colleges?: College;
  sports?: Sport;
  registrations?: { count: number }[];
}

export interface ScheduleRound {
  round: string;
  date: string;
  description: string;
}

export interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  college: { name: string; slug: string; city: string; state: string };
  sport: { name: string; icon: string; color: string };
  eventDate: string;
  registrationDeadline: string;
  mode: EventMode;
  fee: number;
  posterUrl: string;
  isLive: boolean;
  isFeatured: boolean;
  participantCount: number;
  prizePool?: number;
  level: EventLevel;
  registrationUrl?: string;
  isCancelled?: boolean;
  status?: string;
  organizerId?: string;
  description?: string;
  rules?: string[];
  prizes?: any[];
  schedule?: any[];
  coordinatorName?: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  venueName?: string;
  maxParticipants?: number;
  isTeamEvent?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
}

export interface EventFilters {
  sport?: string;
  city?: string;
  mode?: EventMode | "";
  college?: string;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  fee?: "free" | "paid" | "";
  level?: EventLevel | "";
  dateFrom?: string;
  dateTo?: string;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
}
