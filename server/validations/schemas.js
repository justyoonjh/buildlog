const { z } = require('zod');

// --- Auth Schemas ---

const loginSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  password: z.string().min(1, 'Password is required')
});

const registerBossSchema = z.object({
  type: z.literal('boss'),
  id: z.string().min(4, 'ID must be at least 4 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1),
  phone: z.string().regex(/^\d{2,3}-\d{3,4}-\d{4}$/, 'Invalid phone number format'),
  businessNumber: z.string().length(10, 'Business number must be 10 digits'), // Hyphens removed usually
  businessName: z.string().min(1),
  businessOwner: z.string().min(1),
  businessAddress: z.string().min(1),
  businessItem: z.string().optional()
});

const registerEmployeeSchema = z.object({
  type: z.literal('employee'),
  id: z.string().min(4),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().regex(/^\d{2,3}-\d{3,4}-\d{4}$/),
  specialty: z.string().optional(),
  experience: z.number().int().nonnegative().optional()
});

// Union for general register if shared endpoint, but routes might separate them
// In authController, register handles both via 'type'
const registerSchema = z.discriminatedUnion('type', [
  registerBossSchema,
  registerEmployeeSchema
]);


// --- Estimate Schemas ---

const estimateItemSchema = z.object({
  category: z.string(),
  description: z.string(),
  spec: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  unitPrice: z.number().nonnegative(),
  amount: z.number().nonnegative(),
  id: z.union([z.string(), z.number()]).optional() // ID might be present if updating or temp ID
});

const createEstimateSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientPhone: z.string().optional(),
  siteAddress: z.string().min(1, 'Site address is required'),
  siteType: z.string().optional(),
  areaSize: z.number().positive().optional().or(z.string()), // sometimes sent as string from UI? Schema should enforce consistent type, but be flexible if needed.
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  memo: z.string().optional(),
  items: z.array(estimateItemSchema).optional(),
  vatIncluded: z.boolean().optional(),
  totalAmount: z.number().nonnegative().optional()
});

const updateEstimateSchema = createEstimateSchema.partial().extend({
  // Add status if updated via PUT /:id
  status: z.enum(['draft', 'negotiating', 'contract_ready', 'contracted', 'construction', 'completed', 'canceled']).optional(),

  // Payment terms
  downPayment: z.number().nonnegative().optional(),
  progressPayment: z.number().nonnegative().optional(),
  balancePayment: z.number().nonnegative().optional(),

  // Images (Base64 or URL)
  modelImage: z.string().nullable().optional(),
  generatedImage: z.string().nullable().optional()
});

module.exports = {
  loginSchema,
  registerSchema,
  createEstimateSchema,
  updateEstimateSchema
};
