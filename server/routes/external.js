const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../server-config');

// --- Juso API Proxy ---
router.get('/address/search', async (req, res) => {
  try {
    const { keyword, currentPage = 1, countPerPage = 10 } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

    const response = await axios.get(config.JUSO.API_URL, {
      params: {
        confmKey: config.JUSO.API_KEY,
        currentPage,
        countPerPage,
        keyword,
        resultType: 'json'
      }
    });

    if (response.data.results.common.errorCode !== '0') {
      return res.status(400).json({ error: response.data.results.common.errorMessage });
    }
    res.json(response.data);
  } catch (error) {
    console.error('Juso API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch address data' });
  }
});

// --- NTS API Proxy ---
const getServiceKey = () => {
  const key = config.NTS.API_KEY;
  // Check if key looks like a hash (64 hex chars)
  if (key && key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    console.warn('⚠️ WARNING: NTS_API_KEY looks like a SHA-256 hash, not a valid Service Key.');
  }
  return key.includes('%') ? key : encodeURIComponent(key);
};

router.post('/nts/status', async (req, res) => {
  try {
    const serviceKey = getServiceKey();
    const response = await axios.post(
      `${config.NTS.STATUS_URL}?serviceKey=${serviceKey}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('NTS Status API Error:', error.message);
    if (error.response) {
      console.error('NTS Response Data:', JSON.stringify(error.response.data));
      console.error('NTS Response Status:', error.response.status);
    }
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch business status',
      details: error.response?.data || error.message
    });
  }
});

router.post('/nts/validate', async (req, res) => {
  try {
    const serviceKey = getServiceKey();
    const response = await axios.post(
      `${config.NTS.VALIDATE_URL}?serviceKey=${serviceKey}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('NTS Validate API Error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to validate business info',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
