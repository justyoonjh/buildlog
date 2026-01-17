/**
 * SERVER ENTRY POINT (Manual CORS Control)
 * 
 * Completely manual CORS handling to bypass any library issues.
 * Explicitly reflects the Origin header to Allow-Origin.
 */

const express = require('express');
// const cors = require('cors'); // REMOVED: We do it manually
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// Load Config
require('dotenv').config();
const config = require('./server-config');

const app = express();
const PORT = config.PORT || 3001;

// --- 1. Manual CORS Middleware (The "Hammer") ---
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow any origin that is defined (browser) or allow * if undefined (tools)
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For non-browser requests (Postman, etc), allow all
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Allow all common methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');

  // Allow all common headers + Cookie stuff
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cookie, Origin');

  // IMPORTANT: Allow credentials (cookies)
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle Preflight directly and immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`[API] ${req.method} ${req.url} | Origin: ${origin || 'Direct'}`);
  next();
});

// --- 2. Request Parsing ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. Session Setup ---
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory:', dataDir);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Import Session Store Wrapper
const BetterSqliteStore = require('./session-store')(session);

app.use(session({
  store: new BetterSqliteStore({
    dbPath: path.join(dataDir, 'sessions.db'),
  }),
  secret: config.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // MUST be false for HTTP
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Days
    sameSite: 'lax' // 'lax' allow cookies on top-level navigation
  }
}));

// --- 4. Routes ---
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/estimates', require('./routes/estimates'));
  app.use('/api/stages', require('./routes/stages'));
  app.use('/api/ai', require('./routes/ai'));
  app.use('/api', require('./routes/external'));
} catch (error) {
  console.error('❌ Failed to load routes:', error);
}

// --- 5. Error Handling ---
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code
  });
});

// --- 6. Start Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ MANUAL SERVER running on port ${PORT}`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://0.0.0.0:${PORT}`);
  console.log(`   CORS:    Manual Reflection Mode (Allows All)`);
});
