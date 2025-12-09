/**
 * Helper script to add accountant user to Google Sheets
 * Usage: npx tsx scripts/addAccountant.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { appendSheetRow } from '../src/lib/google/sheets';
import bcrypt from 'bcryptjs';

async function addAccountant() {
  const email = 'accountant@test.com';
  const name = 'Accountant User';
  const password = '12345';
  const role = 'accountant';
  const department = 'Accounts';
  const status = 'active';

  console.log('Adding accountant user...');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Role:', role);

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Add to Google Sheet
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) {
    console.error('❌ GOOGLE_SHEETS_ID not found in environment variables');
    process.exit(1);
  }

  try {
    const result = await appendSheetRow(
      sheetId,
      'Users!A:G',
      [[email, name, hashedPassword, role, department, status]]
    );

    if (result.success) {
      console.log('✅ Accountant user added successfully!');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`Role: ${role}`);
      console.log('');
      console.log('You can now login with these credentials');
    } else {
      console.error('❌ Failed to add user:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addAccountant();
