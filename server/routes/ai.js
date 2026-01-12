const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const requireAuth = require('../middleware/auth');

// Generate AI Schedule
router.post('/visualize-schedule', requireAuth, async (req, res) => {
  try {
    const { stages } = req.body;

    if (!stages || !Array.isArray(stages) || stages.length === 0) {
      return res.status(400).json({ success: false, error: '유효한 공사 단계 목록이 필요합니다.' });
    }

    const schedule = await aiService.generateSchedule(stages);
    res.json({ success: true, schedule });
  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({ success: false, error: error.message || 'AI 일정 생성 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
