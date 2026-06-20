export type UserRole = "student" | "organizer" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  college_id?: string;
  department?: string;
  year_of_study?: number;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id?: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  college_name?: string;
  department?: string;
  year_of_study?: number;
  team_name?: string;
  team_members?: TeamMember[];
  payment_status: "pending" | "paid" | "waived";
  payment_ref?: string;
  is_confirmed: boolean;
  registered_at: string;
}

export interface TeamMember {
  name: string;
  email: string;
  college: string;
  department: string;
}
