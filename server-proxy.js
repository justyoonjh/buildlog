/**
 * Juso API Proxy Server
 * 
 * This server handles requests from the frontend, appends the secure API Key,
 * and forwards the request to the Korean Road Name Address API.
 * This prevents CORS issues and exposes the API Key only on the server side.
 * 
 * To run:
 * 1. npm install express axios cors
 * 2. node server-proxy.js
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Allow requests from your frontend domain
app.use(cors());
app.use(express.json());

// SECURITY: Store this in an environment variable in production (e.g., process.env.JUSO_API_KEY)
const JUSO_API_KEY = 'devU01TX0FVVEgyMDI1MTEyNTAwNDA1MTExNjQ4OTY=';
const JUSO_API_URL = 'https://business.juso.go.kr/addrlink/addrLinkApi.do';

app.get('/api/address/search', async (req, res) => {
  try {
    const { keyword, currentPage = 1, countPerPage = 10 } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const response = await axios.get(JUSO_API_URL, {
      params: {
        confmKey: JUSO_API_KEY,
        currentPage: currentPage,
        countPerPage: countPerPage,
        keyword: keyword,
        resultType: 'json' // Request JSON response
      }
    });

    // Check for API-level errors
    if (response.data.results.common.errorCode !== '0') {
      return res.status(400).json({
        error: response.data.results.common.errorMessage
      });
    }

    res.json(response.data);

  } catch (error) {
    console.error('Juso API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch address data' });
  }
});

// --- NTS API Proxy (국세청 사업자 진위확인 및 상태조회) ---

// SECURITY: Store this in an environment variable in production
const NTS_API_KEY = process.env.NTS_API_KEY || "eba26431906495f0fee56a259ec7e6071dbf531539f00be7cf604a65f492fcf5";

// Helper to get the service key (handle encoding issues)
const getServiceKey = () => {
  // If the key already contains '%', it's likely encoded.
  // If not, we should encode it because it's being passed in the URL query string.
  return NTS_API_KEY.includes('%') ? NTS_API_KEY : encodeURIComponent(NTS_API_KEY);
};

// 1. Status Inquiry (상태 조회)
app.post('/api/nts/status', async (req, res) => {
  try {
    const serviceKey = getServiceKey();

    console.log(`[NTS Status] Requesting: ${`https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${serviceKey.substring(0, 10)}...`}`);
    console.log(`[NTS Status] Body:`, JSON.stringify(req.body));

    const response = await axios.post(
      `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${serviceKey}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`[NTS Status] Success:`, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('NTS Status API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data));
    }
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch business status',
      details: error.response?.data || error.message
    });
  }
});

// 2. Authenticity Verification (진위 확인)
app.post('/api/nts/validate', async (req, res) => {
  try {
    const serviceKey = getServiceKey();
    const response = await axios.post(
      `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${serviceKey}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('NTS Validate API Error:', error.message);
    if (error.response) {
      console.error('Error Details:', error.response.data);
    }
    res.status(error.response?.status || 500).json({
      error: 'Failed to validate business info',
      details: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Address Proxy Server running on port ${PORT}`);
});