-- XEITH AMR - D1 Database Schema
-- Run with: wrangler d1 execute xeith-amr --file=functions/db/schema.sql

-- Users table (minimal, privacy-first)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,              -- UUID, generated client-side
  display_name TEXT NOT NULL,       -- User-chosen, not unique
  email_hash TEXT,                  -- SHA-256 hash of email for deduplication (optional)
  avatar_seed TEXT,                 -- Deterministic avatar generator seed
  language TEXT DEFAULT 'en',       -- Preferred language
  created_at INTEGER NOT NULL,      -- Unix timestamp
  updated_at INTEGER NOT NULL,      -- Unix timestamp
  last_active_at INTEGER,           -- Unix timestamp
  is_anonymous INTEGER DEFAULT 1,   -- 1 = local-only, 0 = linked to account
  consent_version INTEGER DEFAULT 1 -- Terms/privacy version agreed to
);

-- Index for user updates
CREATE INDEX IF NOT EXISTS idx_users_updated ON users(updated_at DESC);

-- User stats (points, streak, etc.) - denormalized for fast leaderboard reads
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  photos_submitted INTEGER DEFAULT 0,
  facts_learned INTEGER DEFAULT 0,
  updated_at INTEGER NOT NULL
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_stats_points ON user_stats(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_streak ON user_stats(streak DESC);

-- Achievements/badges
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,              -- e.g., 'first-lesson', 'streak-7', 'photo-master'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,               -- Emoji or icon identifier
  category TEXT NOT NULL,           -- 'learning', 'streak', 'social', 'game', 'photo'
  points_reward INTEGER DEFAULT 0,
  criteria TEXT NOT NULL            -- JSON describing unlock criteria
);

-- User achievements (many-to-many)
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, achievement_id)
);

