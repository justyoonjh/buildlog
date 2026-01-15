const { z } = require('zod');
const authService = require('../services/authService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

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

// --- Controller Methods ---

exports.register = catchAsync(async (req, res, next) => {
  const validationResult = registerSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError('Validation failed', 400));
  }

  try {
    const safeUser = await authService.register(validationResult.data);

    // Save session
    req.session.user = safeUser;
    req.session.save((err) => {
      if (err) return next(new AppError('Session save error', 500));
      res.json({
        success: true,
        message: 'User registered successfully',
        companyCode: safeUser.companyCode,
        user: safeUser
      });
    });
  } catch (error) {
    if (error.message === 'User already exists') {
      return next(new AppError('User already exists', 409));
    }
    throw error;
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const validationResult = loginSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(new AppError('Validation failed', 400));
  }

  const { id, password } = validationResult.data;

  try {
    const safeUser = await authService.login(id, password);

    // Save session
    req.session.user = safeUser;
    req.session.save((err) => {
      if (err) return next(new AppError('Session save error', 500));
      res.json({ success: true, user: safeUser });
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return next(new AppError('Invalid credentials', 401));
    }
    throw error;
  }
});

exports.checkId = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new AppError('ID is required', 400));

  const user = await authService.findUserById(id);
  res.json({ exists: !!user });
});

exports.verifyCode = catchAsync(async (req, res, next) => {
  const { code } = req.query;
  if (!code) return next(new AppError('Code is required', 400));

  const result = await authService.verifyCompanyCode(code);
  res.json(result);
});

exports.resetData = catchAsync(async (req, res) => {
  console.log('🔄 Request received: Reset Data');
  await authService.resetUsers();
  console.log('✅ Database reset complete');
  res.json({ success: true, message: 'Database reset successfully' });
});

exports.getMe = (req, res) => {
  // console.log('[Auth] /me called. Session User:', req.session?.user?.id);
  if (req.session && req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(new AppError('Logout failed', 500));
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
};
