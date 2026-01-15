const authService = require('./server/services/authService');
const { db } = require('./server/db-init');

async function seedAdmin() {
  console.log('🔒 Seeding Admin User...');

  try {
    // Check if admin already exists
    const existingAdmin = await authService.findUserById('admin');
    if (existingAdmin) {
      console.log('✅ Admin user already exists in database.');
      return;
    }

    console.log('Creating new admin user...');

    // Create admin with the same default password 'password123!' but hashed
    const adminUser = await authService.register({
      id: 'admin',
      password: 'password123!',
      name: '시스템 관리자',
      role: 'admin',
      companyName: 'Headquarters',
      businessInfo: { c_nm: 'SYSTEM ADMIN' }
    });

    // Manually force role to 'admin' just in case register defaults to something else
    // (Though we passed role: 'admin', authService might sanitize it depending on implementation)
    // Checking authService.register implementation:
    // It takes rest.role. But usually registration might force 'employee' or 'boss'.
    // Let's verify and update directly if needed.

    db.prepare("UPDATE users SET role = 'admin' WHERE id = 'admin'").run();

    console.log('✅ Admin user created successfully.');
    console.log('   ID: admin');
    console.log('   PW: password123!');
    console.log('   Role: admin');

  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
  }
}

seedAdmin();
