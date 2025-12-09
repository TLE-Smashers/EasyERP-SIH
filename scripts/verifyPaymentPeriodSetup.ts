/**
 * Debug Script - Verify Payment Period Setup
 * Run this to check if PaymentPeriods sheet exists and has correct structure
 */

import { google } from 'googleapis';
import type { Auth } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'PaymentPeriods';

const REQUIRED_HEADERS = [
  'periodId',
  'type',
  'title',
  'description',
  'academicYear',
  'semester',
  'startDate',
  'endDate',
  'status',
  'targetCourses',
  'targetBranches',
  'targetYears',
  'tuitionFee',
  'amalgamatedFund',
  'sportsFee',
  'cautionMoney',
  'transferCertificateFee',
  'libraryCardReissueFee',
  'penaltyFee',
  'otherFees',
  'transactionCharges',
  'totalAmount',
  'createdBy',
  'createdDate',
  'updatedBy',
  'updatedDate',
];

async function verifyPaymentPeriodsSheet() {
  console.log('🔍 Verifying PaymentPeriods Sheet Setup...\n');

  try {
    // Get auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as Auth.OAuth2Client });

    // Check if sheet exists
    console.log('📊 Checking if PaymentPeriods sheet exists...');
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!1:1`,
      });

      const headers = response.data.values?.[0] || [];
      
      if (headers.length === 0) {
        console.error('❌ ERROR: PaymentPeriods sheet exists but has no headers!');
        console.log('\n📝 Please add the following headers in Row 1:');
        console.log(REQUIRED_HEADERS.join('\t'));
        return;
      }

      console.log('✅ PaymentPeriods sheet exists!');
      console.log(`   Found ${headers.length} columns\n`);

      // Verify headers
      console.log('🔎 Verifying column headers...');
      let allCorrect = true;
      const missingHeaders: string[] = [];
      const extraHeaders: string[] = [];

      REQUIRED_HEADERS.forEach((required, index) => {
        const actual = headers[index];
        if (actual !== required) {
          allCorrect = false;
          if (!actual) {
            missingHeaders.push(`Column ${String.fromCharCode(65 + index)}: Missing "${required}"`);
          } else {
            missingHeaders.push(`Column ${String.fromCharCode(65 + index)}: Expected "${required}", found "${actual}"`);
          }
        }
      });

      if (headers.length > REQUIRED_HEADERS.length) {
        for (let i = REQUIRED_HEADERS.length; i < headers.length; i++) {
          extraHeaders.push(`Column ${String.fromCharCode(65 + i)}: Extra header "${headers[i]}"`);
        }
      }

      if (allCorrect) {
        console.log('✅ All headers are correct!\n');
      } else {
        console.error('❌ Header mismatch found:\n');
        if (missingHeaders.length > 0) {
          console.error('Missing or incorrect headers:');
          missingHeaders.forEach(h => console.error(`   ${h}`));
        }
        if (extraHeaders.length > 0) {
          console.error('\nExtra headers:');
          extraHeaders.forEach(h => console.error(`   ${h}`));
        }
        console.log('\n📝 Expected headers (copy and paste into Row 1):');
        console.log(REQUIRED_HEADERS.join('\t'));
        return;
      }

      // Check for existing periods
      console.log('📊 Checking for existing payment periods...');
      const periodsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!2:1000`,
      });

      const rows = periodsResponse.data.values || [];
      console.log(`   Found ${rows.length} payment period(s)\n`);

      if (rows.length > 0) {
        console.log('Payment Periods:');
        rows.forEach((row, index) => {
          const periodId = row[0] || 'N/A';
          const title = row[2] || 'N/A';
          const status = row[8] || 'N/A';
          const startDate = row[6] || 'N/A';
          const endDate = row[7] || 'N/A';
          console.log(`   ${index + 1}. ${title}`);
          console.log(`      ID: ${periodId}`);
          console.log(`      Status: ${status}`);
          console.log(`      Period: ${startDate} to ${endDate}`);
        });
      } else {
        console.log('⚠️  No payment periods found.');
        console.log('   Login as accountant and create your first payment period!');
      }

      console.log('\n✅ Setup verification complete!');
      console.log('\n📋 Next steps:');
      console.log('   1. Login as accountant: http://localhost:3000/login');
      console.log('   2. Go to: Dashboard → Accounts → Payment Periods');
      console.log('   3. Click "Create Payment Period" button');
      console.log('   4. Fill in the form and submit');
      console.log('   5. Login as student to see the payment option');

    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('Unable to parse')) {
        console.error('❌ ERROR: PaymentPeriods sheet does not exist!\n');
        console.log('📝 To fix this:');
        console.log('   1. Open your Google Sheet');
        console.log(`   2. Create a new sheet named exactly: "PaymentPeriods"`);
        console.log('   3. Add the following headers in Row 1:\n');
        console.log(REQUIRED_HEADERS.join('\t'));
        console.log('\n   Or copy the tab-separated headers from PAYMENT_PERIOD_SETUP_GUIDE.md');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
    console.error('\nPlease check:');
    console.error('   - GOOGLE_SHEET_ID is set in .env.local');
    console.error('   - GOOGLE_SERVICE_ACCOUNT_EMAIL is set');
    console.error('   - GOOGLE_PRIVATE_KEY is set');
    console.error('   - Service account has access to the Google Sheet');
  }
}

// Run verification
verifyPaymentPeriodsSheet();
