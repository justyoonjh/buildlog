/**
 * API Server & Proxy
 * 
 * Handles:
 * 1. Authentication (Delegated to routes/auth.js)
 * 2. External APIs (Delegated to routes/external.js)
 */

const express = require('express');
const cors = require('cors');
const config = require('./server-config');

const app = express();

// --- CORS Configuration ---
const whitelist = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow whitelist, local IPs (192.168.x.x, 172.x.x.x, 10.x.x.x)
    if (whitelist.indexOf(origin) !== -1 ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://172.') ||
      origin.startsWith('http://10.')) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Session Configuration ---
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: './data' }),
  secret: 'your-secret-key-change-this-in-env', // TODO: Move to .env
  resave: false,
  saveUninitialized: false, // Don't create session until something is stored
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true, // Prevents client-side JS from reading the cookie
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax'
  }
}));

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/external'));

// --- Global Error Handler ---
app.use(require('./middleware/errorHandler'));

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
  console.log(`- Auth Routes: Active`);
  console.log(`- External API Routes: Active`);
});