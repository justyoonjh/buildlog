const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

// --- Rate Limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

router.use(authLimiter);

// --- Auth Endpoints ---

const { validateRequest } = require('../middleware/validateRequest');
const { loginSchema, registerSchema } = require('../validations/schemas');

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/check-id', authController.checkId);
router.get('/verify-code', authController.verifyCode);
router.post('/reset', authController.resetData);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
