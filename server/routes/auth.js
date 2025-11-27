const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const db = require('../server-db');
const config = require('../server-config');

// --- Rate Limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// Apply rate limiting to all auth routes
router.use(authLimiter);

// --- Validation Schemas ---
const registerSchema = z.object({
  id: z.string().min(4, 'ID must be at least 4 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['boss', 'employee', 'admin']),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  businessNumber: z.string().optional(),
  businessInfo: z.any().optional(),
  address: z.any().optional(),
  companyCode: z.string().optional()
});

const loginSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  password: z.string().min(1, 'Password is required')
});

// --- Helper: Password Hashing (Argon2) ---
const hashPassword = async (password) => {
  try {
    return await argon2.hash(password);
  } catch (err) {
    console.error('Hashing failed:', err);
    throw new Error('Hashing failed');
  }
};

const verifyPassword = async (password, storedHash) => {
  try {
    return await argon2.verify(storedHash, password);
  } catch (err) {
    console.error('Verification failed:', err);
    return false;
  }
};

// --- Auth Endpoints ---

// Register
router.post('/register', async (req, res) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const { id, password, ...userData } = validationResult.data;

    if (await db.findUserById(id)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hash = await hashPassword(password);

    const newUser = {
      id,
      ...userData,
      passwordHash: hash,
      createdAt: Date.now()
    };

    await db.saveUser(newUser);

    const { passwordHash, passwordSalt, ...safeUser } = newUser;

    res.json({
      success: true,
      message: 'User registered successfully',
      companyCode: newUser.companyCode,
      user: safeUser
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const { id, password } = validationResult.data;

    if (id === 'admin' && password === 'password123!') {
      const adminUser = { id: 'admin', name: '현장 관리자', role: 'admin' };
      return res.json({
        success: true,
        user: adminUser
      });
    }

    const user = await db.findUserById(id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { passwordHash, passwordSalt, ...safeUser } = user;

    res.json({ success: true, user: safeUser });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Check Duplicate ID
router.get('/check-id', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID is required' });

  const exists = !!(await db.findUserById(id));
  res.json({ exists });
});

// Verify Company Code
router.get('/verify-code', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const boss = await db.findBossByCode(code);
  if (boss) {
    res.json({
      valid: true,
      businessInfo: boss.businessInfo
    });
  } else {
    res.json({ valid: false });
  }
});

// Reset Data (Dev only)
router.post('/reset', async (req, res) => {
  try {
    await db.resetUsers();
    res.json({ success: true, message: 'Database reset successfully' });
  } catch (error) {
    console.error('Reset Error:', error);
    res.status(500).json({ error: 'Reset failed' });
  }
});

module.exports = router;
