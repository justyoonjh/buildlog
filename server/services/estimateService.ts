import { db } from '../db-init.js'; // Assuming db-init is still js or we need to check imports
import { v4 as uuidv4 } from 'uuid';
import { Estimate } from '../../src/types'; // Import shared type

interface EstimateFilters {
  status?: string;
  page?: number;
  limit?: number;
}

const estimateService = {
  // Create new estimate (Draft)
  createEstimate: async (data: any, userId: string) => {
    const {
      clientName, clientPhone, siteAddress,
      startDate, endDate, totalAmount, vatIncluded,
      items = [], memo,
      modelImage, generatedImage, styleDescription
    } = data;

    const estimateId = uuidv4();
    const createdAt = Date.now();

    const insertEstimate = db.prepare(`
      INSERT INTO estimates (
        id, userId, clientName, clientPhone, siteAddress, 
        startDate, endDate, totalAmount, vatIncluded, 
        status, memo, modelImage, generatedImage, styleDescription, createdAt
      ) VALUES (
        @id, @userId, @clientName, @clientPhone, @siteAddress, 
        @startDate, @endDate, @totalAmount, @vatIncluded, 
        @status, @memo, @modelImage, @generatedImage, @styleDescription, @createdAt
      )
    `);

    const insertItem = db.prepare(`
      INSERT INTO estimate_items (
        estimateId, category, description, spec, 
        quantity, unit, unitPrice, amount
      ) VALUES (
        @estimateId, @category, @description, @spec, 
        @quantity, @unit, @unitPrice, @amount
      )
    `);

    // Use transaction for consistency
    const createTransaction = db.transaction(() => {
      insertEstimate.run({
        id: estimateId,
        userId,
        clientName,
        clientPhone,
        siteAddress,
        startDate: startDate || null,
        endDate: endDate || null,
        totalAmount: totalAmount || 0,
        vatIncluded: vatIncluded ? 1 : 0,
        status: data.status || 'negotiating',
        memo,
        modelImage: modelImage || null,
        generatedImage: generatedImage || null,
        styleDescription: styleDescription || null,
        createdAt
      });

      for (const item of items) {
        insertItem.run({
          estimateId,
          category: item.category || '기타',
          description: item.description,
          spec: item.spec || '',
          quantity: item.quantity || 0,
          unit: item.unit || '식',
          unitPrice: item.unitPrice || 0,
          amount: (item.quantity || 0) * (item.unitPrice || 0) // Server-side validation
        });
      }
    });

    createTransaction();
    return await estimateService.getEstimateById(estimateId);
  },

  // Get estimates for user with filtering and pagination
  getEstimatesByUser: async (userId: string, filters: EstimateFilters = {}) => {
    const { status, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM estimates WHERE userId = ?`;
    const params: any[] = [userId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    // Count Total
    const countStmt = db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as total'));
    const totalResult = countStmt.get(...params) as { total: number };
    const total = totalResult ? totalResult.total : 0;

    // Fetch Data
    query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const estimates = stmt.all(...params) as any[]; // Type assertion for DB result

    return {
      estimates: estimates.map(est => ({
        ...est,
        vatIncluded: !!est.vatIncluded
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  // Get single estimate details
  getEstimateById: async (id: string) => {
    const estimate = db.prepare('SELECT * FROM estimates WHERE id = ?').get(id) as any;
    if (!estimate) return null;

    const items = db.prepare('SELECT * FROM estimate_items WHERE estimateId = ?').all(id) as any[];

    return {
      ...estimate,
      vatIncluded: !!estimate.vatIncluded,
      items
    };
  },

  // Update estimate
  updateEstimate: async (id: string, data: any, userId: string) => {
    // Check ownership
    const existing = db.prepare('SELECT userId, status, modelImage, generatedImage, styleDescription FROM estimates WHERE id = ?').get(id) as any;
    if (!existing || existing.userId !== userId) {
      throw new Error('Unauthorized or Estimate not found');
    }

    const {
      clientName, clientPhone, siteAddress,
      startDate, endDate, totalAmount, vatIncluded,
      items = [], memo, status,
      modelImage, generatedImage, styleDescription
    } = data;

    const updatedAt = Date.now();

    const updateStmt = db.prepare(`
      UPDATE estimates SET
        clientName = @clientName,
        clientPhone = @clientPhone,
        siteAddress = @siteAddress,
        startDate = @startDate,
        endDate = @endDate,
        totalAmount = @totalAmount,
        vatIncluded = @vatIncluded,
        status = @status,
        memo = @memo,
        modelImage = @modelImage,
        generatedImage = @generatedImage,
        styleDescription = @styleDescription,
        updatedAt = @updatedAt
      WHERE id = @id
    `);

    const deleteItems = db.prepare('DELETE FROM estimate_items WHERE estimateId = ?');
    const insertItem = db.prepare(`
      INSERT INTO estimate_items (
        estimateId, category, description, spec, 
        quantity, unit, unitPrice, amount
      ) VALUES (
        @estimateId, @category, @description, @spec, 
        @quantity, @unit, @unitPrice, @amount
      )
    `);

    const updateTransaction = db.transaction(() => {
      updateStmt.run({
        id,
        clientName,
        clientPhone,
        siteAddress,
        startDate,
        endDate,
        totalAmount,
        vatIncluded: vatIncluded ? 1 : 0,
        status: status || existing.status,
        memo,
        modelImage: modelImage !== undefined ? modelImage : existing.modelImage,
        generatedImage: generatedImage !== undefined ? generatedImage : existing.generatedImage,
        styleDescription: styleDescription !== undefined ? styleDescription : existing.styleDescription,
        updatedAt
      });

      // Replace items strategy (simplest for edits)
      deleteItems.run(id);

      for (const item of items) {
        insertItem.run({
          estimateId: id,
          category: item.category || '기타',
          description: item.description,
          spec: item.spec || '',
          quantity: item.quantity || 0,
          unit: item.unit || '식',
          unitPrice: item.unitPrice || 0,
          amount: (item.quantity || 0) * (item.unitPrice || 0)
        });
      }
    });

    updateTransaction();
    return await estimateService.getEstimateById(id);
  },

  // Delete estimate
  deleteEstimate: async (id: string, userId: string) => {
    const existing = db.prepare('SELECT userId FROM estimates WHERE id = ?').get(id) as any;
    if (!existing || existing.userId !== userId) {
      throw new Error('Unauthorized or Estimate not found');
    }

    // CASCADE delete handles items
    const deleteStmt = db.prepare('DELETE FROM estimates WHERE id = ?');
    deleteStmt.run(id);
    return true;
  }
};

export default estimateService;
