import { Request, Response } from 'express';
import estimateService from '../services/estimateService.js';
import catchAsync from '../utils/catchAsync.js';

// Extend Session User Type (Quick Fix, ideally global d.ts)
interface AuthenticatedRequest extends Request {
  session: any; // Type as needed
}

export const createEstimate = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.session.user.id;
  const estimate = await estimateService.createEstimate(req.body, userId);
  res.status(201).json({ success: true, estimate });
});

export const getMyEstimates = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.session.user.id;
  const { status, page, limit } = req.query;

  const result = await estimateService.getEstimatesByUser(userId, {
    status: status as string,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20
  });

  res.json({ success: true, ...result });
});

export const getEstimateById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // Provided by verifyEstimateOwner middleware (or we can just use req.estimate)
  // If middleware is used, req.estimate is guaranteed to exist and be owned by user.
  // We need to type extend Request in middleware too.
  res.json({ success: true, estimate: (req as any).estimate });
});

export const updateEstimate = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.session.user.id;
  // Use req.estimate.id just to be safe or req.params.id
  const estimate = await estimateService.updateEstimate(req.params.id, req.body, userId);
  res.json({ success: true, estimate });
});

export const deleteEstimate = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.session.user.id;
  await estimateService.deleteEstimate(req.params.id, userId);
  res.json({ success: true, message: 'Estimate deleted' });
});
