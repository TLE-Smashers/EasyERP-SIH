import bcrypt from 'bcryptjs';

const storedHash = '$2b$10$jaDFylGmzBBey7HkDv9/ee1bCbq7ulIslq9cOorJN09my0QqKby56';

const passwordsToTest = [
  '12345',
  'password123',
  'admin123',
  'admin',
];

console.log('Testing passwords against stored hash...\n');

for (const password of passwordsToTest) {
  const matches = bcrypt.compareSync(password, storedHash);
  console.log(`Password "${password}": ${matches ? '✅ MATCHES!' : '❌ Does not match'}`);
}
