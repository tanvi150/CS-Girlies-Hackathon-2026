PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_name TEXT NOT NULL,
    site_description TEXT NOT NULL,
    daily_crack_limit INTEGER NOT NULL DEFAULT 1
);

INSERT INTO settings (site_name, site_description, daily_crack_limit) 
VALUES('Luckily', 'your pocket fortune cookie to make your day', 1);

CREATE TABLE IF NOT EXISTS categories(
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL UNIQUE,
    category_description TEXT
);

CREATE TABLE IF NOT EXISTS moods(
    mood_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mood_name TEXT NOT NULL UNIQUE,
    mood_emoji TEXT  
);

CREATE TABLE IF NOT EXISTS users (
    user_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token   TEXT UNIQUE,          
    display_name    TEXT,
    email           TEXT UNIQUE,          
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cookies (
    cookie_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    mood_id INTEGER NOT NULL,
    cookie_message TEXT NOT NULL,
    min_lucky_number INTEGER NOT NULL DEFAULT 1,
    max_lucky_number INTEGER NOT NULL DEFAULT 99,
    challenge_text TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_modified_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (mood_id) REFERENCES moods(mood_id)
);

CREATE INDEX IF NOT EXISTS idx_cookies_active ON cookies(is_active);
CREATE INDEX IF NOT EXISTS idx_cookies_category ON cookies(category_id);
CREATE INDEX IF NOT EXISTS idx_cookies_mood ON cookies(mood_id);

CREATE TABLE IF NOT EXISTS cookie_openings (
    opening_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cookie_id INTEGER NOT NULL,
    user_id INTEGER,
    real_lucky_number INTEGER NOT NULL,
    opened_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (cookie_id) REFERENCES cookies(cookie_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_openings_user ON cookie_openings(user_id);
CREATE INDEX IF NOT EXISTS idx_openings_cookie ON cookie_openings(cookie_id);
CREATE INDEX IF NOT EXISTS idx_openings_opened_at ON cookie_openings(opened_at);

INSERT INTO categories (category_name, category_description) VALUES
    ('Relationships', 'Fortunes about relationships and connection'),
    ('Career', 'Fortunes about work and ambition'),
    ('Wellbeing', 'Fortunes about wellbeing and vitality'),
    ('Wisdom', 'Fortunes about growth and reflection'),
    ('Wealth', 'Fortunes about abundance and opportunity'),
    ('Humor', 'Lighthearted, funny fortunes');

INSERT INTO moods (mood_name, mood_emoji) VALUES
    ('Uplifting', '✨'),
    ('Playful', '😄'),
    ('Reflective', '🌙'),
    ('Bold', '🔥'),
    ('Calm', '🍃');

INSERT INTO cookies (cookie_message, category_id, mood_id, challenge_text, min_lucky_number, max_lucky_number) VALUES
    ('A fresh opportunity is closer than you think.', 2, 1, 'Send one message today that you have been putting off.', 1, 99),
    ('The people who matter most are watching you grow.', 1, 3, 'Tell someone specific why you appreciate them.', 1, 99),
    ('Rest is not laziness — it is preparation.', 3, 5, 'Go to bed 30 minutes earlier tonight.', 1, 99),
    ('Your laughter is contagious; use it more often.', 6, 2, 'Make one person laugh out loud today.', 1, 99),
    ('Small savings today become big freedom tomorrow.', 5, 4, 'Skip one impulse purchase this week.', 1, 99);

COMMIT;