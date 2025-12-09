import bcrypt from 'bcryptjs';

/**
 * Script to add a Super Admin user to the Users sheet
 * Run this script once to create the initial super admin account
 */

const SAMPLE_SUPER_ADMIN = {
  email: 'superadmin@easyerp.com',
  name: 'System Administrator',
  password: 'SuperAdmin@2024', // Change this to a secure password
  role: 'super-admin',
  status: 'active',
};

async function addSuperAdmin() {
  try {
    console.log('🔐 Creating Super Admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(SAMPLE_SUPER_ADMIN.password, 10);
    
    console.log('\n✅ Super Admin Credentials:');
    console.log('============================');
    console.log('Email:', SAMPLE_SUPER_ADMIN.email);
    console.log('Password:', SAMPLE_SUPER_ADMIN.password);
    console.log('Role:', SAMPLE_SUPER_ADMIN.role);
    console.log('Hashed Password:', hashedPassword);
    console.log('============================\n');
    
    console.log('📝 Add the following row to your Users Google Sheet:');
    console.log('\nColumns: ID | Email | Name | Password | Role | Department | Status');
    console.log(`Data: SA001 | ${SAMPLE_SUPER_ADMIN.email} | ${SAMPLE_SUPER_ADMIN.name} | ${hashedPassword} | ${SAMPLE_SUPER_ADMIN.role} | System | ${SAMPLE_SUPER_ADMIN.status}`);
    
    console.log('\n🔒 Security Note:');
    console.log('- Change the default password immediately after first login');
    console.log('- Keep super admin credentials secure');
    console.log('- Use a password manager for storing credentials');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  }
}

// Run the script
addSuperAdmin();
