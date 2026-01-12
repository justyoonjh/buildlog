const AppError = require('../utils/AppError');

const requireAuth = (req, res, next) => {
  console.log(`[Middleware] Auth Check: ${req.method} ${req.originalUrl}`);
  // console.log('[Middleware] Session:', req.session ? 'Exists' : 'Missing');
  // console.log('[Middleware] User:', req.session?.user ? req.session.user.id : 'None');

  if (!req.session || !req.session.user) {
    console.warn('[Middleware] 401 Unauthorized triggered.');
    return next(new AppError('Unauthorized: Please log in', 401));
  }
  next();
};

module.exports = requireAuth;
