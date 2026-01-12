const { db } = require('../db-init');
const { v4: uuidv4 } = require('uuid');

const stageService = {
  // Get all stages for a project
  getStagesByProject: async (projectId) => {
    const stmt = db.prepare('SELECT * FROM construction_stages WHERE projectId = ? ORDER BY createdAt ASC');
    return stmt.all(projectId);
  },

  // Create a new stage
  createStage: async (data) => {
    const { projectId, name, manager, duration, description, status } = data;
    const id = uuidv4();
    const createdAt = Date.now();

    const stmt = db.prepare(`
      INSERT INTO construction_stages (
        id, projectId, name, manager, duration, description, status, createdAt
      ) VALUES (
        @id, @projectId, @name, @manager, @duration, @description, @status, @createdAt
      )
    `);

    stmt.run({
      id, projectId, name, manager, duration, description,
      status: status || 'pending',
      createdAt
    });

    return { id, projectId, name, manager, duration, description, status: status || 'pending', createdAt };
  },

  // Update a stage
  updateStage: async (id, data) => {
    const { name, manager, duration, description, status } = data;

    // Build update query dynamically based on provided fields
    const fields = [];
    const values = { id };

    if (name !== undefined) { fields.push('name = @name'); values.name = name; }
    if (manager !== undefined) { fields.push('manager = @manager'); values.manager = manager; }
    if (duration !== undefined) { fields.push('duration = @duration'); values.duration = duration; }
    if (description !== undefined) { fields.push('description = @description'); values.description = description; }
    if (status !== undefined) { fields.push('status = @status'); values.status = status; }

    if (fields.length === 0) return null;

    const stmt = db.prepare(`UPDATE construction_stages SET ${fields.join(', ')} WHERE id = @id`);
    stmt.run(values);

    return db.prepare('SELECT * FROM construction_stages WHERE id = ?').get(id);
  },

  // Delete a stage
  deleteStage: async (id) => {
    const stmt = db.prepare('DELETE FROM construction_stages WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

module.exports = stageService;
