import { config } from 'dotenv';
import { resolve } from 'path';
import { getSheetData } from '../src/lib/google/sheets';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testConnection() {
  console.log('Testing Google Sheets connection...\n');
  
  const sheetId = process.env.USERS_SHEET_ID;
  console.log('Sheet ID:', sheetId);
  
  if (!sheetId) {
    console.error('❌ USERS_SHEET_ID not found in environment');
    return;
  }
  
  console.log('\n1. Testing with "Sheet1" range...');
  try {
    const data1 = await getSheetData(sheetId, 'Sheet1!A:G');
    console.log('✅ Success with Sheet1!');
    console.log('Rows found:', data1.length);
    if (data1.length > 0) {
      console.log('First row:', data1[0]);
    }
  } catch (error: any) {
    console.log('❌ Failed with Sheet1');
    console.log('Error:', error.message);
  }
  
  console.log('\n2. Testing with "Users" range...');
  try {
    const data2 = await getSheetData(sheetId, 'Users!A:G');
    console.log('✅ Success with Users!');
    console.log('Rows found:', data2.length);
    if (data2.length > 0) {
      console.log('First row:', data2[0]);
    }
  } catch (error: any) {
    console.log('❌ Failed with Users');
    console.log('Error:', error.message);
  }
  
  console.log('\n3. Testing without range (all data)...');
  try {
    const data3 = await getSheetData(sheetId, 'A:G');
    console.log('✅ Success without sheet name!');
    console.log('Rows found:', data3.length);
    if (data3.length > 0) {
      console.log('First row:', data3[0]);
    }
  } catch (error: any) {
    console.log('❌ Failed without sheet name');
    console.log('Error:', error.message);
  }
}

testConnection().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
