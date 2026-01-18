/**
 * SERVER ENTRY POINT (Manual CORS Control)
 * 
 * Completely manual CORS handling to bypass any library issues.
 * Explicitly reflects the Origin header to Allow-Origin.
 */

import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load Config
dotenv.config();

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Local Files
// Using default import for CommonJS interoperability (handled by tsx/esModuleInterop)
import config from './server-config.js';
// Note: verify if we need detailed types for config, currently 'any' via JS

const app = express();
const PORT = config.PORT || 3001;

// --- 1. Manual CORS Middleware (The "Hammer") ---
app.use((req: Request, res: Response, next: NextFunction) => {
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
    res.status(200).end();
    return; // explicit return for TS
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
// We use require here because it's a specific local module factory pattern
// and converting it to import might require refactoring session-store.js too.
import createSessionStore from './session-store.js';
const BetterSqliteStore = createSessionStore(session);

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
// Dynamic imports or require for routes. 
// Ideally these should also be converted to TS, but for now we require them.
// tsx allows require.
import authRoutes from './routes/auth.js';
import estimateRoutes from './routes/estimates.js';
import stageRoutes from './routes/stages.js';
import aiRoutes from './routes/ai.js';
import externalRoutes from './routes/external.js';

try {
  app.use('/api/auth', authRoutes);
  app.use('/api/estimates', estimateRoutes);
  app.use('/api/stages', stageRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api', externalRoutes);
} catch (error) {
  console.error('❌ Failed to load routes:', error);
}

// --- 5. Error Handling ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('SERVER ERROR:', err);
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code
  });
});

// --- 6. Start Server ---
app.listen(PORT, () => {
  console.log(`\n✅ MANUAL SERVER running on port ${PORT}`);
  console.log(`   Local:   http://localhost:${PORT}`);
  // console.log(`   Network: http://0.0.0.0:${PORT}`);
  console.log(`   CORS:    Manual Reflection Mode (Allows All)`);
});
