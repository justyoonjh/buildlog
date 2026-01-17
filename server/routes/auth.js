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

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check-id', authController.checkId);
router.get('/verify-code', authController.verifyCode);
router.post('/reset', authController.resetData);
router.get('/company/members', authController.getCompanyMembers);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/approve', authController.approveUser);
router.post('/reject', authController.rejectUser);
router.delete('/me', authController.deleteMe);

module.exports = router;
