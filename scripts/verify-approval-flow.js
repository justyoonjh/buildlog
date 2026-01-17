import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api', // Try localhost:3000 fallback
  validateStatus: () => true // Handle 403/401 manually without throwing
});

// Helper to extract cookies
let sessionCookie = null;
function setCookie(res) {
  if (res.headers['set-cookie']) {
    // axios returns array for set-cookie in node
    sessionCookie = res.headers['set-cookie'];
  }
}

// Helper to get headers with cookie
function getHeaders() {
  return sessionCookie ? { Cookie: sessionCookie } : {};
}

async function runTest() {
  try {
    console.log('🚀 Starting Employee Approval Flow Verification (Manual Cookie Handling)...');

    // 1. Register Boss
    const bossId = `boss_${Date.now()}`;
    console.log(`\n1. Registering Boss: ${bossId}`);
    const bossRes = await client.post('/auth/register', {
      id: bossId,
      password: 'password123!',
      name: 'Test Boss',
      role: 'boss',
      companyName: 'Test Corp',
      businessNumber: '123-45-67890'
    });

    if (bossRes.data.success) {
      setCookie(bossRes);
      console.log('✅ Boss Registered. Company Code:', bossRes.data.companyCode);
    } else {
      throw new Error(`Boss registration failed: ${bossRes.data.message}`);
    }
    const GeneratedCompanyCode = bossRes.data.companyCode;

    // Logout Boss (Clear cookie)
    sessionCookie = null;

    // 2. Register Employee
    const empId = `emp_${Date.now()}`;
    console.log(`\n2. Registering Employee: ${empId}`);

    const empRes = await client.post('/auth/register', {
      id: empId,
      password: 'password123!',
      name: 'Test Employee',
      role: 'employee',
      companyCode: GeneratedCompanyCode,
      department: 'Engineering',
      position: 'Developer'
    });

    if (empRes.data.success) {
      console.log('✅ Employee Registered.');
    } else {
      throw new Error(`Employee registration failed: ${empRes.data.message}`);
    }

    // 3. Try to Login as Employee (Should Fail)
    console.log('\n3. Attempting Employee Login (Should be Pending)');
    const loginFailRes = await client.post('/auth/login', {
      id: empId,
      password: 'password123!'
    });

    if (loginFailRes.status === 403) {
      console.log('✅ Employee login blocked with 403 as expected.');
      console.log('   Message:', loginFailRes.data.message);
    } else if (loginFailRes.data.success) {
      console.error('❌ Employee login succeeded but should have failed!');
      process.exit(1);
    } else {
      console.error(`❌ Unexpected status: ${loginFailRes.status}`);
      process.exit(1);
    }

    // 4. Login as Boss
    console.log('\n4. Logging in as Boss to Approve');
    const bossLoginRes = await client.post('/auth/login', {
      id: bossId,
      password: 'password123!'
    });

    if (bossLoginRes.data.success) {
      setCookie(bossLoginRes);
      console.log('✅ Boss Logged in.');
    } else {
      throw new Error('Boss login failed');
    }

    // 5. Approve Employee
    console.log(`\n5. Approving Employee: ${empId}`);

    // Check list
    const membersRes = await client.get('/auth/company/members', { headers: getHeaders() });

    // Debug: log members if empty or not found
    if (!membersRes.data.members || membersRes.data.members.length === 0) {
      console.log('DEBUG: Members list is empty:', membersRes.data);
    }

    const pendingMember = membersRes.data.members.find(m => m.id === empId);

    if (!pendingMember) throw new Error('Pending member not found in list');
    if (pendingMember.status !== 'pending') throw new Error(`Member status is ${pendingMember.status}, expected pending`);
    console.log('✅ Pending member found in list.');

    // Approve
    const approveRes = await client.post('/auth/approve', { userId: empId }, { headers: getHeaders() });
    if (!approveRes.data.success) throw new Error('Approval call failed');
    console.log('✅ Employee Approved.');

    // Logout Boss
    sessionCookie = null;

    // 6. Login as Employee (Should Succeed)
    console.log('\n6. Attempting Employee Login (Should Succeed)');
    const loginSuccessRes = await client.post('/auth/login', {
      id: empId,
      password: 'password123!'
    });

    if (loginSuccessRes.data.success) {
      console.log('✅ Employee Login Successful!');
      console.log('   User Status:', loginSuccessRes.data.user.status);
    } else {
      throw new Error(`Employee login failed after approval: ${loginSuccessRes.data.message}`);
    }

    console.log('\n🎉 ALL TESTS PASSED');

  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    if (error.stack) console.error(error.stack);
    if (error.response) console.error('Response data:', error.response.data);
    process.exit(1);
  }
}

runTest();
