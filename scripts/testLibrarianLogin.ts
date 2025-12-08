/**
 * Test Librarian Login
 * Tests if librarian@test.com can be found in Google Sheets
 * Run with: npx tsx scripts/testLibrarianLogin.ts
 */

import { getUserByEmail } from '../src/actions/auth/getUserByEmail';
import bcrypt from 'bcryptjs';

async function testLibrarianLogin() {
  console.log('🔍 Testing Librarian Login...\n');
  
  try {
    // Test 1: Check if librarian user exists
    console.log('📧 Looking up librarian@test.com in Google Sheet...');
    const user = await getUserByEmail('librarian@test.com');
    
    if (!user) {
      console.error('❌ FAILED: librarian@test.com not found in Google Sheet!');
      console.log('\n📝 Please add this user to your Google Sheet (Users tab):');
      console.log('   Email: librarian@test.com');
      console.log('   Password: (run addLibraryUsers.ts to get hashed password)');
      console.log('   Name: Test Librarian');
      console.log('   Role: librarian');
      console.log('   Status: active');
      return;
    }
    
    console.log('✅ User found!');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Status:', user.status);
    
    // Test 2: Verify role is correct
    if (user.role !== 'librarian') {
      console.error(`\n❌ FAILED: User role is "${user.role}" but should be "librarian"`);
      console.log('   Please update the Role column in Google Sheet to: librarian');
      return;
    }
    console.log('✅ Role is correct: librarian');
    
    // Test 3: Verify status is active
    if (user.status !== 'active') {
      console.error(`\n❌ FAILED: User status is "${user.status}" but should be "active"`);
      console.log('   Please update the Status column in Google Sheet to: active');
      return;
    }
    console.log('✅ Status is active');
    
    // Test 4: Test password verification
    console.log('\n🔐 Testing password verification...');
    
    if (!user.password) {
      console.error('❌ FAILED: User password hash is missing in Google Sheet');
      console.log('   Please run addLibraryUsers.ts to set the password hash');
      return;
    }
    
    const testPassword = '12345';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    if (!isValid) {
      console.error('❌ FAILED: Password "12345" does not match stored hash');
      console.log('   Please regenerate the password hash using addLibraryUsers.ts');
      return;
    }
    console.log('✅ Password verification successful');
    
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('   Librarian should be able to login with:');
    console.log('   Email: librarian@test.com');
    console.log('   Password: 12345');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    console.log('\nPlease check:');
    console.log('1. USERS_SHEET_ID is set in .env.local');
    console.log('2. Google Sheets API credentials are configured');
    console.log('3. The Users tab exists in your Google Sheet');
  }
}

testLibrarianLogin();
