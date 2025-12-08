/**
 * Helper script to add a new user to Google Sheets
 * Usage: npx ts-node scripts/addUser.ts
 */

import { appendSheetRow } from '../src/lib/google/sheets';
import bcrypt from 'bcryptjs';

async function addUser() {
  const email = 'admin@test.com';
  const name = 'Admin User';
  const password = 'password123';
  const role = 'admin';
  const department = '-';
  const status = 'active';

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Add to Google Sheet
  const sheetId = process.env.USERS_SHEET_ID;
  if (!sheetId) {
    console.error('❌ USERS_SHEET_ID not found in environment variables');
    process.exit(1);
  }

  const result = await appendSheetRow(
    sheetId,
    'Users!A:G',
    [[email, name, hashedPassword, role, department, status]]
  );

  if (result.success) {
    console.log('✅ User added successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);
  } else {
    console.error('❌ Failed to add user:', result.error);
  }
}

addUser();
