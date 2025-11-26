/**
 * API Server & Proxy
 * 
 * Handles:
 * 1. Authentication (Register, Login) - Secure Server-Side Hashing
 * 2. Juso API Proxy
 * 3. NTS API Proxy
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
const config = require('./server-config');
const db = require('./server-db');

const app = express();

app.use(cors());
app.use(express.json());

// --- Helper: Password Hashing (PBKDF2) ---
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, config.AUTH.SALT_ROUNDS, config.AUTH.KEY_LENGTH, config.AUTH.DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      resolve({
        salt,
        hash: derivedKey.toString('hex')
      });
    });
  });
};

const verifyPassword = (password, storedHash, storedSalt) => {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, storedSalt, config.AUTH.SALT_ROUNDS, config.AUTH.KEY_LENGTH, config.AUTH.DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === storedHash);
    });
  });
};

// --- Auth Endpoints ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { id, password, ...userData } = req.body;

    if (!id || !password) {
      return res.status(400).json({ error: 'ID and password are required' });
    }

    // Check duplicate
    if (db.findUserById(id)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password on server
    const { salt, hash } = await hashPassword(password);

    const newUser = {
      id,
      ...userData,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: Date.now()
    };

    db.saveUser(newUser);

    // Return success with company code for frontend display
    res.json({
      success: true,
      message: 'User registered successfully',
      companyCode: newUser.companyCode
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    // Admin Backdoor (Legacy support if needed, or remove)
    if (id === 'admin' && password === 'password123!') {
      return res.json({
        success: true,
        user: { id: 'admin', name: '현장 관리자', role: 'admin' }
      });
    }

    const user = db.findUserById(id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user info (exclude secrets)
    const { passwordHash, passwordSalt, ...safeUser } = user;
    res.json({ success: true, user: safeUser });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Check Duplicate ID
app.get('/api/auth/check-id', (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID is required' });

  const exists = !!db.findUserById(id);
  res.json({ exists });
});

// Verify Company Code (For Employee Signup)
app.get('/api/auth/verify-code', (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const boss = db.findBossByCode(code);
  if (boss) {
    // Return minimal boss info needed for employee
    res.json({
      valid: true,
      businessInfo: boss.businessInfo
    });
  } else {
    res.json({ valid: false });
  }
});

// Reset Data (Dev only)
app.post('/api/auth/reset', (req, res) => {
  try {
    db.resetUsers();
    res.json({ success: true, message: 'Database reset successfully' });
  } catch (error) {
    console.error('Reset Error:', error);
    res.status(500).json({ error: 'Reset failed' });
  }
});


// --- Juso API Proxy ---
app.get('/api/address/search', async (req, res) => {
  try {
    const { keyword, currentPage = 1, countPerPage = 10 } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

    const response = await axios.get(config.JUSO.API_URL, {
      params: {
        confmKey: config.JUSO.API_KEY,
        currentPage,
        countPerPage,
        keyword,
        resultType: 'json'
      }
    });

    if (response.data.results.common.errorCode !== '0') {
      return res.status(400).json({ error: response.data.results.common.errorMessage });
    }
    res.json(response.data);
  } catch (error) {
    console.error('Juso API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch address data' });
  }
});

// --- NTS API Proxy ---
const getServiceKey = () => {
  const key = config.NTS.API_KEY;
  return key.includes('%') ? key : encodeURIComponent(key);
};

app.post('/api/nts/status', async (req, res) => {
  try {
    const serviceKey = getServiceKey();
    const response = await axios.post(
      `${config.NTS.STATUS_URL}?serviceKey=${serviceKey}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('NTS Status API Error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch business status',
      details: error.response?.data || error.message
    });
  }
});

app.post('/api/nts/validate', async (req, res) => {
  try {
    const serviceKey = getServiceKey();
    const response = await axios.post(
      `${config.NTS.VALIDATE_URL}?serviceKey=${serviceKey}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('NTS Validate API Error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to validate business info',
      details: error.response?.data || error.message
    });
  }
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
  console.log(`- Auth & DB: Active (File: ${config.DB.FILE_PATH})`);
  console.log(`- Juso Proxy: Active`);
  console.log(`- NTS Proxy: Active`);
});