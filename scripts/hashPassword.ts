import bcrypt from 'bcryptjs';

/**
 * Utility script to hash passwords for storing in Google Sheets
 * Usage: node scripts/hashPassword.js <password>
 */

const password = process.argv[2];

if (!password) {
  console.error('❌ Please provide a password as an argument');
  console.log('Usage: node scripts/hashPassword.js <password>');
  process.exit(1);
}

async function hashPassword() {
  const hashed = await bcrypt.hash(password, 10);
  console.log('\n✅ Password hashed successfully!');
  console.log('\n📋 Hashed Password (copy this to Google Sheet):');
  console.log(hashed);
  console.log('\n');
}

hashPassword();
