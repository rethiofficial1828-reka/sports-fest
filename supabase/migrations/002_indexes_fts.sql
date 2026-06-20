-- =============================================
-- PERFORMANCE INDEXES & FULL-TEXT SEARCH
-- =============================================

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_sport_id ON events(sport_id);
CREATE INDEX idx_events_college_id ON events(college_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_mode ON events(mode);
CREATE INDEX idx_events_level ON events(level);
CREATE INDEX idx_events_is_featured ON events(is_featured) WHERE is_featured = true;
CREATE INDEX idx_events_fts ON events USING GIN(fts);

CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);

CREATE INDEX idx_colleges_city ON colleges(city);
CREATE INDEX idx_colleges_state ON colleges(state);
CREATE INDEX idx_colleges_slug ON colleges(slug);
