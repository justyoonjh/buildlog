const estimateService = require('../services/estimateService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const verifyEstimateOwner = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(); // If no ID param, skip check (probably list route)
  }

  const estimate = await estimateService.getEstimateById(id);

  if (!estimate) {
    return next(new AppError('Estimate not found', 404));
  }

  // Check Ownership
  if (estimate.userId !== req.session.user.id) {
    return next(new AppError('Unauthorized access to this estimate', 403));
  }

  // Attach estimate to request for Controller usage
  req.estimate = estimate;
  next();
});

module.exports = verifyEstimateOwner;
