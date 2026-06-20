-- =============================================
-- SPORTSFEST INITIAL SCHEMA
-- =============================================

-- ENUMS
CREATE TYPE event_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'expired');
CREATE TYPE event_mode AS ENUM ('online', 'offline', 'hybrid');
CREATE TYPE event_level AS ENUM ('zonal', 'state', 'national', 'invitational');
CREATE TYPE user_role AS ENUM ('student', 'organizer', 'admin');

-- =============================================
-- TABLES
-- =============================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college_id UUID,
  department TEXT,
  year_of_study INT,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports Categories
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colleges
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_name TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  pincode TEXT,
  logo_url TEXT,
  banner_url TEXT,
  website TEXT,
  established INT,
  college_type TEXT,
  affiliation TEXT,
  is_verified BOOLEAN DEFAULT false,
  events_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events (Core Table)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES sports(id),
  organizer_id UUID NOT NULL REFERENCES profiles(id),
  description TEXT NOT NULL,
  rules TEXT[],
  eligibility TEXT,
  status event_status DEFAULT 'pending',
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ NOT NULL,
  mode event_mode NOT NULL,
  level event_level DEFAULT 'zonal',
  venue_name TEXT,
  venue_city TEXT,
  venue_state TEXT,
  google_maps_url TEXT,
  fee INT DEFAULT 0,
  max_participants INT,
  current_participants INT DEFAULT 0,
  is_team_event BOOLEAN DEFAULT false,
  min_team_size INT DEFAULT 1,
  max_team_size INT DEFAULT 1,
  prize_pool INT,
  prizes_detail TEXT,
  coordinator_name TEXT NOT NULL,
  coordinator_phone TEXT NOT NULL,
  coordinator_email TEXT NOT NULL,
  whatsapp_number TEXT,
  poster_url TEXT NOT NULL,
  external_registration_url TEXT,
  schedule JSONB,
  is_featured BOOLEAN DEFAULT false,
  is_live BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Full-text search vector
  fts TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(venue_city, '') || ' ' ||
      coalesce(venue_name, '')
    )
  ) STORED
);

-- Event Registrations
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT NOT NULL,
  college_name TEXT,
  department TEXT,
  year_of_study INT,
  team_name TEXT,
  team_members JSONB,
  payment_status TEXT DEFAULT 'pending',
  payment_ref TEXT,
  is_confirmed BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- Event Tags (Junction)
CREATE TABLE event_tags (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_id)
);

-- Saved Events (Bookmarks)
CREATE TABLE saved_events (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

-- Event Views
CREATE TABLE event_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  user_id UUID REFERENCES profiles(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for profiles.college_id
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_college
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL;
