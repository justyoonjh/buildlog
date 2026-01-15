const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimateController');
const verifyEstimateOwner = require('../middleware/verifyEstimateOwner');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

const { validateRequest } = require('../middleware/validateRequest');
const { createEstimateSchema, updateEstimateSchema } = require('../validations/schemas');

// Routes without ID
router.post('/', validateRequest(createEstimateSchema), estimateController.createEstimate);
router.get('/', estimateController.getMyEstimates);

// Routes with ID (Apply Ownership Check Middleware)
// Note: verifyEstimateOwner expects :id param
router.use('/:id', verifyEstimateOwner);

router.get('/:id', estimateController.getEstimateById);
router.put('/:id', validateRequest(updateEstimateSchema), estimateController.updateEstimate);
router.delete('/:id', estimateController.deleteEstimate);

module.exports = router;
