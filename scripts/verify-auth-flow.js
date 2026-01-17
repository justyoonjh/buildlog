const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3001/api/auth';

// Test User Data
const TEST_USER = {
  id: `test_${Date.now()}`,
  password: 'password123',
  name: 'Test Boss',
  role: 'boss',
  phone: '010-1234-5678',
  companyName: '(주)테스트건설',
  businessNumber: '123-45-67890',
  businessInfo: {
    b_no: '1234567890',
    c_nm: 'Test Boss',
    s_nm: '(주)테스트건설',
    start_dt: '20230101',
    p_nm: 'Test Boss'
  },
  address: {
    zipCode: '12345',
    address: 'Seoul',
    detailAddress: 'Gangnam'
  }
};

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  validateStatus: () => true // Don't throw on error status
});

async function runAuthTest() {
  console.log('🚀 Starting Fundamental Auth Verification...\n');
  console.log(`Target: ${BASE_URL}\n`);

  // 1. Register
  console.log(`1️⃣  Testing Registration (ID: ${TEST_USER.id})...`);
  const regRes = await client.post('/register', TEST_USER);

  if (regRes.status === 200) {
    console.log('✅ Registration Successful!');
  } else {
    console.log(`❌ Registration Failed (Status: ${regRes.status})`);
    console.log('Error Details:', JSON.stringify(regRes.data, null, 2));
    // If 400, this is the Zod validation error we are looking for
    return;
  }

  // 2. Login
  console.log(`\n2️⃣  Testing Login...`);
  const loginRes = await client.post('/login', {
    id: TEST_USER.id,
    password: TEST_USER.password
  });

  if (loginRes.status === 200) {
    console.log('✅ Login Successful!');
    console.log('Cookie received:', loginRes.headers['set-cookie']);
  } else {
    console.log(`❌ Login Failed (Status: ${loginRes.status})`);
    console.log('Error Details:', JSON.stringify(loginRes.data, null, 2));
    return;
  }

  // 3. Session Check (Me)
  // Extract cookie for next request
  const cookie = loginRes.headers['set-cookie'];

  console.log(`\n3️⃣  Testing Session (Get /me)...`);
  const meRes = await client.get('/me', {
    headers: { Cookie: cookie }
  });

  if (meRes.status === 200 && meRes.data.authenticated) {
    console.log('✅ Session Verified!');
    console.log('User:', meRes.data.user.id);
  } else {
    console.log(`❌ Session Verification Failed`);
    console.log('Response:', JSON.stringify(meRes.data, null, 2));
  }

  console.log('\n✨ Diagnostic Complete.');
}

runAuthTest();
