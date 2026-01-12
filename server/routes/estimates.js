const express = require('express');
const router = express.Router();
const estimateService = require('../services/estimateService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// Create Draft Estimate
router.post('/', catchAsync(async (req, res) => {
  const userId = req.session.user.id;
  const estimate = await estimateService.createEstimate(req.body, userId);
  res.status(201).json({ success: true, estimate });
}));

// Get My Estimates
router.get('/', catchAsync(async (req, res) => {
  const userId = req.session.user.id;
  const estimates = await estimateService.getEstimatesByUser(userId);
  res.json({ success: true, estimates });
}));

// Get Single Estimate
router.get('/:id', catchAsync(async (req, res, next) => {
  const estimate = await estimateService.getEstimateById(req.params.id);
  if (!estimate) {
    return next(new AppError('Estimate not found', 404));
  }
  // Optional: Check if user owns this estimate
  if (estimate.userId !== req.session.user.id) {
    return next(new AppError('Unauthorized access to this estimate', 403));
  }
  res.json({ success: true, estimate });
}));

// Update Estimate
router.put('/:id', catchAsync(async (req, res) => {
  const userId = req.session.user.id;
  const estimate = await estimateService.updateEstimate(req.params.id, req.body, userId);
  res.json({ success: true, estimate });
}));

// Delete Estimate
router.delete('/:id', catchAsync(async (req, res) => {
  const userId = req.session.user.id;
  await estimateService.deleteEstimate(req.params.id, userId);
  res.json({ success: true, message: 'Estimate deleted' });
}));

module.exports = router;
