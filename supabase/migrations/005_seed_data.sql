-- =============================================
-- SEED DATA
-- =============================================

-- Sports Categories
INSERT INTO sports (name, slug, icon, color) VALUES
('Cricket', 'cricket', '🏏', '#2ECC71'),
('Football', 'football', '⚽', '#3498DB'),
('Basketball', 'basketball', '🏀', '#E67E22'),
('Volleyball', 'volleyball', '🏐', '#9B59B6'),
('Badminton', 'badminton', '🏸', '#1ABC9C'),
('Table Tennis', 'table-tennis', '🏓', '#E74C3C'),
('Chess', 'chess', '♟', '#34495E'),
('Athletics', 'athletics', '🏃', '#E74C3C'),
('Swimming', 'swimming', '🏊', '#27AEF5'),
('Kabaddi', 'kabaddi', '🤼', '#F39C12'),
('Tennis', 'tennis', '🎾', '#1ABC9C'),
('Throwball', 'throwball', '🏐', '#FF5722'),
('Handball', 'handball', '🤾', '#8E44AD'),
('Kho-Kho', 'kho-kho', '🏃', '#D35400'),
('Boxing', 'boxing', '🥊', '#C0392B'),
('Wrestling', 'wrestling', '🤼', '#7F8C8D'),
('Cycling', 'cycling', '🚴', '#27AE60'),
('Archery', 'archery', '🏹', '#2C3E50');

-- Sample Colleges
INSERT INTO colleges (name, slug, short_name, city, state, college_type, is_verified) VALUES
('Indian Institute of Technology Madras', 'iit-madras', 'IIT Madras', 'Chennai', 'Tamil Nadu', 'Engineering', true),
('Anna University', 'anna-university', 'Anna Univ', 'Chennai', 'Tamil Nadu', 'Engineering', true),
('Vellore Institute of Technology', 'vit-vellore', 'VIT', 'Vellore', 'Tamil Nadu', 'Engineering', true),
('SRM Institute of Science and Technology', 'srm-kattankulathur', 'SRM', 'Kattankulathur', 'Tamil Nadu', 'Engineering', true),
('PSG College of Technology', 'psg-tech', 'PSG Tech', 'Coimbatore', 'Tamil Nadu', 'Engineering', true),
('Amrita Vishwa Vidyapeetham', 'amrita-coimbatore', 'Amrita', 'Coimbatore', 'Tamil Nadu', 'Engineering', true),
('National Institute of Technology Trichy', 'nit-trichy', 'NIT Trichy', 'Tiruchirappalli', 'Tamil Nadu', 'Engineering', true),
('College of Engineering Guindy', 'ceg-guindy', 'CEG', 'Chennai', 'Tamil Nadu', 'Engineering', true),
('IIT Bombay', 'iit-bombay', 'IITB', 'Mumbai', 'Maharashtra', 'Engineering', true),
('BITS Pilani', 'bits-pilani', 'BITS', 'Pilani', 'Rajasthan', 'Engineering', true),
('IIT Delhi', 'iit-delhi', 'IITD', 'New Delhi', 'Delhi', 'Engineering', true),
('NIT Surathkal', 'nit-surathkal', 'NITK', 'Mangalore', 'Karnataka', 'Engineering', true);
