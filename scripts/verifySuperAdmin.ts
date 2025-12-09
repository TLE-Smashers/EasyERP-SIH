import { getUserByEmail } from '@/actions/auth/getUserByEmail';

/**
 * Script to verify super admin user exists
 */

async function verifySuperAdmin() {
  try {
    console.log('🔍 Checking for super admin user...\n');

    const email = 'superadmin@easyerp.com';
    console.log(`Looking for user: ${email}\n`);

    const user = await getUserByEmail(email);

    if (!user) {
      console.log('❌ Super admin user NOT FOUND!\n');
      console.log('Please add a user to your Users sheet with:');
      console.log('- Email: superadmin@easyerp.com');
      console.log('- Role: super-admin (NOT admin)');
      console.log('- Status: active');
      console.log('\nRun: npx tsx scripts/addSuperAdmin.ts to get the hashed password');
      return;
    }

    console.log('✅ Super admin user FOUND!\n');
    console.log('User details:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- Status:', user.status);
    console.log('- Department:', user.department || 'N/A');

    if (user.role !== 'super-admin') {
      console.log('\n⚠️  WARNING: User role is not "super-admin"!');
      console.log('Current role:', user.role);
      console.log('Expected role: super-admin');
      console.log('\nPlease update the role in your Users sheet to: super-admin');
    }

    if (user.status !== 'active') {
      console.log('\n⚠️  WARNING: User status is not "active"!');
      console.log('Current status:', user.status);
      console.log('Please update the status in your Users sheet to: active');
    }

    if (user.role === 'super-admin' && user.status === 'active') {
      console.log('\n✅ Super admin user is properly configured!');
      console.log('You should be able to login at: http://localhost:3000/super-admin-login');
    }

  } catch (error) {
    console.error('❌ Error verifying super admin:', error);
  }
}

// Run the verification
verifySuperAdmin();
