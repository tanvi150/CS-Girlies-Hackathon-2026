const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const db = new sqlite3.Database('./database.db');

// Helper to get or create user
function getOrCreateUser(sessionToken, callback) {
  db.get(
    'SELECT user_id FROM users WHERE session_token = ?',
    [sessionToken],
    (err, user) => {
      if (err) return callback(err);
      if (user) return callback(null, user.user_id);
      
      db.run(
        'INSERT INTO users (session_token) VALUES (?)',
        [sessionToken],
        function(err) {
          if (err) return callback(err);
          callback(null, this.lastID);
        }
      );
    }
  );
}

// Helper to detect mood and category from text
function detectMoodAndCategory(text) {
  const moodKeywords = {
    'Uplifting': ['hopeful', 'optimistic', 'positive', 'excited', 'happy', 'joyful', 'bright', 'grateful', 'thankful', 'blessed'],
    'Playful': ['playful', 'fun', 'silly', 'cheerful', 'lighthearted', 'amused', 'joyful'],
    'Reflective': ['contemplative', 'thoughtful', 'reflective', 'pensive', 'deep', 'quiet', 'introspective'],
    'Bold': ['bold', 'confident', 'determined', 'ambitious', 'driven', 'fearless', 'strong'],
    'Calm': ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'grounded', 'centered']
  };
  
  const categoryKeywords = {
    'Career': ['career', 'work', 'job', 'business', 'professional', 'interview', 'promotion', 'boss', 'salary', 'project'],
    'Relationships': ['relationship', 'love', 'partner', 'dating', 'marriage', 'friend', 'family', 'connection', 'heart'],
    'Wellbeing': ['wellness', 'health', 'mind', 'body', 'peace', 'balance', 'calm', 'stress', 'anxiety', 'worry'],
    'Wisdom': ['growth', 'develop', 'improve', 'learn', 'evolve', 'change', 'better', 'wisdom', 'knowledge'],
    'Wealth': ['wealth', 'money', 'finance', 'saving', 'investment', 'abundance', 'prosperity'],
    'Humor': ['funny', 'humor', 'laugh', 'joke', 'playful', 'light', 'silly']
  };
  
  const lowerText = text.toLowerCase();
  
  // Detect mood
  let detectedMood = 'Uplifting';
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(word => lowerText.includes(word))) {
      detectedMood = mood;
      break;
    }
  }
  
  // Detect category
  let detectedCategory = 'General';
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(word => lowerText.includes(word))) {
      detectedCategory = category;
      break;
    }
  }
  
  return { mood: detectedMood, category: detectedCategory };
}

router.get('/', (req, res) => {
  let sessionToken = req.cookies?.session_token;
  if (!sessionToken) {
    sessionToken = crypto.randomBytes(32).toString('hex');
    res.cookie('session_token', sessionToken, { 
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true 
    });
  }
  
  res.render('index', { 
    title: 'Fortune Cookie',
    error: null 
  });
});

router.post('/api/fortune', async (req, res) => {
  const { mood } = req.body;
  
  if (!mood) {
    return res.status(400).json({ error: 'Please share how you are feeling' });
  }
  
  let sessionToken = req.cookies?.session_token;
  if (!sessionToken) {
    sessionToken = crypto.randomBytes(32).toString('hex');
    res.cookie('session_token', sessionToken, { 
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true 
    });
  }
  
  try {
    getOrCreateUser(sessionToken, async (err, userId) => {
      if (err) {
        console.error('User error:', err);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      
      // Detect mood and category from the user's text
      const detected = detectMoodAndCategory(mood);
      
      // Try to find a matching cookie
      db.get(
        `SELECT c.*, cat.category_name, m.mood_name 
         FROM cookies c
         JOIN categories cat ON c.category_id = cat.category_id
         JOIN moods m ON c.mood_id = m.mood_id
         WHERE (cat.category_name = ? OR ? = 'General')
         AND m.mood_name = ?
         AND c.is_active = 1
         ORDER BY RANDOM() LIMIT 1`,
        [detected.category, detected.category, detected.mood],
        (err, cookie) => {
          if (err || !cookie) {
            // Fallback: get any random cookie
            db.get(
              `SELECT c.*, cat.category_name, m.mood_name 
               FROM cookies c
               JOIN categories cat ON c.category_id = cat.category_id
               JOIN moods m ON c.mood_id = m.mood_id
               WHERE c.is_active = 1
               ORDER BY RANDOM() LIMIT 1`,
              (err2, fallbackCookie) => {
                if (err2 || !fallbackCookie) {
                  return res.status(500).json({ error: 'No cookies available' });
                }
                return sendFortuneResponse(fallbackCookie, userId, mood, detected, res);
              }
            );
            return;
          }
          sendFortuneResponse(cookie, userId, mood, detected, res);
        }
      );
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate fortune' });
  }
});

function sendFortuneResponse(cookie, userId, userMood, detected, res) {
  const luckyNumber = Math.floor(
    Math.random() * (cookie.max_lucky_number - cookie.min_lucky_number + 1)
  ) + cookie.min_lucky_number;
  
  db.run(
    `INSERT INTO cookie_openings (cookie_id, user_id, real_lucky_number) 
     VALUES (?, ?, ?)`,
    [cookie.cookie_id, userId, luckyNumber],
    function(err) {
      if (err) console.error('Failed to record opening:', err);
    }
  );
  
  res.json({
    fortune: cookie.cookie_message,
    luckyNumber: luckyNumber,
    challenge: cookie.challenge_text,
    mood: userMood,
    category: detected.category,
    detectedMood: cookie.mood_name,
    cookieId: cookie.cookie_id,
    timestamp: new Date().toISOString(),
    id: Date.now()
  });
}

module.exports = router;