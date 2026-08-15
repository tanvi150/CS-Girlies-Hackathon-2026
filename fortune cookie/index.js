const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database('./database.db');

// Helper function to get or create session token
function getSessionToken(req) {
  let token = req.cookies?.session_token;
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    // You'll need cookie-parser middleware for this
    // We'll handle it in the routes
  }
  return token;
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Simple cookie parser (or use cookie-parser package)
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      req.cookies[name] = decodeURIComponent(value);
    });
  }
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const fortuneRoutes = require('./routes/fortune');
const historyRoutes = require('./routes/history');

app.use('/', fortuneRoutes);
app.use('/history', historyRoutes);

app.listen(PORT, () => {
  console.log(`Fortune Cookie running at http://localhost:${PORT}`);
});