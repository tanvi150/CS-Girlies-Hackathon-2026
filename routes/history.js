const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const db = new sqlite3.Database('./database.db');

// Helper to get user by session token
function getUserIdBySession(sessionToken, callback) {
  db.get(
    'SELECT user_id FROM users WHERE session_token = ?',
    [sessionToken],
    (err, user) => {
      if (err) return callback(err);
      callback(null, user ? user.user_id : null);
    }
  );
}

router.get('/', (req, res) => {
  const sessionToken = req.cookies?.session_token;
  
  if (!sessionToken) {
    return res.render('history', {
      title: 'Fortune Jar',
      fortunes: [],
      error: null
    });
  }
  
  getUserIdBySession(sessionToken, (err, userId) => {
    if (err || !userId) {
      return res.render('history', {
        title: 'Fortune Jar',
        fortunes: [],
        error: null
      });
    }
    
    // Get user's cookie openings with cookie details
    db.all(
      `SELECT 
         co.opening_id,
         co.real_lucky_number as lucky_number,
         co.opened_at,
         c.cookie_message as fortune,
         c.challenge_text as challenge,
         cat.category_name as category,
         m.mood_name as mood
       FROM cookie_openings co
       JOIN cookies c ON co.cookie_id = c.cookie_id
       JOIN categories cat ON c.category_id = cat.category_id
       JOIN moods m ON c.mood_id = m.mood_id
       WHERE co.user_id = ?
       ORDER BY co.opened_at DESC
       LIMIT 50`,
      [userId],
      (err, fortunes) => {
        if (err) {
          console.error('Database error:', err);
          return res.render('history', {
            title: 'Fortune Jar',
            fortunes: [],
            error: 'Failed to load history'
          });
        }
        
        res.render('history', {
          title: 'Fortune Jar',
          fortunes: fortunes || [],
          error: null
        });
      }
    );
  });
});

// Save fortune to history (now we just record the opening in the cookie_openings table)
// This is handled automatically when a cookie is cracked

// Toggle favorite - we'll use a separate table or a flag in cookie_openings
// For simplicity, we'll use localStorage on the frontend as before

module.exports = router;