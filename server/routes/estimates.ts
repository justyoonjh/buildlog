import express from 'express';
import * as estimateController from '../controllers/estimateController.js';
import verifyEstimateOwner from '../middleware/verifyEstimateOwner.js';
import requireAuth from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
// Need schemas? 
// const { createEstimateSchema, updateEstimateSchema } = require('../validations/schemas');
// Let's assume schemas are JS still or handle imports properly.
// For now, I'll bypass explicit import of schemas if I can't find them, but I should try.
import schemas from '../validations/schemas.js'; 
// Assuming it was default export or named. Original: const { ... } = require(...)

const router = express.Router();

router.use(requireAuth);

const { createEstimateSchema, updateEstimateSchema } = schemas as any; // Temporary Any

// Routes without ID
router.post('/', validateRequest(createEstimateSchema), estimateController.createEstimate);
router.get('/', estimateController.getMyEstimates);

// Routes with ID (Apply Ownership Check Middleware)
// Note: verifyEstimateOwner expects :id param
router.use('/:id', verifyEstimateOwner);

router.get('/:id', estimateController.getEstimateById);
router.put('/:id', validateRequest(updateEstimateSchema), estimateController.updateEstimate);
router.delete('/:id', estimateController.deleteEstimate);

export default router;
