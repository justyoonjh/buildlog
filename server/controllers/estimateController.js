const estimateService = require('../services/estimateService');
const catchAsync = require('../utils/catchAsync');

exports.createEstimate = catchAsync(async (req, res) => {
  const userId = req.session.user.id;
  const estimate = await estimateService.createEstimate(req.body, userId);
  res.status(201).json({ success: true, estimate });
});

exports.getMyEstimates = catchAsync(async (req, res) => {
  const userId = req.session.user.id;
  const estimates = await estimateService.getEstimatesByUser(userId);
  res.json({ success: true, estimates });
});

exports.getEstimateById = catchAsync(async (req, res) => {
  // Provided by verifyEstimateOwner middleware (or we can just use req.estimate)
  // If middleware is used, req.estimate is guaranteed to exist and be owned by user.
  res.json({ success: true, estimate: req.estimate });
});

exports.updateEstimate = catchAsync(async (req, res) => {
  const userId = req.session.user.id;
  // Use req.estimate.id just to be safe or req.params.id
  const estimate = await estimateService.updateEstimate(req.params.id, req.body, userId);
  res.json({ success: true, estimate });
});

exports.deleteEstimate = catchAsync(async (req, res) => {
  const userId = req.session.user.id;
  await estimateService.deleteEstimate(req.params.id, userId);
  res.json({ success: true, message: 'Estimate deleted' });
});
