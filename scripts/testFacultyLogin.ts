import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Import after loading env
import { getUserByEmail } from '../src/actions/auth/getUserByEmail';

async function testFacultyLogin() {
    console.log('🔍 Testing Faculty Login Credentials\n');
    console.log('═══════════════════════════════════════════════════\n');

    const email = 'faculty@test.com';
    const password = '12345';

    try {
        // Step 1: Check environment variables
        console.log('Step 1: Checking environment variables...');
        if (!process.env.USERS_SHEET_ID) {
            console.error('❌ USERS_SHEET_ID not set in .env.local');
            return;
        }
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            console.error('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL not set in .env.local');
            return;
        }
        console.log('✅ Environment variables configured\n');

        // Step 2: Fetch user from Google Sheets
        console.log(`Step 2: Fetching user: ${email}`);
        const user = await getUserByEmail(email);

        if (!user) {
            console.error(`❌ User not found: ${email}`);
            console.log('\n📋 Possible issues:');
            console.log('1. User does not exist in Google Sheets');
            console.log('2. Sheet name might not be "Users"');
            console.log('3. Email might be spelled differently');
            return;
        }

        console.log('✅ User found in Google Sheets');
        console.log('\n📋 User Details:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Department: ${user.department || 'N/A'}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);

        // Step 3: Check account status
        console.log('\nStep 3: Checking account status...');
        if (user.status !== 'active') {
            console.error(`❌ Account is ${user.status}`);
            return;
        }
        console.log('✅ Account is active\n');

        // Step 4: Verify password
        console.log('Step 4: Verifying password...');
        if (!user.password) {
            console.error('❌ Password not set in Google Sheets');
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.error('❌ Password does not match');
            console.log('\n📋 Debug Info:');
            console.log(`   Trying password: "${password}"`);
            console.log(`   Stored hash: ${user.password.substring(0, 30)}...`);
            console.log('\n💡 To fix: Run scripts/hashPassword.ts to generate correct hash for "12345"');
            return;
        }
        console.log('✅ Password matches\n');

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ ALL CHECKS PASSED! Login should work.');
        console.log('═══════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ Error during test:');
        console.error(error);
    }
}

testFacultyLogin();
