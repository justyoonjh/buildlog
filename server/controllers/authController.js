const { z } = require('zod');
const authService = require('../services/authService');
const userService = require('../services/userService');
const { ROLES } = require('../constants/auth');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// --- Validation Schemas ---
const registerSchema = z.object({
  id: z.string().min(4, 'ID must be at least 4 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum([ROLES.BOSS, ROLES.EMPLOYEE, 'admin']),
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
  companyCode: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional()
});

const loginSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  password: z.string().min(1, 'Password is required')
});

// --- Controller Methods ---

exports.register = catchAsync(async (req, res, next) => {
  const validationResult = registerSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return next(new AppError(`Validation failed: ${errorMessages}`, 400));
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
    console.error('DEBUG: Register Controller Error:', error);
    if (error.code === 'USER_EXISTS' || error.message === 'User already exists' || error.message === '이미 존재하는 아이디입니다.') {
      return next(new AppError('이미 존재하는 아이디입니다.', 409));
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

    // Check status - WE NO LONGER BLOCK HERE.
    // The frontend will handle redirection based on status (pending/rejected).
    // if (safeUser.status === 'pending') { ... } 

    // Save session
    req.session.user = safeUser;
    req.session.save((err) => {
      if (err) return next(new AppError('Session save error', 500));
      res.json({ success: true, user: safeUser });
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return next(new AppError('아이디 또는 비밀번호가 올바르지 않습니다.', 401));
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

  const result = await userService.verifyCompanyCode(code);
  res.json(result);
});

exports.resetData = catchAsync(async (req, res) => {
  console.log('🔄 Request received: Reset Data');
  await authService.resetUsers();
  console.log('✅ Database reset complete');
  res.json({ success: true, message: 'Database reset successfully' });
});

exports.getMe = (req, res) => {
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

exports.getCompanyMembers = catchAsync(async (req, res, next) => {
  const user = req.session.user;
  if (!user || !user.companyCode) {
    return next(new AppError('Company information not found', 404));
  }

  const members = await userService.getCompanyMembers(user.companyCode);
  res.json({ success: true, members });
});

exports.approveUser = catchAsync(async (req, res, next) => {
  const currentUser = req.session.user;
  const { userId } = req.body;

  if (!currentUser || currentUser.role !== ROLES.BOSS) {
    return next(new AppError('권한이 없습니다.', 403));
  }

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Verify target user belongs to same company
  const targetUser = await authService.findUserById(userId);
  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  if (targetUser.companyCode !== currentUser.companyCode) {
    return next(new AppError('다른 회사의 직원은 승인할 수 없습니다.', 403));
  }

  await userService.approveUser(userId);
  res.json({ success: true, message: '승인되었습니다.' });
});

exports.rejectUser = catchAsync(async (req, res, next) => {
  const currentUser = req.session.user;
  const { userId } = req.body;

  if (!currentUser || currentUser.role !== ROLES.BOSS) {
    return next(new AppError('권한이 없습니다.', 403));
  }

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Verify target user belongs to same company
  const targetUser = await authService.findUserById(userId);
  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  if (targetUser.companyCode !== currentUser.companyCode) {
    return next(new AppError('다른 회사의 직원은 거절할 수 없습니다.', 403));
  }

  await userService.rejectUser(userId);
  res.json({ success: true, message: '가입 승인이 거절되었습니다.' });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const currentUser = req.session.user;
  if (!currentUser) return next(new AppError('Unauthorized', 401));

  await userService.deleteUser(currentUser.id);

  // Destroy session after delete
  req.session.destroy((err) => {
    if (err) return next(new AppError('Logout failed after delete', 500));
    res.clearCookie('connect.sid');
    res.json({ success: true, message: '계정이 삭제되었습니다.' });
  });
});
