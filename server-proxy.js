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

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Allow requests from your frontend domain
app.use(cors());

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Address Proxy Server running on port ${PORT}`);
});