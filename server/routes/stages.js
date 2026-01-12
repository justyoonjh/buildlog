const express = require('express');
const router = express.Router();
const stageService = require('../services/stageService');
const requireAuth = require('../middleware/auth');

// Get all stages for a project
router.get('/:projectId', requireAuth, async (req, res) => {
  try {
    const stages = await stageService.getStagesByProject(req.params.projectId);
    res.json({ success: true, stages });
  } catch (error) {
    console.error('Failed to fetch stages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stages' });
  }
});

// Create a new stage
router.post('/', requireAuth, async (req, res) => {
  try {
    const stage = await stageService.createStage(req.body);
    res.json({ success: true, stage });
  } catch (error) {
    console.error('Failed to create stage:', error);
    res.status(500).json({ success: false, error: 'Failed to create stage' });
  }
});

// Update a stage
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const stage = await stageService.updateStage(req.params.id, req.body);
    res.json({ success: true, stage });
  } catch (error) {
    console.error('Failed to update stage:', error);
    res.status(500).json({ success: false, error: 'Failed to update stage' });
  }
});

// Delete a stage
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const success = await stageService.deleteStage(req.params.id);
    res.json({ success });
  } catch (error) {
    console.error('Failed to delete stage:', error);
    res.status(500).json({ success: false, error: 'Failed to delete stage' });
  }
});

module.exports = router;
