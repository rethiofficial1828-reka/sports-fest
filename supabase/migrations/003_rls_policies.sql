-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Events Policies
CREATE POLICY "Public can view approved events"
  ON events FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Organizers can view own events (any status)"
  ON events FOR SELECT
  USING (organizer_id = auth.uid());

CREATE POLICY "Admins can view all events"
  ON events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  WITH CHECK (
    auth.uid() = organizer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin'))
  );

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  USING (organizer_id = auth.uid());

CREATE POLICY "Admins can update any event"
  ON events FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Registrations Policies
CREATE POLICY "Event owners can view registrations"
  ON registrations FOR SELECT
  USING (
    event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid())
  );

CREATE POLICY "Users can view own registrations"
  ON registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can register for events"
  ON registrations FOR INSERT
  WITH CHECK (true);

-- Saved Events Policies
CREATE POLICY "Users manage own saved events"
  ON saved_events FOR ALL
  USING (user_id = auth.uid());

-- Colleges - public read
CREATE POLICY "Public can view colleges"
  ON colleges FOR SELECT USING (true);

CREATE POLICY "Admins can manage colleges"
  ON colleges FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Sports - public read
CREATE POLICY "Public can view sports"
  ON sports FOR SELECT USING (true);
