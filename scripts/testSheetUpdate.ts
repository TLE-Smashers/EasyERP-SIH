/**
 * Test Script to Debug Sheet Updates
 * Run this to verify Google Sheets connection and updates
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testSheetUpdate() {
  console.log('🧪 Testing Google Sheets Update...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_SHEET_NAME:', process.env.GOOGLE_SHEET_NAME || '❌ Not set (will default to "Admissions")');
  console.log('GOOGLE_SERVICE_ACCOUNT_KEY:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? '✅ Set' : '❌ Missing');
  console.log('');

  try {
    // Import after env is loaded
    const { updateApplication, fetchApplicationByRow } = await import('../src/lib/google/sheets.admission');
    
    console.log('📖 Step 1: Fetching row 2 (first application)...');
    const app = await fetchApplicationByRow(2);
    
    if (!app) {
      console.error('❌ No application found at row 2');
      console.log('\n💡 Tip: Make sure you have data in row 2 of your Admissions sheet');
      return;
    }
    
    console.log('✅ Found application:', app.id);
    console.log('   Name:', app.personalDetails.fullName);
    console.log('   Status:', app.applicationStatus);
    console.log('   Verified:', app.documentsVerified);
    console.log('');
    
    console.log('✏️  Step 2: Testing update (verifying documents)...');
    await updateApplication(2, {
      documentsVerified: true,
      verifiedBy: 'test@example.com',
      verificationDate: new Date().toISOString(),
      applicationStatus: 'documents_verified'
    });
    
    console.log('✅ Update sent successfully!');
    console.log('');
    
    console.log('🔍 Step 3: Fetching again to verify update...');
    const updatedApp = await fetchApplicationByRow(2);
    
    if (!updatedApp) {
      console.error('❌ Failed to fetch updated application');
      return;
    }
    
    console.log('Updated application:');
    console.log('   Status:', updatedApp.applicationStatus);
    console.log('   Verified:', updatedApp.documentsVerified);
    console.log('   Verified By:', updatedApp.verifiedBy);
    console.log('   Verified Date:', updatedApp.verificationDate);
    console.log('');
    
    if (updatedApp.documentsVerified && updatedApp.applicationStatus === 'documents_verified') {
      console.log('✅ ✅ ✅ SUCCESS! Updates are working correctly! ✅ ✅ ✅');
    } else {
      console.log('⚠️  Update was sent but values might not have changed.');
      console.log('   Check your Google Sheet manually to see if columns AD, AE, AF, AG were updated.');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Full error:', error);
    console.error('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check if GOOGLE_SHEET_NAME is set to "Admissions" in .env.local');
    console.log('2. Verify the sheet has the correct column structure (37 columns A-AK)');
    console.log('3. Check if the service account has edit permissions on the sheet');
    console.log('4. Verify column headers match exactly (case-sensitive):');
    console.log('   timestamp, fullName, email, ... applicationStatus, documentsVerified, verifiedBy, verifiedDate');
  }
}

testSheetUpdate();