-- Follows (social graph)
CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Leaderboards (materialized views, refreshed periodically)
CREATE TABLE IF NOT EXISTS leaderboard_global (
  rank INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  avatar_seed TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS leaderboard_weekly (
  week INTEGER NOT NULL,            -- ISO week number
  year INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  avatar_seed TEXT,
  PRIMARY KEY (week, year, rank)
);

CREATE TABLE IF NOT EXISTS leaderboard_streak (
  rank INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  streak INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  avatar_seed TEXT,
  updated_at INTEGER NOT NULL
);

-- Photo challenge submissions
CREATE TABLE IF NOT EXISTS photo_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_date TEXT NOT NULL,     -- YYYY-MM-DD
  challenge_type TEXT NOT NULL,     -- 'PHOTO_CHALLENGE'
  image_url TEXT NOT NULL,          -- R2 object key or URL
  caption TEXT,
  status TEXT DEFAULT 'pending',    -- 'pending', 'approved', 'rejected'
  points_awarded INTEGER DEFAULT 0,
  reviewed_by TEXT,                 -- Admin user ID
  reviewed_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_photos_user ON photo_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_date ON photo_submissions(challenge_date);
CREATE INDEX IF NOT EXISTS idx_photos_status ON photo_submissions(status);

-- Activity feed (for friend activity)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,               -- 'lesson_complete', 'challenge_complete', 'game_win', 'achievement_unlock', 'photo_submit', 'streak_milestone'
  data TEXT,                        -- JSON with type-specific data
  points INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- Daily/weekly challenge completion tracking
CREATE TABLE IF NOT EXISTS challenge_completions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,       -- e.g., 'daily-2024-01-15', 'week-2024-03-q1'
  challenge_type TEXT NOT NULL,     -- 'daily', 'weekly'
  completed_at INTEGER NOT NULL,
  points_earned INTEGER NOT NULL,
  PRIMARY KEY (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_challenges_user ON challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_date ON challenge_completions(challenge_id);

-- Data export/deletion requests (GDPR/NDPA compliance)
CREATE TABLE IF NOT EXISTS data_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,               -- 'export', 'delete'
  status TEXT DEFAULT 'pending',    -- 'pending', 'processing', 'completed', 'failed'
  requested_at INTEGER NOT NULL,
  completed_at INTEGER,
  download_url TEXT                 -- For export requests
);

-- Insert default achievements
INSERT OR IGNORE INTO achievements (id, name, description, icon, category, points_reward, criteria) VALUES
('first-lesson', 'First Steps', 'Complete your first AMR lesson', '🎓', 'learning', 10, '{"type": "lessons_completed", "threshold": 1}'),
('lesson-master', 'Lesson Master', 'Complete all available lessons', '📚', 'learning', 100, '{"type": "lessons_completed", "threshold": 999}'),
('streak-3', 'Getting Started', 'Maintain a 3-day streak', '🔥', 'streak', 25, '{"type": "streak", "threshold": 3}'),
('streak-7', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 50, '{"type": "streak", "threshold": 7}'),
('streak-30', 'Monthly Master', 'Maintain a 30-day streak', '🏆', 'streak', 200, '{"type": "streak", "threshold": 30}'),
('streak-100', 'Centurion', 'Maintain a 100-day streak', '💯', 'streak', 500, '{"type": "streak", "threshold": 100}'),
('challenge-daily', 'Daily Challenger', 'Complete 10 daily challenges', '📅', 'learning', 50, '{"type": "challenges_completed", "threshold": 10}'),
('challenge-weekly', 'Weekly Winner', 'Complete 5 weekly challenges', '📅', 'learning', 75, '{"type": "challenges_completed", "threshold": 5, "challenge_type": "weekly"}'),
('game-bacteria', 'Bacteria Brawler', 'Win the bacteria simulation', '🦠', 'game', 50, '{"type": "games_won", "pathogen": "bacteria"}'),
('game-virus', 'Virus Guardian', 'Win the virus simulation', '🛡️', 'game', 50, '{"type": "games_won", "pathogen": "virus"}'),
('game-fungus', 'Fungus Fighter', 'Win the fungus simulation', '🍄', 'game', 50, '{"type": "games_won", "pathogen": "fungus"}'),
('game-parasite', 'Parasite Protector', 'Win the parasite simulation', '🪱', 'game', 50, '{"type": "games_won", "pathogen": "parasite"}'),
('big-b-slayer', 'Big B Slayer', 'Defeat Big B the superbug', '👑', 'game', 200, '{"type": "boss_defeated", "boss": "big-b"}'),
('photo-first', 'Snapshot', 'Submit your first photo challenge', '📸', 'photo', 25, '{"type": "photos_submitted", "threshold": 1}'),
('photo-10', 'Photographer', 'Submit 10 photo challenges', '📸', 'photo', 100, '{"type": "photos_submitted", "threshold": 10}'),
('photo-approved', 'Approved', 'Have a photo challenge approved', '✅', 'photo', 50, '{"type": "photos_approved", "threshold": 1}'),
('social-butterfly', 'Social Butterfly', 'Follow 5 users', '🦋', 'social', 50, '{"type": "following_count", "threshold": 5}'),
('influencer', 'Influencer', 'Have 10 followers', '⭐', 'social', 100, '{"type": "follower_count", "threshold": 10}'),
('fact-collector', 'Fact Collector', 'Learn 50 facts', '🧠', 'learning', 50, '{"type": "facts_learned", "threshold": 50}'),
('polyglot', 'Polyglot', 'Switch languages 5 times', '🌍', 'learning', 25, '{"type": "language_switches", "threshold": 5}');

-- Trigger to update user_stats updated_at
CREATE TRIGGER IF NOT EXISTS update_user_stats_timestamp
AFTER UPDATE ON user_stats
BEGIN
  UPDATE user_stats SET updated_at = strftime('%s', 'now') WHERE user_id = NEW.user_id;
END;

-- Trigger to update users updated_at
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;