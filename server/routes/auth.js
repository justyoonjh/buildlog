const express = require('express');
const router = express.Router();
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const authService = require('../services/authService');

// --- Rate Limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

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
  businessInfo: z.object({
    b_no: z.string().optional(),
    c_nm: z.string().optional(),
    s_nm: z.string().optional(),
    start_dt: z.string().optional(),
    p_nm: z.string().optional()
  }).optional(),
  address: z.object({
    zipCode: z.string().optional(),
    address: z.string().optional(),
    detailAddress: z.string().optional()
  }).optional(),
  companyCode: z.string().optional()
});

const loginSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  password: z.string().min(1, 'Password is required')
});

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

    const safeUser = await authService.register(validationResult.data);

    // Save session
    req.session.user = safeUser;

    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.json({
        success: true,
        message: 'User registered successfully',
        companyCode: safeUser.companyCode,
        user: safeUser
      });
    });

  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: error.message });
    }
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

    // authService.login throws error or returns user.
    const safeUser = await authService.login(id, password);

    // Save session
    req.session.user = safeUser;

    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.json({ success: true, user: safeUser });
    });


  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Check Duplicate ID
router.get('/check-id', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID is required' });

  const user = await authService.findUserById(id);
  res.json({ exists: !!user });
});

// Verify Company Code
router.get('/verify-code', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const result = await authService.verifyCompanyCode(code);
  res.json(result);
});

// Reset Data (Dev only)
router.post('/reset', async (req, res) => {
  try {
    await authService.resetUsers();
    res.json({ success: true, message: 'Database reset successfully' });
  } catch (error) {
    console.error('Reset Error:', error);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// Get Current User (Session)
router.get('/me', (req, res) => {
  console.log('GET /me - Session:', req.session);
  if (req.session && req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

module.exports = router;
